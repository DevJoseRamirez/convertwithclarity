(function () {
  "use strict";

  function initHeader(headerEl) {
    if (!headerEl || headerEl.dataset.initialized === "true") return;
    headerEl.dataset.initialized = "true";

    var toggle = headerEl.querySelector(".cwc_header__menu-toggle");
    var menu = headerEl.querySelector(".cwc_header__mobile-menu");

    if (!toggle || !menu) return;

    function closeMenu() {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      menu.hidden = true;
      headerEl.classList.remove("cwc_header--menu-open");
      document.body.style.overflow = "";
    }

    function openMenu() {
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
      menu.hidden = false;
      headerEl.classList.add("cwc_header--menu-open");
    }

    toggle.addEventListener("click", function () {
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close menu when any nav link or button inside it is clicked
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        closeMenu();
      });
    });

    // Close on Escape key
    document.addEventListener("keydown", function (e) {
      if (
        e.key === "Escape" &&
        toggle.getAttribute("aria-expanded") === "true"
      ) {
        closeMenu();
        toggle.focus();
      }
    });

    // Close if window resized above mobile breakpoint
    var mediaQuery = window.matchMedia("(min-width: 769px)");
    function handleBreakpointChange(e) {
      if (e.matches && toggle.getAttribute("aria-expanded") === "true") {
        closeMenu();
      }
    }
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleBreakpointChange);
    } else if (mediaQuery.addListener) {
      // Safari < 14
      mediaQuery.addListener(handleBreakpointChange);
    }
  }

  function initAll() {
    document.querySelectorAll(".cwc_header").forEach(initHeader);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }

  // Theme Editor live preview support
  document.addEventListener("shopify:section:load", function (event) {
    var header = event.target.querySelector(".cwc_header");
    if (header) initHeader(header);
  });

  // Reset state on section unload
  document.addEventListener("shopify:section:unload", function (event) {
    var header = event.target.querySelector(".cwc_header");
    if (header) {
      document.body.style.overflow = "";
    }
  });
})();
