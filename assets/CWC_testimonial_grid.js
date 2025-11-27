document.addEventListener("DOMContentLoaded", function () {
  // Find all testimonial grid sections on the page
  const testimonialSections = document.querySelectorAll(
    ".cwc_testimonial_grid"
  );

  testimonialSections.forEach(function (section) {
    const viewMoreBtn = section.querySelector(".cwc_view-more-button");

    if (viewMoreBtn) {
      const hiddenCards = section.querySelectorAll(
        ".cwc_testimonial-card.hidden"
      );
      const showText = viewMoreBtn.querySelector(".button-text-show");
      const hideText = viewMoreBtn.querySelector(".button-text-hide");
      let isExpanded = false;

      viewMoreBtn.addEventListener("click", function () {
        isExpanded = !isExpanded;

        hiddenCards.forEach(function (card) {
          if (isExpanded) {
            card.classList.remove("hidden");
          } else {
            card.classList.add("hidden");
          }
        });

        // Toggle button text
        if (isExpanded) {
          showText.style.display = "none";
          hideText.style.display = "inline";
        } else {
          showText.style.display = "inline";
          hideText.style.display = "none";
        }

        // Smooth scroll to keep section in view when collapsing
        if (!isExpanded) {
          section.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
    }
  });
});
