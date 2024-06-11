enum Direction {
  LEFT = -1,
  RIGHT = 1,
}

class ImageCarousel {
  transitionHoldTime: number;
  transitionAnimateLength: number;
  transitionProgress: number = 0;
  imageWrapper: Element;
  images: HTMLElement[];
  imageOriginOffsets: number[];
  imageActiveOffsets: number[];
  imageTargetOffsets: number[];
  container: HTMLElement;
  leftDiv: HTMLDivElement;
  rightDiv: HTMLDivElement;
  dotsContainer: HTMLDivElement;
  dots: HTMLDivElement[];
  currIndex: number = 0;
  automaticScroll: number | undefined;
  animating: boolean = false;
  constructor(
    container: Element,
    // containerWidth: number = 400,
    // containerHeight: number = 400,
    transitionHoldTime: number = 2500,
    transitionAnimateLength: number = 300
  ) {
    this.transitionHoldTime = transitionHoldTime;
    this.transitionAnimateLength = transitionAnimateLength;
    this.container = container as HTMLElement;
    // this.container.style.width = containerWidth.toString() + "px";
    // this.container.style.height = containerHeight.toString() + "px";
    this.leftDiv = document.createElement("div");
    this.rightDiv = document.createElement("div");
    this.dotsContainer = document.createElement("div");
    this.dots = [];
    this.imageWrapper = container.getElementsByClassName(
      "carousel-image-wrapper"
    )[0];
    this.images = [];
    this.imageOriginOffsets = [];
    this.imageActiveOffsets = [];
    this.imageTargetOffsets = [];
    let imgs = Array.from(
      this.imageWrapper?.getElementsByClassName("carousel-image")
    );
    for (let i of imgs) this.images.push(i as HTMLElement);

    this.resetPositions();
    this.setupButtons();

    // Todo: Add auto scroll event
    this.setupAutoScroll();
    this.animateScroll(Date.now());
  }

  setupAutoScroll(): void {
    // console.log(this.transitionHoldTime);
    this.automaticScroll = setInterval(() => {
      this.scrollTo(this.currIndex + 1);
    }, this.transitionHoldTime);
  }

  resetPositions(): void {
    this.currIndex = 0;
    for (let i = 0; i < this.images.length; i++) {
      this.imageTargetOffsets[i] = i * 100;
      this.imageActiveOffsets[i] = i * 100;
      this.imageOriginOffsets[i] = i * 100;
      this.images[i].style.left = this.imageActiveOffsets[i].toString() + "%";
    }
  }

  setupButtons(): void {
    //UI
    this.leftDiv.classList.add("carousel-left-arrow");
    this.rightDiv.classList.add("carousel-right-arrow");
    this.leftDiv.innerHTML = `<i class="fa-solid fa-arrow-left"> </i>`;
    this.rightDiv.innerHTML = `<i class="fa-solid fa-arrow-right"> </i>`;
    this.container.appendChild(this.leftDiv);
    this.container.appendChild(this.rightDiv);

    this.dotsContainer.classList.add("dots-container");
    this.container.appendChild(this.dotsContainer);
    for (let i = 0; this.images && i < this.images?.length; i++) {
      let dot = document.createElement("div");
      dot.classList.add("dots");
      dot.classList.add(`dots--${i}`);
      dot.addEventListener("click", () => {
        this.scrollTo(i);
        // console.log(e.target);
        // let item = e.target as HTMLElement;
        // let classes = item.classList.toString().split(" ");
        // for (const cls of classes) {
        //   const digitMatch = cls.match(/dots--(\d+)/);
        //   if (digitMatch) {
        //     const digit = digitMatch[1];
        //     this.scrollTo(parseInt(digit));
        // console.log(`Digit found in '${cls}': ${digit}`);
        // }
        // }
      });
      this.dotsContainer.appendChild(dot);
      this.dots.push(dot);
    }
    this.dots[0].classList.add("dots--active");

    this.leftDiv.addEventListener("click", () => {
      clearInterval(this.automaticScroll);
      this.scrollTo(this.currIndex - 1);
      this.setupAutoScroll();
      // setTimeout(() => {
      //   this.setupAutoScroll();
      // }, this.transitionAnimateLength);
    });
    this.rightDiv.addEventListener("click", () => {
      clearInterval(this.automaticScroll);
      this.scrollTo(this.currIndex + 1);
      this.setupAutoScroll();
      // setTimeout(() => {
      // this.setupAutoScroll();
      // }, this.transitionAnimateLength);
    });
  }

