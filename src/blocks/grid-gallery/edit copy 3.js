import { __ } from "@wordpress/i18n";
import {
  useBlockProps,
  useInnerBlocksProps,
  MediaUpload,
  MediaUploadCheck,
  InspectorControls,
  InnerBlocks,
  BlockControls,
} from "@wordpress/block-editor";

import {
  Button,
  TabPanel,
  RangeControl,
  ToggleControl,
  Placeholder,
  SelectControl,
  ColorPicker,
  ColorPalette,
  BaseControl,
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarDropdownMenu,
  MenuItem,
} from "@wordpress/components";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

const R3MI_BLOCK_SLUG_GRID = "r3mi-block-gallery-grid";

const imageSizes = [
  { label: "Square (600 × 600)", value: "r3mi-square" },
  { label: "Landscape (800 × 500)", value: "r3mi-landscape" },
  { label: "Portrait (600 × 800)", value: "r3mi-portrait" },
  { label: "Wide (1200 × 600)", value: "r3mi-wide" },
  { label: "Original", value: "full" },
];

const colors = [
  { name: "White", color: "#ffffff" },
  { name: "Black", color: "#000000" },
  { name: "Gray", color: "#808080" },
  { name: "Blue", color: "#2271b1" },
  { name: "Red", color: "#d63638" },
];

/**
 * Sortable gallery image.
 * Keep this component outside Edit().
 */
function SortableImage({
  image,
  index,
  imageSize,
  roundedCorners,
  showCaptions,
  replaceImage,
  removeImage,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: String(image.id),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`agb-gallery-item ${isDragging ? "is-dragging" : ""}`}
    >
      <img
        src={image.sizes?.[imageSize]?.url || image.url}
        alt={image.alt || ""}
        className="agb-gallery-image"
        style={{
          borderRadius: roundedCorners ? "8px" : "0",
        }}
      />

      {/* Drag handle */}
      <button
        type="button"
        className="agb-drag-handle"
        {...attributes}
        {...listeners}
        aria-label={`Drag image ${index + 1}`}
        title={__("Drag to reorder", R3MI_BLOCK_SLUG_GRID)}
      >
        ⠿
      </button>

      {showCaptions && image.caption && (
        <figcaption>{image.caption}</figcaption>
      )}

      <div className="agb-image-actions">
        <MediaUploadCheck>
          <MediaUpload
            onSelect={(media) => replaceImage(index, media)}
            allowedTypes={["image"]}
            value={image.id}
            render={({ open }) => (
              <Button variant="secondary" size="small" onClick={open}>
                {__("Replace", R3MI_BLOCK_SLUG_GRID)}
              </Button>
            )}
          />
        </MediaUploadCheck>

        <Button
          variant="tertiary"
          isDestructive
          size="small"
          onClick={() => removeImage(index)}
        >
          {__("Remove", R3MI_BLOCK_SLUG_GRID)}
        </Button>
      </div>
    </div>
  );
}

function GalleryToolbar({ setAttributes, columns }) {
  return (
    <BlockControls>
      <ToolbarGroup>
        <ToolbarButton
          icon="grid-view"
          label="Grid Layout"
          onClick={() => setAttributes({ layout: "grid" })}
        />

        <ToolbarButton
          icon="screenoptions"
          label="Masonry Layout"
          onClick={() => setAttributes({ layout: "masonry" })}
        />
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarDropdownMenu
          icon="columns"
          label="Gallery Columns"
          controls={[
            {
              title: "2 Columns",
              onClick: () => setAttributes({ columns: 2 }),
            },
            {
              title: "3 Columns",
              onClick: () => setAttributes({ columns: 3 }),
            },
            {
              title: "4 Columns",
              onClick: () => setAttributes({ columns: 4 }),
            },
            {
              title: "5 Columns",
              onClick: () => setAttributes({ columns: 5 }),
            },
            {
              title: "6 Columns",
              onClick: () => setAttributes({ columns: 6 }),
            },
          ]}
        />
      </ToolbarGroup>
    </BlockControls>
  );
}

