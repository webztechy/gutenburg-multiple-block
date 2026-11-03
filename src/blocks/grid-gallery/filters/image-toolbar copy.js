import { createHigherOrderComponent } from "@wordpress/compose";
import { Fragment } from "@wordpress/element";
import { BlockControls } from "@wordpress/block-editor";
import {
    ToolbarGroup,
    ToolbarButton,
} from "@wordpress/components";
import { addFilter } from "@wordpress/hooks";
import { __ } from "@wordpress/i18n";

const withCustomImageToolbar = createHigherOrderComponent(
    (BlockEdit) => {
        return (props) => {
            // Only apply to Image blocks
            if (props.name !== "core/image") {
                return <BlockEdit {...props} />;
            }

            return (
                <Fragment>
                    <BlockControls group="block">
                        <ToolbarGroup>
                            <ToolbarButton
                                icon="format-image"
                                label={__("Enable Lightbox", "advanced-gallery-block")}
                                onClick={() => {
                                    props.setAttributes({
                                        agbLightbox: !props.attributes.agbLightbox,
                                    });
                                }}
                                isActive={props.attributes.agbLightbox}
                            />

                            <ToolbarButton
                                icon="search"
                                label={__("Enable Zoom", "advanced-gallery-block")}
                                onClick={() => {
                                    props.setAttributes({
                                        agbZoom: !props.attributes.agbZoom,
                                    });
                                }}
                                isActive={props.attributes.agbZoom}
                            />
                        </ToolbarGroup>
                    </BlockControls>

                    <BlockEdit {...props} />
                </Fragment>
            );
        };
    },
    "withCustomImageToolbar"
);

addFilter(
    "editor.BlockEdit",
    "advanced-gallery-block/image-toolbar",
    withCustomImageToolbar
);