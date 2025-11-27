document.addEventListener("DOMContentLoaded", function () {
  // Find all testimonial tab sections on the page
  const testimonialSections = document.querySelectorAll(
    ".cwc_testimonial_tabs"
  );

  testimonialSections.forEach(function (section) {
    const buttons = section.querySelectorAll(".cwc_testimonial-tab-button");
    const grids = section.querySelectorAll(".cwc_testimonial_tabs-grid");

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        const tab = button.getAttribute("data-tab");

        // Remove active class from all buttons and grids in this section
        buttons.forEach(function (btn) {
          btn.classList.remove("active");
        });

        grids.forEach(function (grid) {
          grid.classList.remove("active");
        });

        // Add active class to clicked button and corresponding grid
        button.classList.add("active");
        const targetGrid = section.querySelector(
          `.cwc_testimonial_tabs-grid[data-content="${tab}"]`
        );
        if (targetGrid) {
          targetGrid.classList.add("active");
        }
      });
    });
  });
});
