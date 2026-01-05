/* =====================================================
   CWC COLLECTION TABS JAVASCRIPT
   =====================================================
   Purpose: Handles tab switching functionality for 
   collection tabs section.
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {
  // Find all collection tabs sections on the page
  const sections = document.querySelectorAll(".cwc-collection-tabs");

  // Initialize each section independently
  sections.forEach((section) => {
    initCollectionTabs(section);
  });
});

/* =====================================================
   MAIN INITIALIZATION FUNCTION
   ===================================================== */
function initCollectionTabs(section) {
  const tabButtons = section.querySelectorAll(
    ".cwc-collection-tabs__tab-button"
  );
  const tabPanels = section.querySelectorAll(".cwc-collection-tabs__panel");

  // Exit if no tabs found
  if (!tabButtons.length || !tabPanels.length) {
    return;
  }

  /* -----------------------------------------------------
     TAB CLICK HANDLER
     ----------------------------------------------------- */
  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const targetTab = this.dataset.tab;

      // Update active tab button
      tabButtons.forEach((btn) => {
        btn.classList.remove("active");
        btn.setAttribute("aria-selected", "false");
      });
      this.classList.add("active");
      this.setAttribute("aria-selected", "true");

      // Update tab panels
      tabPanels.forEach((panel) => {
        if (panel.dataset.tab === targetTab) {
          panel.classList.add("active");
          panel.removeAttribute("hidden");
        } else {
          panel.classList.remove("active");
          panel.setAttribute("hidden", "");
        }
      });
    });
  });
}
