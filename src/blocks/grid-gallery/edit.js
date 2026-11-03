import {
  InspectorControls,
  MediaUpload,
  MediaUploadCheck,
  useBlockProps,
} from "@wordpress/block-editor";
import { __ } from "@wordpress/i18n";

import {
  BaseControl,
  Button,
  ColorPalette,
  ColorPicker,
  Dashicon,
  Placeholder,
  RangeControl,
  SelectControl,
  Spinner,
  TabPanel,
  ToggleControl,
  ToolbarButton,
  ToolbarGroup,
} from "@wordpress/components";
import { useDispatch } from "@wordpress/data";
import { useState } from "@wordpress/element";
import { store as noticesStore } from "@wordpress/notices";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { GalleryToolbar } from "./includes/gallery-toolbar";

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
  onSelect,
  selected,
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
      className={`agb-gallery-item ${isDragging ? "is-dragging" : ""} ${
        selected ? "is-selected" : ""
      }`}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(index);
      }}
    >
      {selected && (
        <div className="agb-image-toolbar">
          <ToolbarGroup>
            <ToolbarButton
              icon="edit"
              label="Replace image"
              onClick={() => replaceImage(index)}
            />

            <ToolbarButton
              icon="trash"
              label="Remove image"
              onClick={() => removeImage(index)}
            />
          </ToolbarGroup>
        </div>
      )}

      {/* <ToolbarGroup>
        <MediaUploadCheck>
          <MediaUpload
            onSelect={(media) => replaceImage(index, media)}
            allowedTypes={["image"]}
            render={({ open }) => (
              <ToolbarButton
                icon="replace"
                label={__("Replace image", "advanced-gallery-block")}
                onClick={open}
              />
            )}
          />
        </MediaUploadCheck>

        <ToolbarButton
          icon={arrowLeft}
          label={__("Move left", "advanced-gallery-block")}
          disabled={index === 0}
          onClick={() => moveImage(index, index - 1)}
        />

        <ToolbarButton
          icon={arrowRight}
          label={__("Move right", "advanced-gallery-block")}
          disabled={index === images.length - 1}
          onClick={() => moveImage(index, index + 1)}
        />

        <ToolbarButton
          icon={trash}
          label={__("Remove image", "advanced-gallery-block")}
          onClick={() => removeImage(index)}
        />
      </ToolbarGroup> */}

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
      ></button>

      {showCaptions && image.caption && (
        <figcaption>{image.caption}</figcaption>
      )}

      {/* Image actions */}
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

