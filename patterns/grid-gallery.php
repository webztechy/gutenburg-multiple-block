<?php


function agb_register_gallery_patterns()
{

    register_block_pattern(
        'multiblock/grid-gallery',
        array(
            'title'       => __('Grid Gallery ', R3MI_BLOCK_SLUG_GRID),
            'description' => __('A grid gallery layout.', R3MI_BLOCK_SLUG_GRID),
            'categories'  => array('gallery', 'portfolio'),
            'content'     => '
                                    <!-- wp:group {"layout":{"type":"constrained"}} -->
                                    <div class="wp-block-group">

                                        <!-- wp:heading {"textAlign":"center"} -->
                                        <h2 class="wp-block-heading has-text-align-center">
                                            My Portfolio
                                        </h2>
                                        <!-- /wp:heading -->

                                        <!-- wp:paragraph {"align":"center"} -->
                                        <p class="has-text-align-center">
                                            Explore my latest photography.
                                        </p>
                                        <!-- /wp:paragraph -->

                                        <!-- wp:gallery {"columns":3,"linkTo":"none"} -->
                                        <figure class="wp-block-gallery has-nested-images columns-3">
                                        </figure>
                                        <!-- /wp:gallery -->

                                    </div>
                                    <!-- /wp:group -->
                                ',
            'source' => 'plugin',
            'viewportWidth' => 1200,
        )
    );
}

add_action('init', 'agb_register_gallery_patterns');
