document.addEventListener("click", (event) => {
  const clickedImage = event.target.closest(".agb-gallery-image");
  const existingLightbox = document.querySelector(".agb-lightbox");

  // Close lightbox when clicking the background or close button.
  if (
    existingLightbox &&
    (event.target === existingLightbox ||
      event.target.closest(".agb-lightbox-close"))
  ) {
    existingLightbox.remove();
    document.body.classList.remove("agb-lightbox-open");
    return;
  }

  if (!clickedImage) return;

  // Remove any existing lightbox.
  if (existingLightbox) existingLightbox.remove();

  const lightbox = document.createElement("div");
  lightbox.className = "agb-lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", "Enlarged gallery image");

  const image = document.createElement("img");
  image.src = clickedImage.dataset.fullUrl || clickedImage.src;
  image.alt = clickedImage.alt || "";

  const closeButton = document.createElement("button");
  closeButton.className = "agb-lightbox-close";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Close enlarged image");
  closeButton.innerHTML = "&times;";

  lightbox.append(closeButton, image);
  document.body.appendChild(lightbox);
  document.body.classList.add("agb-lightbox-open");

  closeButton.focus();
});

// Close with Escape; support keyboard activation of gallery images.
document.addEventListener("keydown", (event) => {
  const lightbox = document.querySelector(".agb-lightbox");

  if (!lightbox) {
    if (
      (event.key === "Enter" || event.key === " ") &&
      event.target.matches(".agb-gallery-image")
    ) {
      event.preventDefault();
      event.target.click();
    }
    return;
  }

  if (event.key === "Escape") {
    lightbox.remove();
    document.body.classList.remove("agb-lightbox-open");
  }
});