export default function Edit({ attributes, setAttributes }) {
  const { createSuccessNotice, createErrorNotice } = useDispatch(noticesStore);

  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingMulti, setIsUploadingMulti] = useState(false);
  const [isImageDragging, setIsImageDragging] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

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
  const addImages = (media, isUpload = false) => {
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
        agbLightbox: false,
        agbZoom: false,
      }))
      .filter((image) => image.url);

    // Append instead of replacing existing images
    //setAttributes({ images: newImages });
    if (isUpload) {
      setAttributes({
        images: [...images, ...newImages],
      });
    } else {
      setAttributes({ images: newImages });
    }
  };

  // Upload images, drop
  const uploadImages = async (files) => {
    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (!imageFiles.length) {
      createErrorNotice(
        __("Please select valid image files.", R3MI_BLOCK_SLUG_GRID),
        { type: "snackbar" },
      );
      return;
    }

    setIsUploadingMulti(true);

    try {
      const uploadedImages = await Promise.all(
        imageFiles.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch(`${wpApiSettings.root}wp/v2/media`, {
            method: "POST",
            headers: {
              "X-WP-Nonce": wpApiSettings.nonce,
            },
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Upload failed");
          }

          const media = await response.json();

          return {
            id: media.id,
            url: media.source_url,
            alt: media.alt_text || "",
          };
        }),
      );

      addImages(uploadedImages, true);

      createSuccessNotice(
        __("Images uploaded successfully!", R3MI_BLOCK_SLUG_GRID),
        { type: "snackbar" },
      );
    } catch (error) {
      console.error(error);

      createErrorNotice(__("Image upload failed!", R3MI_BLOCK_SLUG_GRID), {
        type: "snackbar",
      });
    } finally {
      setIsUploadingMulti(false);
    }
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

  const uploadImage = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);

    try {
      const response = await fetch(`${wpApiSettings.root}wp/v2/media`, {
        method: "POST",
        headers: {
          "X-WP-Nonce": wpApiSettings.nonce,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Image upload failed");
      }

      const media = await response.json();

      createSuccessNotice(
        __("Image uploaded successfully!", R3MI_BLOCK_SLUG_GRID),
        { type: "snackbar" },
      );

      addImages(media, true);
    } catch (error) {
      console.error(error);
      createErrorNotice(__("Image upload failed!", R3MI_BLOCK_SLUG_GRID), {
        type: "snackbar",
      });
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }

    event.target.value = "";
  };

  const mediaDropZone = (
    <div
      className={`agb-media-dropzone ${isImageDragging ? "is-dragging" : ""}`}
      onDragOver={(event) => {
        event.preventDefault();
        setIsImageDragging(true);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsImageDragging(false);
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsImageDragging(false);

        if (!isUploadingMulti) {
          uploadImages(event.dataTransfer.files);
        }
      }}
    >
      {isUploadingMulti ? (
        <>
          <Spinner />
          <p>{__("Uploading images...", R3MI_BLOCK_SLUG_GRID)}</p>
        </>
      ) : (
        <>
          {/* <span className="dashicons dashicons-cloud-upload" /> */}
          <Dashicon icon="cloud-upload" />

          <div className="components-placeholder__instructions">
            {__("Drag and drop images here", R3MI_BLOCK_SLUG_GRID)}
          </div>

          <span className="components-placeholder__instructions">
            {__("or", R3MI_BLOCK_SLUG_GRID)}
          </span>

          <Button
            variant="primary"
            style={{ position: "relative" }}
            disabled={isUploading}
          >
            {__("Browse Images", R3MI_BLOCK_SLUG_GRID)}
            <input
              id="agb-media-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => {
                uploadImages(event.target.files);
                event.target.value = "";
              }}
              className="agb-input-upload"
            />
          </Button>
        </>
      )}
    </div>
  );

  // Media upload button
  const mediaUpload = (hasImages = false) => {
    return (
      <div style={{ width: "100%" }}>
        {!hasImages && <div style={{ marginBottom: 20 }}>{mediaDropZone}</div>}

        <div className="components-placeholder__fieldset">
          {/* Direct Upload */}
          <Button
            variant="primary"
            disabled={isUploading}
            style={{ position: "relative" }}
          >
            {isUploading ? (
              <>
                <Spinner />
                {__("Uploading...", R3MI_BLOCK_SLUG_GRID)}
              </>
            ) : (
              __("Upload", R3MI_BLOCK_SLUG_GRID)
            )}
            <input
              id="agb-direct-upload"
              type="file"
              accept="image/*"
              className="agb-input-upload"
              onChange={uploadImage}
            />
          </Button>

          {/* WordPress Media Library */}
          <MediaUploadCheck>
            <MediaUpload
              onSelect={addImages}
              allowedTypes={["image"]}
              multiple
              gallery
              value={images.map((image) => image.id).filter(Boolean)}
              render={({ open }) => (
                <Button variant="secondary" onClick={open}>
                  {__("Media Library", R3MI_BLOCK_SLUG_GRID)}
                </Button>
              )}
            />
          </MediaUploadCheck>
        </div>
      </div>
    );
  };

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
                    <Dashicon icon="visibility" />
                    <Dashicon icon="cloud-upload" />
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
            {mediaUpload(false)}
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
                      selected={selectedImage === index}
                      onSelect={setSelectedImage}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <div className="agb-gallery-add">{mediaUpload(true)}</div>
          </div>
        )}
      </div>
    </>
  );
}
