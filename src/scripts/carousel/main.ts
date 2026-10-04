const CarouselError = (message?: string) =>
  Error(`Image Carousel Error${message ? `: ${message}` : ""}`);

export function makeCarousel(carousel: HTMLDivElement) {
  const carouselLeftButton = carousel.querySelector("button.left");
  if (!(carouselLeftButton instanceof HTMLButtonElement)) throw CarouselError();
  const carouselRightButton = carousel.querySelector("button.right");
  if (!(carouselRightButton instanceof HTMLButtonElement))
    throw CarouselError();
  const imageContainer = carousel.querySelector("div.images");
  if (!(imageContainer instanceof HTMLDivElement)) throw CarouselError();

  const images = Array.from(imageContainer.children);
  if (images.length < 2) return;

  const firstClone = images[0].cloneNode(true) as HTMLElement;
  const lastClone = images[images.length - 1].cloneNode(true) as HTMLElement;
  firstClone.setAttribute("aria-hidden", "true");
  lastClone.setAttribute("aria-hidden", "true");
  firstClone.inert = true;
  lastClone.inert = true;
  imageContainer.prepend(lastClone);
  imageContainer.append(firstClone);

  const slides = Array.from(imageContainer.children);
  const position = (index: number) =>
    imageContainer.scrollLeft +
    slides[index].getBoundingClientRect().left -
    imageContainer.getBoundingClientRect().left;
  const currentSlide = () => slides.reduce((nearest, _, current) =>
    Math.abs(position(current) - imageContainer.scrollLeft) <
    Math.abs(position(nearest) - imageContainer.scrollLeft)
      ? current
      : nearest, 0);

  imageContainer.scrollTo({ left: position(1), behavior: "instant" });

  let scrolling = false;
  let scrollTimer: ReturnType<typeof setTimeout>;
  const settle = () => {
    clearTimeout(scrollTimer);
    const index = currentSlide();

    // The duplicate keeps the animation moving forward; reset out of view.
    if (index === 0 || index === slides.length - 1) {
      imageContainer.scrollTo({
        left: position(index === 0 ? images.length : 1),
        behavior: "instant",
      });
    }
    scrolling = false;
  };
  imageContainer.addEventListener("scroll", () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(settle, 150);
  });
  imageContainer.addEventListener("scrollend", settle);

  const scroll = (direction: number) => {
    if (scrolling) return;
    const index = currentSlide();
    const next = Math.max(0, Math.min(slides.length - 1, index + direction));
    scrolling = true;
    imageContainer.scrollTo({ left: position(next), behavior: "smooth" });
  };

  carouselLeftButton.addEventListener("click", () =>
    scroll(-1),
  );
  carouselRightButton.addEventListener("click", () =>
    scroll(1),
  );
}
