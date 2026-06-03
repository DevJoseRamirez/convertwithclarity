/* ==============================
   CWC FAQ
   Accordion behavior with smooth height transition.
   - Single-open per section (opening a new item closes any others)
   - Scoped to each `.cwc_faq` instance so multiple FAQ sections
     on the same page don't interfere
   - aria-expanded / aria-controls / role=region / hidden wired
   - is-open class on parent drives chevron rotate
   - Re-bound on shopify:section:load for theme editor
   ============================== */

(function () {
  "use strict";

  function openPanel(item, btn, panel) {
    btn.setAttribute("aria-expanded", "true");
    item.classList.add("is-open");
    panel.removeAttribute("hidden");

    panel.style.maxHeight = "0px";
    // Force reflow so the transition picks up the change.
    panel.offsetHeight; // eslint-disable-line no-unused-expressions
    panel.style.maxHeight = panel.scrollHeight + "px";

    var onEnd = function (e) {
      if (e.propertyName !== "max-height") return;
      panel.removeEventListener("transitionend", onEnd);
      if (item.classList.contains("is-open")) {
        panel.style.maxHeight = "none";
      }
    };
    panel.addEventListener("transitionend", onEnd);
  }

  function closePanel(item, btn, panel) {
    panel.style.maxHeight = panel.scrollHeight + "px";
    panel.offsetHeight; // eslint-disable-line no-unused-expressions
    panel.style.maxHeight = "0px";

    btn.setAttribute("aria-expanded", "false");
    item.classList.remove("is-open");

    var onEnd = function (e) {
      if (e.propertyName !== "max-height") return;
      panel.removeEventListener("transitionend", onEnd);
      if (!item.classList.contains("is-open")) {
        panel.setAttribute("hidden", "");
        panel.style.maxHeight = "";
      }
    };
    panel.addEventListener("transitionend", onEnd);
  }

  function initFaq(root) {
    if (!root) return;
    var questions = root.querySelectorAll(".cwc_faq__question");
    if (!questions.length) return;

    // Close every other open item within THIS section (scoped to root)
    // so multiple FAQ sections on the same page don't fight each other.
    function closeOthers(currentItem) {
      var openItems = root.querySelectorAll(".cwc_faq__item.is-open");
      openItems.forEach(function (other) {
        if (other === currentItem) return;
        var otherBtn = other.querySelector(".cwc_faq__question");
        var otherPanelId = otherBtn
          ? otherBtn.getAttribute("aria-controls")
          : null;
        var otherPanel = otherPanelId
          ? document.getElementById(otherPanelId)
          : null;
        if (otherBtn && otherPanel) {
          closePanel(other, otherBtn, otherPanel);
        }
      });
    }

    questions.forEach(function (btn) {
      if (btn.dataset.cwcFaqBound === "true") return;
      btn.dataset.cwcFaqBound = "true";

      btn.addEventListener("click", function () {
        var panelId = btn.getAttribute("aria-controls");
        var panel = panelId ? document.getElementById(panelId) : null;
        var item = btn.closest(".cwc_faq__item");

        if (!panel || !item) return;

        var isOpen = btn.getAttribute("aria-expanded") === "true";

        if (isOpen) {
          closePanel(item, btn, panel);
        } else {
          // Single-open mode: close any other open items in this section first.
          closeOthers(item);
          openPanel(item, btn, panel);
        }
      });
    });
  }

  function initAll(scope) {
    var sections = (scope || document).querySelectorAll(".cwc_faq");
    sections.forEach(initFaq);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initAll();
    });
  } else {
    initAll();
  }

  // Shopify theme editor: re-init when this section is loaded/updated.
  document.addEventListener("shopify:section:load", function (e) {
    if (e && e.target) initAll(e.target);
  });
})();
