<?php

/*
 * This file is part of foskym/flarum-activity-graph.
 *
 * Copyright (c) 2024 FoskyM.
 *
 * For the full copyright and license information, please view the LICENSE.md
 * file that was distributed with this source code.
 */

namespace FoskyM\ActivityGraph;

use Flarum\Extend;
use Flarum\Frontend\Document;
use Psr\Http\Message\ServerRequestInterface as Request;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less')
        ->content(function (Document $document, Request $request) {
            $document->head[] = '<script src="https://fastly.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js"></script>';
        }),
    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js')
        ->css(__DIR__.'/less/admin.less'),
    new Extend\Locales(__DIR__.'/locale'),

    (new Extend\Routes('api'))
        ->get('/activity-graph', 'activity-graph', Controllers\ApiActivityGraphController::class),

    (new Extend\Settings())
        ->serializeToForum('foskym-activity-graph.count_comments', 'foskym-activity-graph.count_comments', 'boolval')
        ->serializeToForum('foskym-activity-graph.count_discussions', 'foskym-activity-graph.count_discussions', 'boolval')
        ->serializeToForum('foskym-activity-graph.count_likes', 'foskym-activity-graph.count_likes', 'boolval')
        ->serializeToForum('foskym-activity-graph.count_custom_levels_exp_logs', 'foskym-activity-graph.count_custom_levels_exp_logs', 'boolval')
        ->serializeToForum('foskym-activity-graph.count_invite_user_invites', 'foskym-activity-graph.count_invite_user_invites', 'boolval')
        ->serializeToForum('foskym-activity-graph.count_store_purchases', 'foskym-activity-graph.count_store_purchases', 'boolval')
        ->serializeToForum('foskym-activity-graph.count_polls_create_polls', 'foskym-activity-graph.count_polls_create_polls', 'boolval')
        ->serializeToForum('foskym-activity-graph.count_polls_votes', 'foskym-activity-graph.count_polls_votes', 'boolval')
        ->serializeToForum('foskym-activity-graph.count_username_requests_username', 'foskym-activity-graph.count_username_requests_username', 'boolval')
        ->serializeToForum('foskym-activity-graph.count_username_requests_nickname', 'foskym-activity-graph.count_username_requests_nickname', 'boolval')

        ->serializeToForum('foskym-activity-graph.tooltip_position', 'foskym-activity-graph.tooltip_position')
        ->serializeToForum('foskym-activity-graph.times_display_format', 'foskym-activity-graph.times_display_format')
        ->serializeToForum('foskym-activity-graph.from_year', 'foskym-activity-graph.from_year')
];