  updateImagePositions(): void {
    for (let i = 0; i < this.images.length; i++) {
      // console.log(this.imageActiveOffsets[i]);
      this.images[i].style.left = this.imageActiveOffsets[i].toString() + "%";
    }
  }

  scrollTo(index: number): void {
    if (index >= this.images.length) index = 0;
    if (index < 0) index = this.images.length - 1;
    // console.log(
    //   this.currIndex,
    //   "  --------",
    //   this.animating,
    //   "--------------------"
    // );
    this.dots[this.currIndex].classList.remove("dots--active");
    this.dots[index].classList.add("dots--active");
    let scrollAmt = index - this.currIndex;
    this.currIndex = index;
    this.resetAnimation();
    this.animating = true;
    // this.currIndex %= this.images.length;
    for (let i = 0; i < this.images.length; i++) {
      this.imageTargetOffsets[i] -= scrollAmt * 100;
    }
  }

  easeInOut(value: number): number {
    return 0.5 - 0.5 * Math.cos(value * Math.PI);
  }

  animateScroll(lastTimestamp: number): void {
    let now = Date.now();
    if (!this.animating) {
      setTimeout(() => {
        this.animateScroll(now);
      }, 1000 / 60);
      return;
    }
    let delta = now - lastTimestamp;
    this.transitionProgress += delta / this.transitionAnimateLength;
    this.transitionProgress = Math.min(1, this.transitionProgress);
    // console.log((this.easeInOut(this.transitionProgress) * 100).toFixed(0));
    // console.log(this.easeInOutBezierEase(this.transitionProgress, 0.25, 0, 0.25, 1));
    for (let i = 0; this.images && i < this.images?.length; i++) {
      this.imageActiveOffsets[i] =
        (this.imageTargetOffsets[i] - this.imageOriginOffsets[i]) *
          this.easeInOut(this.transitionProgress) +
        this.imageOriginOffsets[i];
    }
    if (this.transitionProgress >= 1) {
      this.resetAnimation();
    }
    this.updateImagePositions();
    setTimeout(() => {
      this.animateScroll(now);
    }, 1000 / 60);
  }

  resetAnimation(): void {
    for (let i = 0; i < this.images.length; i++) {
      this.imageOriginOffsets[i] = this.imageActiveOffsets[i];
      this.transitionProgress = 0;
      this.animating = false;
    }
  }
}
let TransTimeField = document.getElementById(
  "transition-time"
) as HTMLInputElement;
let HoldTimeField = document.getElementById("hold-time") as HTMLInputElement;
let transitionTime = parseInt(TransTimeField.value);
let holdTime = parseInt(HoldTimeField.value);
let alerted = false;

function updateCarousels() {
  transitionTime = parseInt(TransTimeField.value);
  holdTime = parseInt(HoldTimeField.value);
  if(transitionTime > holdTime && !alerted){
    alert("Please Fix Transition Time to be less than Hold Time");
    alerted = true;
    return;
  }
  alerted = false;
  for (let carousel of carousels) {
    carousel.transitionAnimateLength = transitionTime;
    carousel.transitionHoldTime = holdTime;
    clearInterval(carousel.automaticScroll);
    carousel.setupAutoScroll();
    // carousel.scrollTo(carousel.currIndex + 1);
    carousel.resetAnimation();
    // carousel.scrollTo(0);
    // carousel.resetPositions();
    carousel.transitionProgress = 0;
  }
}

let carouselsContainers = document.getElementsByClassName("carousel-container");
let carousels: ImageCarousel[] = [];

for (const container of carouselsContainers) {
  carousels.push(new ImageCarousel(container, holdTime, transitionTime));
}

TransTimeField?.addEventListener("change", () => {
  updateCarousels();
});
HoldTimeField?.addEventListener("change", () => {
  updateCarousels();
});
