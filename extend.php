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

$extend = [
    (new Extend\Frontend('forum'))
        ->js(__DIR__ . '/js/dist/forum.js')
        ->css(__DIR__ . '/less/forum.less')
        ->content(function (Document $document, Request $request) {
            $document->head[] = '<script src="https://fastly.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js"></script>';
        }),
    (new Extend\Frontend('admin'))
        ->js(__DIR__ . '/js/dist/admin.js')
        ->css(__DIR__ . '/less/admin.less'),
    new Extend\Locales(__DIR__ . '/locale'),

    (new Extend\Routes('api'))
        ->get('/activity-graph', 'activity-graph', Controllers\ApiActivityGraphController::class),

    (new Extend\Settings())
        ->serializeToForum('foskym-activity-graph.tooltip_position', 'foskym-activity-graph.tooltip_position')
        ->serializeToForum('foskym-activity-graph.times_display_format', 'foskym-activity-graph.times_display_format')
        ->serializeToForum('foskym-activity-graph.from_year', 'foskym-activity-graph.from_year')
];

$boolSettings = [
    'comments',
    'discussions',
    'likes',
    'custom_levels_exp_logs',
    'invite_user_invites',
    'store_purchases',
    'polls_create_polls',
    'polls_votes',
    'username_requests_username',
    'username_requests_nickname',
    'best_answer_marked',
    'badges_assigned',
    'achievements_achieved'
];

foreach ($boolSettings as $setting) {
    $extend[] = (new Extend\Settings())->serializeToForum("foskym-activity-graph.count_$setting", "foskym-activity-graph.count_$setting", 'boolval');
}

return $extend;