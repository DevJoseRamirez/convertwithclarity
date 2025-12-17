/* =====================================================
   CWC REVIEW TABS JAVASCRIPT
   =====================================================
   Purpose: Handle tab switching for customer reviews
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {
  /* -----------------------------------------------------
     INITIALIZATION
     ----------------------------------------------------- */
  const sections = document.querySelectorAll(".cwc-review-tabs");

  sections.forEach((section) => {
    initReviewTabs(section);
  });

  /* =====================================================
     MAIN INITIALIZATION FUNCTION
     ===================================================== */
  function initReviewTabs(section) {
    const sectionId = section.dataset.sectionId;
    const buttons = section.querySelectorAll(".cwc-review-tabs__button");
    const grids = section.querySelectorAll(".cwc-review-tabs__grid");

    // Validation
    if (!buttons.length || !grids.length) {
      console.warn("No tabs or content grids found in section:", sectionId);
      return;
    }

    // Attach click handlers to each button
    buttons.forEach((button) => {
      button.addEventListener("click", function () {
        const tabId = this.getAttribute("data-tab");

        // Remove active class from all buttons
        buttons.forEach((btn) => btn.classList.remove("active"));

        // Remove active class from all grids
        grids.forEach((grid) => grid.classList.remove("active"));

        // Add active class to clicked button
        this.classList.add("active");

        // Add active class to corresponding grid
        const activeGrid = section.querySelector(
          `.cwc-review-tabs__grid[data-content="${tabId}"]`
        );

        if (activeGrid) {
          activeGrid.classList.add("active");
        } else {
          console.warn("No matching content grid found for tab:", tabId);
        }
      });
    });

    // Expose for debugging
    if (typeof window.CWCReviewTabs === "undefined") {
      window.CWCReviewTabs = {};
    }

    window.CWCReviewTabs[sectionId] = {
      section,
      buttons,
      grids,
    };
  }
});
