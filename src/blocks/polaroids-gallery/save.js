import { useBlockProps } from "@wordpress/block-editor";

export default function Save({ attributes }) {
  const {
    images = [],
    columns = 3,
    gap = 12,
    roundedCorners = true,
    showCaptions = false,
    imageSize = "full",
    backgroundColor = "#ffffff",
  } = attributes;

  const blockProps = useBlockProps.save({
    className: "agb-gallery",
    style: {
      "--agb-columns": columns,
      "--agb-gap": `${gap}px`,
      backgroundColor: backgroundColor || undefined,
    },
  });

  if (!images.length) return null;

  return (
    <div {...blockProps}>
      <div className="agb-gallery-grid">
        {images.map((image, index) => {
          const displayUrl =
            imageSize === "full"
              ? image.url
              : image.sizes?.[imageSize]?.url || image.url;

          const fullUrl = image.url || image.sizes?.full?.url || displayUrl;

          return (
            <figure
              className={`agb-gallery-item${
                roundedCorners ? " is-rounded" : ""
              }`}
              key={image.id || `${displayUrl}-${index}`}
            >
              <img
                className="agb-gallery-image"
                src={displayUrl}
                data-full-url={fullUrl}
                alt={image.alt || ""}
                loading="lazy"
                tabIndex={0}
                role="button"
                aria-label={`Enlarge image ${index + 1}`}
              />

              {showCaptions && image.caption && (
                <figcaption>{image.caption}</figcaption>
              )}
            </figure>
          );
        })}
      </div>
    </div>
  );
}
