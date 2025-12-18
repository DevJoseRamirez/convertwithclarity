/* =====================================================
   CWC FEATURED PRODUCT - ADD TO CART
   =====================================================
   Purpose: Handles add-to-cart functionality for both
   standard products and bundle products.
   ===================================================== */

/* =====================================================
   INITIALIZATION
   ===================================================== */
document.addEventListener("DOMContentLoaded", function () {
  // Find all featured product sections on the page
  const sections = document.querySelectorAll(".cwc-featured-product");

  // Initialize add-to-cart for each section
  sections.forEach((section) => {
    const sectionId = section.dataset.sectionId;
    const variants = JSON.parse(section.dataset.variants || "[]");

    initAddToCart(section, sectionId, variants);
  });
});

/* =====================================================
   MAIN ADD TO CART INITIALIZATION
   ===================================================== */
function initAddToCart(section, sectionId, variants) {
  /* -----------------------------------------------------
     DOM ELEMENT REFERENCES
     ----------------------------------------------------- */
  const form = section.querySelector(`#product-form-${sectionId}`);
  const variantIdInput = section.querySelector(".variant-id-input");
  const sellingPlanInput = section.querySelector(".selling-plan-input");
  const addToCartButton = section.querySelector(`#add-to-cart-${sectionId}`);

  /* -----------------------------------------------------
     VALIDATION & LOGGING
     ----------------------------------------------------- */
  console.log("CWC Add to Cart Initialization - Found elements:", {
    form: !!form,
    addToCartButton: !!addToCartButton,
    variantIdInput: !!variantIdInput,
    sellingPlanInput: !!sellingPlanInput,
  });

  if (!form || !addToCartButton || !variantIdInput) {
    console.warn(
      "CWC Add to Cart: Required elements not found for section",
      sectionId
    );
    console.warn("Missing:", {
      form: !form,
      addToCartButton: !addToCartButton,
      variantIdInput: !variantIdInput,
    });
    return;
  }

  /* -----------------------------------------------------
     SELLING PLAN INPUT SETUP
     ----------------------------------------------------- */
  // Create selling plan input if it doesn't exist (for products with subscriptions)
  if (!sellingPlanInput && form) {
    const newSellingPlanInput = document.createElement("input");
    newSellingPlanInput.type = "hidden";
    newSellingPlanInput.name = "selling_plan";
    newSellingPlanInput.className = "selling-plan-input";
    newSellingPlanInput.value = "";
    form.appendChild(newSellingPlanInput);
    console.log("Created selling plan input");
  }

  const finalSellingPlanInput =
    sellingPlanInput || form.querySelector(".selling-plan-input");

  if (!finalSellingPlanInput) {
    console.log("No selling plan input - product does not have subscriptions");
  }

  /* =====================================================
     UTILITY FUNCTIONS
     ===================================================== */
  function findVariantById(variantId) {
    return variants.find((variant) => variant.id == variantId);
  }

  /* -----------------------------------------------------
     BUNDLE MODE DETECTION
     ----------------------------------------------------- */
  const isBundleMode =
    addToCartButton &&
    (addToCartButton.dataset.bundleVariant1 ||
      addToCartButton.dataset.bundleVariant2 ||
      addToCartButton.dataset.bundleVariant3 ||
      addToCartButton.dataset.bundleVariant4);

  console.log("Bundle mode detected:", isBundleMode);
  if (isBundleMode) {
    console.log("Bundle variants:", {
      v1: addToCartButton.dataset.bundleVariant1,
      v2: addToCartButton.dataset.bundleVariant2,
      v3: addToCartButton.dataset.bundleVariant3,
      v4: addToCartButton.dataset.bundleVariant4,
    });
  }

  /* =====================================================
     BUNDLE ADD TO CART FUNCTIONALITY
     ===================================================== */
  function handleBundleAddToCart() {
    console.log("=== Bundle Add to Cart Started ===");

    if (!variantIdInput || !variantIdInput.value) {
      console.warn("Bundle: No main variant ID");
      return;
    }

    const mainVariantId = Number(variantIdInput.value);
    const skipCart = addToCartButton.dataset.skipCart === "true";

    console.log("Main variant ID:", mainVariantId);
    console.log("Skip cart mode:", skipCart);

    if (!Number.isFinite(mainVariantId)) {
      console.warn("Bundle: Invalid main variant ID:", variantIdInput.value);
      return;
    }

    // Get selling plan ID (only if selling plan input exists)
    const sellingPlanId =
      finalSellingPlanInput && finalSellingPlanInput.value
        ? Number(finalSellingPlanInput.value)
        : null;

    console.log("Selling plan ID:", sellingPlanId || "none");

    const items = [];

    // Collect bundle products from data attributes
    [
      "bundleVariant1",
      "bundleVariant2",
      "bundleVariant3",
      "bundleVariant4",
    ].forEach((key) => {
      const value = addToCartButton.dataset[key];
      if (value && !isNaN(value)) {
        items.push({
          id: Number(value),
          quantity: 1,
        });
        console.log(`Added ${key}:`, value);
      }
    });

    // Add main product with subscription
    const mainItem = {
      id: mainVariantId,
      quantity: 1,
      selling_plan: sellingPlanId,
    };

    items.push(mainItem);
    console.log("Main product added:", mainItem);

    console.log("Final items payload:", items);

    if (!items.length) {
      console.warn("Bundle: No items to add to cart");
      return;
    }

    // Show loading state
    addToCartButton.disabled = true;
    addToCartButton.classList.add("loading_hk");

    // Send to Shopify cart API
    fetch("/cart/add.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ items }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to add bundle to cart");
        return res.json();
      })
      .then((data) => {
        console.log("Bundle added successfully:", data);

        const btnText = addToCartButton.querySelector(".cwc-button-text");
        const originalText =
          btnText?.dataset.originalText || "Add Bundle to Cart";

        // If skip-cart mode, redirect to checkout
        if (skipCart) {
          console.log("Redirecting to checkout...");
          window.location.href = "/checkout";
          return;
        }

        // Show success message
        if (btnText) {
          if (!btnText.dataset.originalText) {
            btnText.dataset.originalText = btnText.textContent;
          }
          btnText.textContent = "Bundle Added!";
          setTimeout(() => {
            btnText.textContent = originalText;
          }, 2000);
        }

        // Update and open cart drawer
        updateCartDrawer(data.items[data.items.length - 1].id);

        // Dispatch custom event
        document.dispatchEvent(
          new CustomEvent("cwc:item-added-to-cart", {
            detail: {
              items,
              sectionId,
              isBundle: true,
            },
          })
        );
      })
      .catch((err) => {
        console.error("Bundle add-to-cart error:", err);
        alert(
          "There was an issue adding the bundle to your cart. Please try again."
        );
      })
      .finally(() => {
        addToCartButton.disabled = false;
        addToCartButton.classList.remove("loading_hk");
      });
  }

  /* =====================================================
     STANDARD ADD TO CART FUNCTIONALITY
     ===================================================== */
  function handleStandardAddToCart() {
    console.log("=== Standard Add to Cart Started ===");

    const selectedVariantId = variantIdInput.value;
    const sellingPlanId = finalSellingPlanInput
      ? finalSellingPlanInput.value
      : "";
    const variant = findVariantById(selectedVariantId);

    // Validation
    if (!variant) {
      console.warn("No variant found for ID:", selectedVariantId);
      return;
    }

    if (!variant.available) {
      alert("This product is currently unavailable.");
      return;
    }

    // Show loading state
    addToCartButton.classList.add("loading_hk");

    // Build cart data
    const data = {
      quantity: 1,
      id: selectedVariantId,
    };

    // Add selling plan if subscription is selected (only if input exists and has value)
    if (sellingPlanId) {
      data.selling_plan = sellingPlanId;
      console.log("Adding with selling plan:", sellingPlanId);
    } else {
      console.log("Adding without selling plan - one-time purchase");
    }

    // Make the request to Shopify's cart API
    fetch("/cart/add.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to add item to cart");
        return res.json();
      })
      .then((item) => {
        addToCartButton.classList.remove("loading_hk");

        // Show success message
        const buttonText = addToCartButton.querySelector(".cwc-button-text");
        const originalText = buttonText?.dataset.originalText || "Add to Cart";
        if (buttonText) {
          buttonText.textContent = "Added to Cart!";
          setTimeout(() => {
            buttonText.textContent = originalText;
          }, 2000);
        }

        console.log("Item added to cart:", data);

        // Update and open cart drawer
        updateCartDrawer(item.id);

        // Dispatch custom event for other scripts to listen
        document.dispatchEvent(
          new CustomEvent("cwc:item-added-to-cart", {
            detail: { variant, sellingPlanId, sectionId },
          })
        );
      })
      .catch((error) => {
        console.error("Error:", error);
        addToCartButton.classList.remove("loading_hk");
        alert(
          "An error occurred while processing your request. Please try again."
        );
      });
  }

  /* -----------------------------------------------------
     VARIANT UPDATE LISTENER
     ----------------------------------------------------- */
  // Listen for variant updates from the UI script
  document.addEventListener("cwc:variant-updated", (event) => {
    if (event.detail.sectionId !== sectionId) return;

    const { variant } = event.detail;

    // Update button availability
    if (variant.available) {
      addToCartButton.disabled = false;
      const buttonText = addToCartButton.querySelector(".cwc-button-text");
      if (buttonText) {
        buttonText.textContent =
          buttonText.dataset.originalText || "Add to Cart";
      }
    } else {
      addToCartButton.disabled = true;
      const buttonText = addToCartButton.querySelector(".cwc-button-text");
      if (buttonText) {
        buttonText.textContent = "Sold Out";
      }
    }
  });

  /* -----------------------------------------------------
     ADD TO CART BUTTON SETUP & EVENT LISTENER
     ----------------------------------------------------- */
  // Store original button text
  const buttonText = addToCartButton.querySelector(".cwc-button-text");
  if (buttonText && !buttonText.dataset.originalText) {
    buttonText.dataset.originalText = buttonText.textContent;
  }

  // Attach the correct handler based on mode
  if (isBundleMode) {
    console.log("Attaching BUNDLE add-to-cart handler");
    addToCartButton.addEventListener("click", handleBundleAddToCart);

    // Expose global handler for external triggers
    window.CWCBundleAddToCart = handleBundleAddToCart;
  } else {
    console.log("Attaching STANDARD add-to-cart handler");
    addToCartButton.addEventListener("click", handleStandardAddToCart);
  }
}