export default function Edit({ attributes, setAttributes }) {
  const {
    images = [],
    columns = 3,
    gap = 8,
    roundedCorners = true,
    showCaptions = false,
    imageSize = "full",
    backgroundColor = "#ffffff",
  } = attributes;

  const blockProps = useBlockProps({
    className: "agb-gallery-editor",
  });

  // Drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Add images
  const addImages = (media) => {
    const selectedImages = Array.isArray(media) ? media : [media];

    const newImages = selectedImages
      .filter((item) => item?.id)
      .map((item) => ({
        id: item.id,
        url: item.url || item.source_url || "",
        alt: item.alt || item.alt_text || "",
        sizes: item.sizes || {},
        caption:
          typeof item.caption === "string"
            ? item.caption
            : item.caption?.raw || item.caption?.rendered || "",
        linkUrl: "",
        newTab: false,
      }))
      .filter((image) => image.url);

    // Append instead of replacing existing images
    setAttributes({
      images: [...images, ...newImages],
    });
  };

  // Update image
  const updateImage = (index, changes) => {
    setAttributes({
      images: images.map((image, i) =>
        i === index ? { ...image, ...changes } : image,
      ),
    });
  };

  // Remove image
  const removeImage = (index) => {
    setAttributes({
      images: images.filter((_, i) => i !== index),
    });
  };

  // Replace image
  const replaceImage = (index, media) => {
    if (!media?.id) return;

    updateImage(index, {
      id: media.id,
      url: media.url || media.source_url || "",
      alt: media.alt || media.alt_text || "",
      sizes: media.sizes || {},
      caption:
        typeof media.caption === "string"
          ? media.caption
          : media.caption?.raw || media.caption?.rendered || "",
    });
  };

  // Handle drag and drop
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = images.findIndex(
      (image) => String(image.id) === String(active.id),
    );

    const newIndex = images.findIndex(
      (image) => String(image.id) === String(over.id),
    );

    if (oldIndex === -1 || newIndex === -1) return;

    setAttributes({
      images: arrayMove(images, oldIndex, newIndex),
    });
  };

  // Media upload button
  const mediaUpload = (
    <MediaUploadCheck>
      <MediaUpload
        onSelect={addImages}
        allowedTypes={["image"]}
        multiple
        gallery
        value={images.map((image) => image.id).filter(Boolean)}
        render={({ open }) => (
          <Button variant="primary" onClick={open}>
            {__("Add Images", R3MI_BLOCK_SLUG_GRID)}
          </Button>
        )}
      />
    </MediaUploadCheck>
  );

  return (
    <>
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
              case "general":
                return (
                  <div className="agb-tab-content">
                    <RangeControl
                      label={__("Columns", R3MI_BLOCK_SLUG_GRID)}
                      value={columns}
                      onChange={(value) => setAttributes({ columns: value })}
                      min={1}
                      max={6}
                    />

                    <RangeControl
                      label={__("Image Gap", R3MI_BLOCK_SLUG_GRID)}
                      value={gap}
                      onChange={(value) => setAttributes({ gap: value })}
                      min={0}
                      max={50}
                    />

                    <SelectControl
                      label={__("Image Size", R3MI_BLOCK_SLUG_GRID)}
                      value={imageSize}
                      options={imageSizes}
                      onChange={(value) => setAttributes({ imageSize: value })}
                    />

                    <ToggleControl
                      label={__("Show Captions", R3MI_BLOCK_SLUG_GRID)}
                      checked={showCaptions}
                      onChange={(value) =>
                        setAttributes({ showCaptions: value })
                      }
                    />
                  </div>
                );

              case "images":
                return (
                  <div className="agb-tab-content">
                    <p>
                      {__(
                        "Images settings can be added here.",
                        R3MI_BLOCK_SLUG_GRID,
                      )}
                    </p>
                  </div>
                );

              case "style":
                return (
                  <div className="agb-tab-content">
                    <ToggleControl
                      label={__("Rounded Corners", R3MI_BLOCK_SLUG_GRID)}
                      checked={roundedCorners}
                      onChange={(value) =>
                        setAttributes({ roundedCorners: value })
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
                          setAttributes({ backgroundColor: value })
                        }
                        enableAlpha
                      />
                    </BaseControl>
                  </div>
                );

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

      <GalleryToolbar columns={columns} setAttributes={setAttributes} />

      <div {...blockProps}>
        {images.length === 0 ? (
          <Placeholder
            icon="format-gallery"
            label={__("Advanced Gallery", R3MI_BLOCK_SLUG_GRID)}
            instructions={__(
              "Select images to build your gallery.",
              R3MI_BLOCK_SLUG_GRID,
            )}
          >
            {mediaUpload}
          </Placeholder>
        ) : (
          <div className="agb-gallery-preview">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={images.map((image) => String(image.id))}
                strategy={rectSortingStrategy}
              >
                <div
                  className="agb-gallery-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                    gap: `${gap}px`,
                    backgroundColor,
                  }}
                >
                  {images.map((image, index) => (
                    <SortableImage
                      key={image.id}
                      image={image}
                      index={index}
                      imageSize={imageSize}
                      roundedCorners={roundedCorners}
                      showCaptions={showCaptions}
                      replaceImage={replaceImage}
                      removeImage={removeImage}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <div className="agb-gallery-add">{mediaUpload}</div>
          </div>
        )}
      </div>
    </>
  );
}
