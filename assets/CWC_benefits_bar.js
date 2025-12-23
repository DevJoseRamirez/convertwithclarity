/* =====================================================
   CWC BENEFITS BAR JAVASCRIPT
   =====================================================
   Purpose: Handle mobile carousel with CSS transform
   - Smooth sliding via translateX
   - Infinite loop in both directions
   - Swipe support
   - Auto-cycle
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {
  const sections = document.querySelectorAll(".cwc-benefits-bar");

  sections.forEach((section) => {
    initBenefitsBar(section);
  });

  function initBenefitsBar(section) {
    const sectionId = section.dataset.sectionId;
    const carousel = section.querySelector(".cwc-benefits-bar__carousel");
    const track = section.querySelector(".cwc-benefits-bar__track");
    const slides = section.querySelectorAll(".cwc-benefits-bar__slide");
    const prevBtn = section.querySelector(".cwc-benefits-bar__nav--prev");
    const nextBtn = section.querySelector(".cwc-benefits-bar__nav--next");

    if (!carousel || !track || slides.length <= 1) return;

    /* -----------------------------------------------------
       STATE
       ----------------------------------------------------- */
    let currentIndex = 0;
    let autoplayInterval = null;
    let isTransitioning = false;
    const autoplayEnabled = section.dataset.autoplay === "true";
    const autoplaySpeed = parseInt(section.dataset.autoplaySpeed) || 3000;
    const totalSlides = slides.length;

    /* -----------------------------------------------------
       UPDATE TRACK POSITION
       ----------------------------------------------------- */
    function updateTrackPosition(animate = true) {
      if (animate) {
        track.style.transition = "transform 0.4s ease-out";
      } else {
        track.style.transition = "none";
      }
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    /* -----------------------------------------------------
       GO TO SLIDE (with infinite loop)
       ----------------------------------------------------- */
    function goToSlide(index) {
      if (isTransitioning) return;

      isTransitioning = true;

      /* Handle infinite loop */
      if (index < 0) {
        currentIndex = totalSlides - 1;
      } else if (index >= totalSlides) {
        currentIndex = 0;
      } else {
        currentIndex = index;
      }

      updateTrackPosition(true);

      /* Reset transitioning flag after animation */
      setTimeout(() => {
        isTransitioning = false;
      }, 400);
    }

    function nextSlide() {
      goToSlide(currentIndex + 1);
    }

    function prevSlide() {
      goToSlide(currentIndex - 1);
    }

    /* -----------------------------------------------------
       BUTTON CLICK HANDLERS
       ----------------------------------------------------- */
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        prevSlide();
        resetAutoplay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        nextSlide();
        resetAutoplay();
      });
    }

    /* -----------------------------------------------------
       TOUCH/SWIPE SUPPORT
       ----------------------------------------------------- */
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let isDragging = false;

    carousel.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isDragging = true;
        stopAutoplay();
      },
      { passive: true }
    );

    carousel.addEventListener(
      "touchmove",
      (e) => {
        if (!isDragging) return;
        touchEndX = e.touches[0].clientX;
        touchEndY = e.touches[0].clientY;
      },
      { passive: true }
    );

    carousel.addEventListener(
      "touchend",
      () => {
        if (!isDragging) return;
        isDragging = false;

        const diffX = touchStartX - touchEndX;
        const diffY = touchStartY - touchEndY;
        const swipeThreshold = 50;

        /* Only register horizontal swipes */
        if (
          Math.abs(diffX) > Math.abs(diffY) &&
          Math.abs(diffX) > swipeThreshold
        ) {
          if (diffX > 0) {
            nextSlide();
          } else {
            prevSlide();
          }
        }

        /* Restart autoplay after delay */
        setTimeout(startAutoplay, 1000);
      },
      { passive: true }
    );

    /* -----------------------------------------------------
       AUTOPLAY
       ----------------------------------------------------- */
    function startAutoplay() {
      if (autoplayEnabled && !autoplayInterval) {
        autoplayInterval = setInterval(nextSlide, autoplaySpeed);
      }
    }

    function stopAutoplay() {
      if (autoplayInterval) {
        clearInterval(autoplayInterval);
        autoplayInterval = null;
      }
    }

    function resetAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    /* Pause on hover */
    section.addEventListener("mouseenter", stopAutoplay);
    section.addEventListener("mouseleave", startAutoplay);

    /* -----------------------------------------------------
       INITIALIZE
       ----------------------------------------------------- */
    updateTrackPosition(false);
    startAutoplay();

    /* -----------------------------------------------------
       EXPOSE FOR DEBUGGING
       ----------------------------------------------------- */
    if (typeof window.CWCBenefitsBar === "undefined") {
      window.CWCBenefitsBar = {};
    }

    window.CWCBenefitsBar[sectionId] = {
      carousel,
      track,
      getCurrentIndex: () => currentIndex,
      nextSlide,
      prevSlide,
      goToSlide,
      startAutoplay,
      stopAutoplay,
    };
  }
});
