document.addEventListener("DOMContentLoaded", function () {
  const carouselEl = document.querySelector(
    ".cwc-video-testimonials__carousel"
  );
  if (!carouselEl) return;

  // Get configuration from data attributes
  const totalVideoSlides = parseInt(carouselEl.dataset.videoCount) || 0;
  const maxDesktopSlides = parseFloat(carouselEl.dataset.maxDesktopSlides) || 4;
  const maxTabletSlides = parseFloat(carouselEl.dataset.maxTabletSlides) || 3;
  const maxMobileSlides = parseFloat(carouselEl.dataset.maxMobileSlides) || 1.5;

  // console.log(totalVideoSlides);

  // If no slides, bail out
  if (totalVideoSlides === 0) return;

  // Helper: determine if carousel is needed at a given breakpoint
  const shouldLoop = (slidesPerView) => totalVideoSlides > slidesPerView;

  // Calculate actual slides per view (never more than total slides)
  const getActualSlidesPerView = (max) => Math.min(max, totalVideoSlides);

  // Initialize Swiper with dynamic configuration
  const swiper = new Swiper(".cwc-video-testimonials__carousel", {
    slidesPerView: getActualSlidesPerView(maxDesktopSlides),
    spaceBetween: 10,
    loop: shouldLoop(maxDesktopSlides),
    speed: 400,
    preventClicks: false,
    preventClicksPropagation: false,
    threshold: 8,
    touchStartPreventDefault: false,

    navigation: {
      nextEl: ".cwc-video-testimonials__carousel-next",
      prevEl: ".cwc-video-testimonials__carousel-prev",
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: false,
    },
    breakpoints: {
      0: {
        slidesPerView: getActualSlidesPerView(maxMobileSlides),
        spaceBetween: 10,
        loop: shouldLoop(maxMobileSlides),
      },
      768: {
        slidesPerView: getActualSlidesPerView(2.5),
        spaceBetween: 10,
        loop: shouldLoop(2.5),
      },
      992: {
        slidesPerView: getActualSlidesPerView(maxTabletSlides),
        spaceBetween: 10,
        loop: shouldLoop(maxTabletSlides),
      },
      1200: {
        slidesPerView: getActualSlidesPerView(maxDesktopSlides),
        spaceBetween: 10,
        loop: shouldLoop(maxDesktopSlides),
      },
    },
    on: {
      init(swiper) {
        updateControlsVisibility(swiper);
        updateProgressBar(swiper);
      },
      slideChange(swiper) {
        updateProgressBar(swiper);
      },
      resize(swiper) {
        updateControlsVisibility(swiper);
      },
    },
  });

  // Helper: Update progress bar
  function updateProgressBar(swiper) {
    const progressBar = document.querySelector(
      ".cwc-video-testimonials__progress-bar"
    );
    if (!progressBar) return;

    // Only show progress if loop is active
    if (swiper.params.loop) {
      const progress = ((swiper.realIndex + 1) / swiper.slides.length) * 100;
      progressBar.style.width = `${progress}%`;
    } else {
      progressBar.style.width = "100%";
    }
  }

  // Helper: Show/hide controls based on whether all slides are visible
  function updateControlsVisibility(swiper) {
    const controls = document.querySelector(
      ".cwc-video-testimonials__carousel-controls"
    );
    const progressContainer = document.querySelector(
      ".cwc-video-testimonials__carousel-progress"
    );

    if (!controls || !progressContainer) return;

    // Check if all slides are visible (no looping needed)
    const allVisible = !swiper.params.loop;
    // console.log(allVisible);

    if (!allVisible) {
      // Hide both controls and progress bar when all content is visible
      controls.style.display = "flex";
      progressContainer.style.display = "flex";
    } else {
      // Show both when scrolling is needed
      controls.style.display = "";
      progressContainer.style.display = "";
    }
  }

  // TAP_MOVE_TOLERANCE for video interactions
  const TAP_MOVE_TOL = 8;

  function pauseOtherVideos(currentVideo) {
    const currentId = currentVideo.dataset.videoId;
    document
      .querySelectorAll(".cwc-video-testimonials__swiper-slide video")
      .forEach((vid) => {
        if (vid.dataset.videoId !== currentId) {
          vid.pause();
          const btn = vid
            .closest(".cwc-video-testimonials__video-wrapper")
            ?.querySelector("button");
          if (btn) btn.style.display = "block";
        }
      });
  }

  // Wire each slide for video controls
  document
    .querySelectorAll(".cwc-video-testimonials__swiper-slide")
    .forEach((slide) => {
      const videoEl = slide.querySelector("video");
      const playBtn = slide.querySelector("button");
      if (!videoEl || !playBtn) return;

      const updateBtn = () => {
        playBtn.style.display = videoEl.paused ? "block" : "none";
      };

      let downX = 0,
        downY = 0,
        moved = false;

      const lockDrag = () => {
        if (swiper) swiper.allowTouchMove = false;
      };
      const unlockDrag = () => {
        if (swiper) swiper.allowTouchMove = true;
      };

      playBtn.addEventListener(
        "pointerdown",
        (e) => {
          downX = e.clientX;
          downY = e.clientY;
          moved = false;
          lockDrag();
          e.preventDefault();
          e.stopPropagation();
        },
        { passive: false }
      );

      playBtn.addEventListener("pointermove", (e) => {
        if (moved) return;
        const dx = Math.abs(e.clientX - downX);
        const dy = Math.abs(e.clientY - downY);
        if (dx > TAP_MOVE_TOL || dy > TAP_MOVE_TOL) {
          moved = true;
          unlockDrag();
        }
      });

      playBtn.addEventListener(
        "pointerup",
        (e) => {
          if (!moved) {
            e.preventDefault();
            e.stopPropagation();
            pauseOtherVideos(videoEl);
            requestAnimationFrame(() => {
              videoEl
                .play()
                .catch((err) => console.warn("play() blocked:", err));
              updateBtn();
            });
          }
          unlockDrag();
        },
        { passive: false }
      );

      playBtn.addEventListener("pointercancel", unlockDrag);
      playBtn.addEventListener("pointerleave", unlockDrag);

      let vDownX = 0,
        vDownY = 0,
        vMoved = false;

      videoEl.addEventListener(
        "pointerdown",
        (e) => {
          vDownX = e.clientX;
          vDownY = e.clientY;
          vMoved = false;
        },
        { passive: true }
      );

      videoEl.addEventListener(
        "pointermove",
        (e) => {
          if (vMoved) return;
          const dx = Math.abs(e.clientX - vDownX);
          const dy = Math.abs(e.clientY - vDownY);
          if (dx > TAP_MOVE_TOL || dy > TAP_MOVE_TOL) vMoved = true;
        },
        { passive: true }
      );

      videoEl.addEventListener(
        "pointerup",
        (e) => {
          if (!vMoved) {
            e.preventDefault();
            if (!videoEl.paused) {
              videoEl.pause();
              updateBtn();
            }
          }
        },
        { passive: false }
      );

      videoEl.addEventListener("play", updateBtn);
      videoEl.addEventListener("pause", updateBtn);
      videoEl.addEventListener("ended", updateBtn);

      updateBtn();
    });
});
