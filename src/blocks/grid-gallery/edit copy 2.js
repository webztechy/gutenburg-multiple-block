import { __ } from "@wordpress/i18n";

import {
  useBlockProps,
  useInnerBlocksProps,
  InspectorControls,
  InnerBlocks,
} from "@wordpress/block-editor";

import {
  TabPanel,
  RangeControl,
  ToggleControl,
  ColorPicker,
  ColorPalette,
  BaseControl,
} from "@wordpress/components";

const R3MI_BLOCK_SLUG_GRID = "r3mi-block-gallery-grid";

const colors = [
  { name: "White", color: "#ffffff" },
  { name: "Black", color: "#000000" },
  { name: "Gray", color: "#808080" },
  { name: "Blue", color: "#2271b1" },
  { name: "Red", color: "#d63638" },
];

export default function Edit({ attributes, setAttributes }) {
  const {
    columns = 3,
    gap = 8,
    roundedCorners = true,
    backgroundColor = "#ffffff",
  } = attributes;

  // Main block wrapper
  const blockProps = useBlockProps({
    className: "agb-gallery-editor",
  });

  // Native Gutenberg Image blocks
  const innerBlocksProps = useInnerBlocksProps(
    {
      className: `agb-gallery-grid ${roundedCorners ? "is-rounded" : ""}`,
      style: {
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: `${gap}px`,
        backgroundColor,
      },
    },
    {
      allowedBlocks: ["core/image"],
      template: [],
      templateLock: false,
      renderAppender: InnerBlocks.ButtonBlockAppender,
    },
  );

  return (
    <>
      {/* Inspector Controls */}
      <InspectorControls>
        <TabPanel
          className="agb-settings-tabs"
          activeClass="is-active"
          tabs={[
            {
              name: "general",
              title: __("General", R3MI_BLOCK_SLUG_GRID),
            },
            {
              name: "images",
              title: __("Images", R3MI_BLOCK_SLUG_GRID),
            },
            {
              name: "style",
              title: __("Style", R3MI_BLOCK_SLUG_GRID),
            },
            {
              name: "lightbox",
              title: __("Lightbox", R3MI_BLOCK_SLUG_GRID),
            },
          ]}
        >
          {(tab) => {
            switch (tab.name) {
              // GENERAL SETTINGS
              case "general":
                return (
                  <div className="agb-tab-content">
                    <RangeControl
                      label={__("Columns", R3MI_BLOCK_SLUG_GRID)}
                      value={columns}
                      onChange={(value) =>
                        setAttributes({
                          columns: value,
                        })
                      }
                      min={1}
                      max={6}
                    />

                    <RangeControl
                      label={__("Image Gap", R3MI_BLOCK_SLUG_GRID)}
                      value={gap}
                      onChange={(value) =>
                        setAttributes({
                          gap: value,
                        })
                      }
                      min={0}
                      max={50}
                    />
                  </div>
                );

              // IMAGE SETTINGS
              case "images":
                return (
                  <div className="agb-tab-content">
                    <p>
                      {__(
                        "Select an image in the gallery to access its native Gutenberg image settings.",
                        R3MI_BLOCK_SLUG_GRID,
                      )}
                    </p>

                    <p>
                      {__(
                        "You can change image size, alt text, captions, alignment and link settings using the Image block toolbar and sidebar.",
                        R3MI_BLOCK_SLUG_GRID,
                      )}
                    </p>
                  </div>
                );

              // STYLE SETTINGS
              case "style":
                return (
                  <div className="agb-tab-content">
                    <ToggleControl
                      label={__("Rounded Corners", R3MI_BLOCK_SLUG_GRID)}
                      checked={roundedCorners}
                      onChange={(value) =>
                        setAttributes({
                          roundedCorners: value,
                        })
                      }
                    />

                    <BaseControl
                      label={__("Background Color", R3MI_BLOCK_SLUG_GRID)}
                    >
                      <ColorPalette
                        colors={colors}
                        value={backgroundColor}
                        onChange={(value) =>
                          setAttributes({
                            backgroundColor: value || "",
                          })
                        }
                        clearable
                      />
                    </BaseControl>

                    <BaseControl
                      label={__(
                        "Custom Background Color",
                        R3MI_BLOCK_SLUG_GRID,
                      )}
                    >
                      <ColorPicker
                        color={backgroundColor}
                        onChange={(value) =>
                          setAttributes({
                            backgroundColor: value,
                          })
                        }
                        enableAlpha
                      />
                    </BaseControl>
                  </div>
                );

              // LIGHTBOX SETTINGS
              case "lightbox":
                return (
                  <div className="agb-tab-content">
                    <p>
                      {__(
                        "Lightbox settings can be added here.",
                        R3MI_BLOCK_SLUG_GRID,
                      )}
                    </p>
                  </div>
                );

              default:
                return null;
            }
          }}
        </TabPanel>
      </InspectorControls>

      {/* Gallery Editor */}
      <div {...blockProps}>
        <div {...innerBlocksProps} />
      </div>
    </>
  );
}
