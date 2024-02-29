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
use Flarum\Group\Group;
use Flarum\Post\Post;
class ApiActivityGraphController implements RequestHandlerInterface
{
    protected $settings;
    public function __construct(SettingsRepositoryInterface $settings)
    {
        $this->settings = $settings;
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

        $results = Post::whereBetween('created_at', [$begin, $end])
            ->where('user_id', $user_id)
            ->select('created_at', DB::raw('COUNT(*) as total'))
            ->groupBy(DB::raw('DATE_FORMAT(created_at, "%Y-%m-%d")'))
            ->get();

        $results = $results->map(function ($item) {
            return [
                date('Y-m-d', strtotime($item->created_at)),
                $item->total
            ];
        });

        return new JsonResponse($results);
    }
}