/* =====================================================
   CART DRAWER UPDATE UTILITY
   ===================================================== */
function updateCartDrawer(itemId) {
  // Fetch updated cart sections
  fetch(`${window.Shopify.routes.root}?sections=cart-drawer,cart-icon-bubble`)
    .then((response) => response.json())
    .then((sections) => {
      const cartDrawer = document.querySelector("cart-drawer");

      if (!cartDrawer) {
        console.warn("Cart drawer element not found");
        return;
      }

      // Remove is-empty class if present
      cartDrawer.classList.remove("is-empty");
      const drawerInner = cartDrawer.querySelector(".drawer__inner");
      if (drawerInner) {
        drawerInner.classList.remove("is-empty");
      }

      // Use Dawn's built-in renderContents method
      if (cartDrawer.renderContents) {
        cartDrawer.renderContents({
          sections: sections,
          id: itemId,
        });
      } else {
        // Fallback: manually update sections and open drawer
        cartDrawer.getSectionsToRender().forEach((section) => {
          const sectionElement = section.selector
            ? document.querySelector(section.selector)
            : document.getElementById(section.id);

          if (sectionElement && sections[section.id]) {
            sectionElement.innerHTML = cartDrawer.getSectionInnerHTML(
              sections[section.id],
              section.selector
            );
          }
        });

        cartDrawer.open();
      }
    })
    .catch((error) => {
      console.error("Error updating cart drawer:", error);
      // Fallback: just open the drawer
      const cartDrawer = document.querySelector("cart-drawer");
      if (cartDrawer && cartDrawer.open) {
        cartDrawer.open();
      }
    });
}
