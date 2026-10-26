const CarouselError = (message?: string) =>
    Error(`Image Carousel Error${message ? `: ${message}` : ""}`);

function scrollCarousel(imageContainer: HTMLDivElement, value: number) {
  const maxScroll = imageContainer.scrollWidth - imageContainer.clientWidth;
  const atStart = imageContainer.scrollLeft <= 1;
  const atEnd = imageContainer.scrollLeft >= maxScroll - 1;

  if ((value < 0 && atStart) || (value > 0 && atEnd)) {
    imageContainer.scrollTo({
      left: value < 0 ? maxScroll : 0,
      behavior: "smooth",
    });
    return;
  }

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