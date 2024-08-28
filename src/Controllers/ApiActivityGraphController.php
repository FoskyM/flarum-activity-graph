<?php

/*
 * This file is part of foskym/flarum-activity-graph.
 *
 * Copyright (c) 2024 FoskyM.
 *
 * For the full copyright and license information, please view the LICENSE.md
 * file that was distributed with this source code.
 */
namespace FoskyM\ActivityGraph\Controllers;

use Flarum\User\User;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Illuminate\Database\Capsule\Manager as DB;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Laminas\Diactoros\Response\JsonResponse;
use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\Extension\ExtensionManager;
use Flarum\Post\CommentPost;
use Flarum\Discussion\Discussion;
use FoskyM\CustomLevels\Model\ExpLog;
use Xypp\InviteUser\InvitedUser;
use Xypp\Store\PurchaseHistory;
use FoF\Polls\Poll;
use FoF\Polls\PollVote;
use FoF\UserRequest\UsernameRequest;
use V17Development\FlarumUserBadges\UserBadge\UserBadge;
use Malago\Achievements\AchievementUser;

class ApiActivityGraphController implements RequestHandlerInterface
{
    protected $settings;
    protected $extensionManager;

    public function __construct(SettingsRepositoryInterface $settings, ExtensionManager $extensionManager)
    {
        $this->settings = $settings;
        $this->extensionManager = $extensionManager;
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $actor = RequestUtil::getActor($request);
        $actor->assertRegistered();

        $params = $request->getQueryParams();
        $user_id = Arr::get($params, 'user_id', $actor->id);

        $year = Arr::get($params, 'year', date('Y'));
        $begin = $year . '-01-01';
        $end = ($year + 1) . '-01-01';

        $total = 0;
        $temp = [];
        $categories = [];

        $settings = [
            'comments' => 'foskym-activity-graph.count_comments',
            'discussions' => 'foskym-activity-graph.count_discussions',
            'likes' => 'foskym-activity-graph.count_likes',
            'custom_levels_exp_logs' => 'foskym-activity-graph.count_custom_levels_exp_logs',
            'invite_user_invites' => 'foskym-activity-graph.count_invite_user_invites',
            'store_purchases' => 'foskym-activity-graph.count_store_purchases',
            'polls_create_polls' => 'foskym-activity-graph.count_polls_create_polls',
            'polls_votes' => 'foskym-activity-graph.count_polls_votes',
            'username_requests_username' => 'foskym-activity-graph.count_username_requests_username',
            'username_requests_nickname' => 'foskym-activity-graph.count_username_requests_nickname',
            'best_answer_marked' => 'foskym-activity-graph.count_best_answer_marked',
            'badges_assigned' => 'foskym-activity-graph.count_badges_assigned',
            'achievements_achieved' => 'foskym-activity-graph.count_achievements_achieved',
        ];

        foreach ($settings as $category => $setting) {
            if ($this->settings->get($setting)) {
                $this->processCategory($category, $begin, $end, $user_id, $total, $temp, $categories);
            }
        }

        $results = [];

        foreach ($temp as $key => $value) {
            $results[] = [
                $key,
                $value
            ];
        }

        return new JsonResponse([
            'total' => $total,
            'data' => $results,
            'categories' => $categories
        ]);
    }

    private function processCategory($category, $begin, $end, $user_id, &$total, &$temp, &$categories)
    {
        $extensionMap = [
            'likes' => 'flarum-likes',
            'custom_levels_exp_logs' => 'foskym-custom-levels',
            'invite_user_invites' => 'xypp-invite-user',
            'store_purchases' => 'xypp-store',
            'polls_create_polls' => 'fof-polls',
            'polls_votes' => 'fof-polls',
            'username_requests_username' => 'fof-username-request',
            'username_requests_nickname' => 'fof-username-request',
            'best_answer_marked' => 'fof-best-answer',
            'badges_assigned' => 'v17development-user-badges',
            'achievements_achieved' => 'malago-achievements',
        ];

        if (isset($extensionMap[$category]) && !$this->extensionManager->isEnabled($extensionMap[$category])) {
            return;
        }

        $modelMap = [
            'comments' => CommentPost::class,
            'discussions' => Discussion::class,
            'likes' => DB::table('post_likes'),
            'custom_levels_exp_logs' => ExpLog::class,
            'invite_user_invites' => InvitedUser::class,
            'store_purchases' => PurchaseHistory::class,
            'polls_create_polls' => Poll::class,
            'polls_votes' => PollVote::class,
            'username_requests_username' => UsernameRequest::class,
            'username_requests_nickname' => UsernameRequest::class,
            'best_answer_marked' => Discussion::class,
            'badges_assigned' => UserBadge::class,
            'achievements_achieved' => AchievementUser::class,
        ];

        $model = $modelMap[$category];

        if ($category === 'likes') {
            $query = $model->whereBetween('created_at', [$begin, $end])
                ->where('user_id', $user_id);
        } elseif ($category === 'best_answer_marked') {
            $query = $model::whereBetween('created_at', [$begin, $end])
                ->where('best_answer_user_id', $user_id);
        } elseif ($category === 'badges_assigned') {
            $query = $model::whereBetween('assigned_at', [$begin, $end])
                ->where('user_id', $user_id);
        } else {
            $query = $model::whereBetween('created_at', [$begin, $end])
                ->where('user_id', $user_id);
        }

        if ($category === 'badges_assigned') {
            $query->select('assigned_at', DB::raw('COUNT(*) as total'))
                ->groupBy(DB::raw('DATE_FORMAT(assigned_at, "%Y-%m-%d")'));
        } else {
            $query->select('created_at', DB::raw('COUNT(*) as total'))
                ->groupBy(DB::raw('DATE_FORMAT(created_at, "%Y-%m-%d")'));
        }


        if ($category === 'comments') {
            $query->where('number', '>', 1);
        }

        if ($category === 'username_requests_username') {
            $query->where('for_nickname', 0);
        } elseif ($category === 'username_requests_nickname') {
            $query->where('for_nickname', 1);
        }

        $items = $query->get();

        $items->map(function ($item) use (&$total, &$temp, &$categories, $category) {
            $total += $item->total;
            $date = date('Y-m-d', strtotime($item->created_at ?? $item->assigned_at));
            isset($temp[$date]) ?
                $temp[$date] += $item->total :
                $temp[$date] = $item->total;
            $categories[$category][$date] = $item->total;
        });
    }
}