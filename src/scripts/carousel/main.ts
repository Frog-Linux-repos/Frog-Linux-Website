const CarouselError = (message?: string) =>
  Error(`Image Carousel Error${message ? `: ${message}` : ""}`);

function scrollCarousel(imageContainer: HTMLDivElement, value: number) {
  imageContainer.scrollBy({
    left: imageContainer.getBoundingClientRect().width * value,
    behavior: "smooth",
  });
}

export function makeCarousel(carousel: HTMLDivElement) {
  const carouselLeftButton = carousel.querySelector("button.left");
  if (!(carouselLeftButton instanceof HTMLButtonElement)) throw CarouselError();
  const carouselRightButton = carousel.querySelector("button.right");
  if (!(carouselRightButton instanceof HTMLButtonElement))
    throw CarouselError();
  const imageContainer = carousel.querySelector("div.images");
  if (!(imageContainer instanceof HTMLDivElement)) throw CarouselError();

  // Buttons
  carouselLeftButton.addEventListener("click", () =>
    scrollCarousel(imageContainer, -1),
  );
  carouselRightButton.addEventListener("click", () =>
    scrollCarousel(imageContainer, 1),
  );
}
