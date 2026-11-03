import { Fragment } from "@wordpress/element";
import { createHigherOrderComponent } from "@wordpress/compose";
import { BlockControls } from "@wordpress/block-editor";
import { ToolbarGroup, ToolbarButton } from "@wordpress/components";
import { useSelect } from "@wordpress/data";
import { addFilter } from "@wordpress/hooks";
import { __ } from "@wordpress/i18n";

/**
 * Change this to the exact name in your gallery block.json.
 */
const GALLERY_BLOCK_NAME = "multiblock/grid-gallery";

/**
 * 1. Add custom attributes to core/image.
 */
function addImageAttributes(settings, name) {
    if (name !== "core/image") {
        return settings;
    }

    settings.attributes = {
        ...settings.attributes,

        agbLightbox: {
            type: "boolean",
            default: false,
        },

        agbZoom: {
            type: "boolean",
            default: false,
        },
    };

    return settings;
}

addFilter(
    "blocks.registerBlockType",
    "gutenburg-multiple-block/image-attributes",
    addImageAttributes
);

/**
 * 2. Add a custom toolbar to each Image block inside the Gallery.
 */
const withImageToolbar = createHigherOrderComponent(
    (BlockEdit) => {
        return (props) => {
            const isInsideGallery = useSelect(
                (select) => {
                    if (props.name !== "core/image") {
                        return false;
                    }

                    const editor = select("core/block-editor");

                    const parentIds = editor.getBlockParents(
                        props.clientId
                    );

                    return parentIds.some((parentId) => {
                        const parent = editor.getBlock(parentId);

                        return parent?.name === GALLERY_BLOCK_NAME;
                    });
                },
                [props.name, props.clientId]
            );

            // Do not modify other blocks or images outside this gallery.
            if (props.name !== "core/image" || !isInsideGallery) {
                return <BlockEdit {...props} />;
            }

            const {
                agbLightbox = false,
                agbZoom = false,
            } = props.attributes;

            return (
                <Fragment>
                    <BlockControls group="block">
                        <ToolbarGroup>

                            {/* Lightbox option */}
                            <ToolbarButton
                                icon="visibility"
                                label={__("Lightbox", "advanced-gallery-block")}
                                isActive={agbLightbox}
                                onClick={() =>
                                    props.setAttributes({
                                        agbLightbox: !agbLightbox,
                                    })
                                }
                            />

                            {/* Zoom option */}
                            <ToolbarButton
                                icon="search"
                                label={__("Image Zoom", "advanced-gallery-block")}
                                isActive={agbZoom}
                                onClick={() =>
                                    props.setAttributes({
                                        agbZoom: !agbZoom,
                                    })
                                }
                            />

                        </ToolbarGroup>
                    </BlockControls>

                    <BlockEdit {...props} />
                </Fragment>
            );
        };
    },
    "withImageToolbar"
);

addFilter(
    "editor.BlockEdit",
    "gutenburg-multiple-block/image-toolbar",
    withImageToolbar
);

/**
 * 3. Save the individual image settings to the frontend markup.
 */
function saveImageAttributes(extraProps, blockType, attributes) {
    if (blockType.name !== "core/image") {
        return extraProps;
    }

    if (attributes.agbLightbox) {
        extraProps["data-agb-lightbox"] = "true";
    }

    if (attributes.agbZoom) {
        extraProps["data-agb-zoom"] = "true";
    }

    return extraProps;
}

addFilter(
    "blocks.getSaveContent.extraProps",
    "gutenburg-multiple-block/save-image-attributes",
    saveImageAttributes
);