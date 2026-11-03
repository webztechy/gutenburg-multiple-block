<?php

/**
 * Plugin Name: Multiple Block
 * Description: Adds a customizable image gallery block to the WordPress block editor.
 * Version: 1.0.0
 * Requires at least: 6.3
 * Requires PHP: 7.4
 * Author: R3MiPlugins
 * License: GPL-2.0-or-later
 * Text Domain: multiple-block
 */

if (! defined('ABSPATH')) {
    exit;
}


define('R3MI_BLOCK_SLUG', 'r3mi-multi-block');
// define('R3MI_BLOCK_SLUG_GRID', 'r3mi-block-gallery-grid');
// define('R3MI_BLOCK_SLUG_POLAROIDS', 'r3mi-block-gallery-polaroids');

if (!class_exists('R3MI_mulitple_block')) {

    class R3MI_mulitple_block
    {
        public function __construct()
        {
            add_action('init',  array($this, 'register_gallery_block'));
            add_action('image_size_names_choose', array($this, 'image_size_names_choose_func'));
            add_filter(
                'block_categories_all',
                array($this, 'register_block_category'),
                10,
                2
            );
            self::creating_thumbnails();
        }


        public function creating_thumbnails()
        {
            add_image_size('agb-square', 600, 600, true);
            add_image_size('agb-landscape', 800, 500, true);
            add_image_size('agb-portrait', 600, 800, true);
            add_image_size('agb-wide', 1200, 600, true);
        }

        public function image_size_names_choose_func($sizes)
        {
            return array_merge($sizes, [
                'agb-square'    => __('Square', R3MI_BLOCK_SLUG),
                'agb-landscape' => __('Landscape', R3MI_BLOCK_SLUG),
                'agb-portrait'  => __('Portrait', R3MI_BLOCK_SLUG),
                'agb-wide'      => __('Wide', R3MI_BLOCK_SLUG),
            ]);
        }


        public function register_block_category($categories, $editor_context)
        {

            array_unshift(
                $categories,
                array(
                    'slug'  => R3MI_BLOCK_SLUG,
                    'title' => __('R3Mi Multi Block', R3MI_BLOCK_SLUG),
                    'icon'  => 'info-outline',
                )
            );

            return $categories;
        }

        public function register_gallery_block()
        {
            $blocks_dir = plugin_dir_path(__FILE__) . 'build/blocks/';

            if (! is_dir($blocks_dir)) {
                error_log('AGB: Build blocks directory not found: ' . $blocks_dir);
                return;
            }

            $block_json_files = glob($blocks_dir . '*/block.json');

            if (empty($block_json_files)) {
                error_log('AGB: No block.json files found.');
                return;
            }

            foreach ($block_json_files as $block_json) {

                $block_dir = dirname($block_json);

                $registered = register_block_type($block_dir);

                if (! $registered) {
                    error_log('AGB: Failed to register block: ' . $block_dir);
                } else {
                    error_log('AGB: Registered block: ' . $block_dir);
                }
            }

            // $blocks = [
            //     'grid-gallery',
            //     'polaroids-gallery',
            // ];

            // foreach ($blocks as $block) {
            //     register_block_type(
            //         __DIR__ . '/build/blocks/' . $block
            //     );
            // }
        }
    }

    new R3MI_mulitple_block;

    // add_action('init', function () {
    //     error_log(
    //         print_r(
    //             WP_Block_Type_Registry::get_instance()->get_all_registered(),
    //             true
    //         )
    //     );
    // }, 20);
}



// function r3mi_register_blocks()
// {

//     $blocks = [
//         'grid-gallery',
//         'polaroids-gallery',
//     ];

//     foreach ($blocks as $block) {
//         register_block_type(
//             __DIR__ . '/build/blocks/' . $block
//         );
//     }
// }

// add_action('init', 'r3mi_register_blocks');
