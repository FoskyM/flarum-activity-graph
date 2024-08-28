<?php

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
        ];

        $model = $modelMap[$category];

        if ($category === 'likes') {
            $query = $model->whereBetween('created_at', [$begin, $end])
                ->where('user_id', $user_id)
                ->select('created_at', DB::raw('COUNT(*) as total'))
                ->groupBy(DB::raw('DATE_FORMAT(created_at, "%Y-%m-%d")'));
        } else {
            $query = $model::whereBetween('created_at', [$begin, $end])
                ->where('user_id', $user_id)
                ->select('created_at', DB::raw('COUNT(*) as total'))
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
            $date = date('Y-m-d', strtotime($item->created_at));
            isset($temp[$date]) ?
                $temp[$date] += $item->total :
                $temp[$date] = $item->total;
            $categories[$category][$date] = $item->total;
        });
    }
}