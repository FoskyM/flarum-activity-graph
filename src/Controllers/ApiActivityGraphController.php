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
// use Illuminate\Support\Facades\DB;
use Illuminate\Database\Capsule\Manager as DB;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Laminas\Diactoros\Response\JsonResponse;
use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\Extension\ExtensionManager;
use Flarum\Group\Group;
use Flarum\Post\Post;
use Flarum\Post\CommentPost;
use Flarum\Discussion\Discussion;
use FoskyM\CustomLevels\Model\ExpLog;
use Xypp\InviteUser\InvitedUser;
use Xypp\Store\PurchaseHistory;

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

        $count_comments = $this->settings->get('foskym-activity-graph.count_comments');
        $count_discussions = $this->settings->get('foskym-activity-graph.count_discussions');
        $count_likes = $this->settings->get('foskym-activity-graph.count_likes');
        $count_custom_levels_exp_logs = $this->settings->get('foskym-activity-graph.count_custom_levels_exp_logs');
        $count_invite_user_invites = $this->settings->get('foskym-activity-graph.count_invite_user_invites');
        $count_store_purchases = $this->settings->get('foskym-activity-graph.count_store_purchases');

        if ($count_comments) {
            $comments = CommentPost::whereBetween('created_at', [$begin, $end])
                ->where('user_id', $user_id)
                ->where('number', '>', 1)
                ->select('created_at', DB::raw('COUNT(*) as total'))
                ->groupBy(DB::raw('DATE_FORMAT(created_at, "%Y-%m-%d")'))
                ->get();

            $comments->map(function ($item) use (&$total, &$temp, &$categories) {
                $total += $item->total;
                $date = date('Y-m-d', strtotime($item->created_at));
                isset($temp[$date]) ?
                    $temp[$date] += $item->total :
                    $temp[$date] = $item->total;
                $categories['comments'][$date] = $item->total;
            });
        }

        if ($count_discussions) {
            $discussions = Discussion::whereBetween('created_at', [$begin, $end])
                ->where('user_id', $user_id)
                ->select('created_at', DB::raw('COUNT(*) as total'))
                ->groupBy(DB::raw('DATE_FORMAT(created_at, "%Y-%m-%d")'))
                ->get();

            $discussions->map(function ($item) use (&$total, &$temp, &$categories) {
                $total += $item->total;
                $date = date('Y-m-d', strtotime($item->created_at));
                isset($temp[$date]) ?
                    $temp[$date] += $item->total :
                    $temp[$date] = $item->total;
                $categories['discussions'][$date] = $item->total;
            });
        }

        if ($count_likes) {
            $likes = DB::table('post_likes')
                ->whereBetween('created_at', [$begin, $end])
                ->where('user_id', $user_id)
                ->select('created_at', DB::raw('COUNT(*) as total'))
                ->groupBy(DB::raw('DATE_FORMAT(created_at, "%Y-%m-%d")'))
                ->get();

            $likes->map(function ($item) use (&$total, &$temp, &$categories) {
                $total += $item->total;
                $date = date('Y-m-d', strtotime($item->created_at));
                isset($temp[$date]) ?
                    $temp[$date] += $item->total :
                    $temp[$date] = $item->total;
                $categories['likes'][$date] = $item->total;
            });
        }

        if ($count_custom_levels_exp_logs) {
            if ($this->extensionManager->isEnabled('foskym-custom-levels')) {
                $logs = ExpLog::whereBetween('created_at', [$begin, $end])
                    ->where('user_id', $user_id)
                    ->select('created_at', DB::raw('COUNT(*) as total'))
                    ->groupBy(DB::raw('DATE_FORMAT(created_at, "%Y-%m-%d")'))
                    ->get();

                $logs->map(function ($item) use (&$total, &$temp, &$categories) {
                    $total += $item->total;
                    $date = date('Y-m-d', strtotime($item->created_at));
                    isset($temp[$date]) ?
                        $temp[$date] += $item->total :
                        $temp[$date] = $item->total;
                    $categories['custom_levels_exp_logs'][$date] = $item->total;
                });
            }
        }

        if ($count_invite_user_invites) {
            if ($this->extensionManager->isEnabled('xypp-invite-user')) {
                $invites = InvitedUser::whereBetween('created_at', [$begin, $end])
                    ->where('user_id', $user_id)
                    ->select('created_at', DB::raw('COUNT(*) as total'))
                    ->groupBy(DB::raw('DATE_FORMAT(created_at, "%Y-%m-%d")'))
                    ->get();

                $invites->map(function ($item) use (&$total, &$temp, &$categories) {
                    $total += $item->total;
                    $date = date('Y-m-d', strtotime($item->created_at));
                    isset($temp[$date]) ?
                        $temp[$date] += $item->total :
                        $temp[$date] = $item->total;
                    $categories['invite_user_invites'][$date] = $item->total;
                });
            }
        }

        if ($count_store_purchases) {
            if ($this->extensionManager->isEnabled('xypp-store')) {
                $invites = PurchaseHistory::whereBetween('created_at', [$begin, $end])
                    ->where('user_id', $user_id)
                    ->select('created_at', DB::raw('COUNT(*) as total'))
                    ->groupBy(DB::raw('DATE_FORMAT(created_at, "%Y-%m-%d")'))
                    ->get();

                $invites->map(function ($item) use (&$total, &$temp, &$categories) {
                    $total += $item->total;
                    $date = date('Y-m-d', strtotime($item->created_at));
                    isset($temp[$date]) ?
                        $temp[$date] += $item->total :
                        $temp[$date] = $item->total;
                    $categories['store_purchases'][$date] = $item->total;
                });
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
}
