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
use Flarum\Notification\Notification;
use FoF\UserRequest\UsernameRequest;

class ApiActivityGraphController implements RequestHandlerInterface
{
    protected $settings;
    protected $extensionManager;

    private $categories = ['comments', 'discussions', 'likes', 'custom_levels_exp_logs', 'invite_user_invites', 'store_purchases', 'polls_create_polls', 'polls_votes', 'username_requests_username', 'username_requests_nickname', 'best_answer_marked', 'badges_assigned', 'achievements_achieved', 'quest_done'];

    private $extensionMap = [
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

    private $modelMap;

    public function __construct(SettingsRepositoryInterface $settings, ExtensionManager $extensionManager)
    {
        $this->settings = $settings;
        $this->extensionManager = $extensionManager;

        $this->modelMap = [
            'comments' => CommentPost::where('number', '>', 1),
            'discussions' => Discussion::class,
            'likes' => DB::table('post_likes'),
            'custom_levels_exp_logs' => \FoskyM\CustomLevels\Model\ExpLog::class,
            'invite_user_invites' => \Xypp\InviteUser\InvitedUser::class,
            'store_purchases' => \Xypp\Store\PurchaseHistory::class,
            'polls_create_polls' => \FoF\Polls\Poll::class,
            'polls_votes' => \FoF\Polls\PollVote::class,
            'username_requests_username' => UsernameRequest::where('for_nickname', 0),
            'username_requests_nickname' => UsernameRequest::where('for_nickname', 1),
            'best_answer_marked' => [
                'class' => Discussion::class,
                'user_id' => 'best_answer_user_id'
            ],
            'badges_assigned' => [
                'class' => \V17Development\FlarumUserBadges\UserBadge\UserBadge::class,
                'created_at' => 'assigned_at'
            ],
            'achievements_achieved' => \Malago\Achievements\AchievementUser::class,
            'quest_done' => Notification::where('type', 'quest_done')
        ];
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

        foreach ($this->categories as $category) {
            if ($this->settings->get('foskym-activity-graph.count_' . $category)) {
                $this->processCategory($category, $begin, $end, $user_id, $total, $temp, $categories);
            }
        }

        $results = array_map(fn($key, $value) => [$key, $value], array_keys($temp), $temp);

        return new JsonResponse([
            'total' => $total,
            'data' => $results,
            'categories' => $categories
        ]);
    }

    private function processCategory($category, $begin, $end, $user_id, &$total, &$temp, &$categories)
    {
        if (isset($this->extensionMap[$category]) && !$this->extensionManager->isEnabled($this->extensionMap[$category])) {
            return;
        }

        $items = $this->getCategoryData($category, $begin, $end, $user_id);

        foreach ($items as $item) {
            $total += $item->total;
            $date = date('Y-m-d', strtotime($item->created_at));
            $temp[$date] = ($temp[$date] ?? 0) + $item->total;
            $categories[$category][$date] = $item->total;
        }
    }

    private function getCategoryData($category, $begin, $end, $user_id)
    {
        $model = $this->modelMap[$category];
        $column_user_id = 'user_id';
        $column_created_at = 'created_at';

        if (is_array($model) && isset($model['class'])) {
            $column_user_id = $model['user_id'] ?? $column_user_id;
            $column_created_at = $model['created_at'] ?? $column_created_at;
            $model = $model['class'];
        }

        $query = is_object($model) ? $model : $model::query();

        $query->whereBetween($column_created_at, [$begin, $end])
            ->where($column_user_id, $user_id)
            ->select($column_created_at, DB::raw('COUNT(*) as total'))
            ->groupBy(DB::raw('DATE_FORMAT(' . $column_created_at . ', "%Y-%m-%d")'));

        try {
            return $query->get();
        } catch (\Exception $e) {
            return collect();
        }
    }
}