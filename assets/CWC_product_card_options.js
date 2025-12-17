/* =====================================================
   CWC PRODUCT CARD OPTIONS JAVASCRIPT
   =====================================================
   Purpose: Handles subscription toggle, variant selection,
   pricing calculations, and add-to-cart with selling plans
   ===================================================== */

/* =====================================================
   INITIALIZATION
   ===================================================== */
document.addEventListener("DOMContentLoaded", function () {
  const sections = document.querySelectorAll(".cwc-product-cards");

  sections.forEach((section) => {
    const sectionId = section.dataset.sectionId;
    const productId = section.dataset.productId;
    const variants = JSON.parse(section.dataset.variants || "[]");
    const sellingPlanGroups = JSON.parse(section.dataset.sellingPlans || "[]");

    initProductCard(section, sectionId, productId, variants, sellingPlanGroups);
  });
});

/* =====================================================
   MAIN INITIALIZATION FUNCTION
   ===================================================== */
function initProductCard(
  section,
  sectionId,
  productId,
  variants,
  sellingPlanGroups
) {
  // console.log(`Initializing product cards for section: ${sectionId}`);
  // console.log("Selling plan groups:", sellingPlanGroups);

  /* -----------------------------------------------------
     DOM ELEMENT REFERENCES
     ----------------------------------------------------- */
  const form = section.querySelector(`#product-form-${sectionId}`);
  const variantIdInput = section.querySelector(".variant-id-input");
  const sellingPlanInput = section.querySelector(".selling-plan-input");
  const subscriptionToggle = section.querySelector(
    `#subscription-toggle-${sectionId}`
  );
  const cards = section.querySelectorAll(".cwc-product-cards__card");

  /* -----------------------------------------------------
   SECTION SETTINGS
   ----------------------------------------------------- */
  const skipCart = section.dataset.skipCart === "true";
  console.log("Skip cart enabled:", skipCart);
  /* -----------------------------------------------------
     VALIDATION
     ----------------------------------------------------- */
  if (!form || !variantIdInput) {
    console.warn("Required form elements not found in section:", sectionId);
    return;
  }

  if (!cards.length) {
    console.warn("No product cards found in section:", sectionId);
    return;
  }

  // console.log(`Found ${cards.length} cards and ${variants.length} variants`);

  /* -----------------------------------------------------
     SELLING PLAN CONFIGURATION
     ----------------------------------------------------- */
  // Find the monthly/subscription selling plan
  // Priority: 1. Look for "month" in name, 2. Use first plan, 3. null if none exist
  let selectedSellingPlan = null;

  if (sellingPlanGroups.length > 0) {
    const allPlans = sellingPlanGroups[0]?.selling_plans || [];

    // Try to find a monthly plan
    selectedSellingPlan = allPlans.find(
      (plan) =>
        plan.name.toLowerCase().includes("month") ||
        plan.name.toLowerCase().includes("subscription")
    );

    // Fallback to first plan if no monthly found
    if (!selectedSellingPlan && allPlans.length > 0) {
      selectedSellingPlan = allPlans[0];
    }

    // console.log("Selected selling plan:", selectedSellingPlan);
  }

  const hasSellingPlans = !!selectedSellingPlan;

  /* =====================================================
     UTILITY FUNCTIONS
     ===================================================== */

  function findVariantById(variantId) {
    return variants.find((variant) => variant.id == variantId);
  }

  function formatPrice(priceInCents, currencyCode = "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
    }).format(priceInCents / 100);
  }

  /* -----------------------------------------------------
     CALCULATE SUBSCRIPTION PRICE
     ----------------------------------------------------- */
  function calculateSubscriptionPrice(originalPrice) {
    if (!selectedSellingPlan || !selectedSellingPlan.price_adjustments?.[0]) {
      return originalPrice;
    }

    const adjustment = selectedSellingPlan.price_adjustments[0];

    if (adjustment.value_type === "percentage") {
      return originalPrice - (originalPrice * adjustment.value) / 100;
    } else if (adjustment.value_type === "fixed_amount") {
      return originalPrice - adjustment.value;
    } else if (adjustment.value_type === "price") {
      return adjustment.value;
    }

    return originalPrice;
  }

  /* -----------------------------------------------------
     UPDATE SELLING PLAN INPUT
     ----------------------------------------------------- */
  function updateSellingPlanInput(isSubscription) {
    if (!sellingPlanInput) return;

    if (isSubscription && selectedSellingPlan) {
      sellingPlanInput.value = selectedSellingPlan.id;
      // console.log("Set selling plan:", selectedSellingPlan.id);
    } else {
      sellingPlanInput.value = "";
      // console.log("Cleared selling plan (one-time purchase)");
    }
  }

  /* -----------------------------------------------------
   UPDATE ALL CARD SUBTEXT
   ----------------------------------------------------- */
  function updateAllCardSubtext(isSubscription) {
    // console.log("Updating all card subtext, subscription:", isSubscription);

    cards.forEach((card) => {
      const subtextElement = card.querySelector(
        ".cwc-product-cards__price-subtext"
      );

      if (!subtextElement) return;

      const subscriptionText = subtextElement.dataset.subtextSubscription || "";
      const onetimeText = subtextElement.dataset.subtextOnetime || "";

      // Update text based on toggle state
      if (isSubscription && subscriptionText) {
        subtextElement.textContent = subscriptionText;
      } else if (!isSubscription && onetimeText) {
        subtextElement.textContent = onetimeText;
      } else if (!isSubscription && !onetimeText && subscriptionText) {
        // If no one-time text provided, hide the element
        subtextElement.textContent = "";
      }
    });
  }

  /* -----------------------------------------------------
     UPDATE ALL CARD PRICES
     ----------------------------------------------------- */
  function updateAllCardPrices(isSubscription) {
    // console.log("Updating all card prices, subscription:", isSubscription);

    cards.forEach((card) => {
      const originalPrice = parseInt(card.dataset.price);
      const priceDisplay = card.querySelector("[data-price-display]");

      if (!priceDisplay || !originalPrice) return;

      let displayPrice = originalPrice;

      // Apply subscription discount if toggled on
      if (isSubscription && hasSellingPlans) {
        displayPrice = calculateSubscriptionPrice(originalPrice);
      }

      priceDisplay.textContent = formatPrice(displayPrice);
    });
  }

  /* -----------------------------------------------------
     UPDATE SELECTED CARD STATE
     ----------------------------------------------------- */
  function updateSelectedCard(selectedVariantId) {
    cards.forEach((card) => {
      card.classList.remove("selected");
    });

    const selectedCard = section.querySelector(
      `.cwc-product-cards__card[data-variant-id="${selectedVariantId}"]`
    );

    if (selectedCard) {
      selectedCard.classList.add("selected");
      // selectedCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    // console.log("Updated selected card to variant:", selectedVariantId);
  }

  /* =====================================================
     SUBSCRIPTION TOGGLE HANDLER
     ===================================================== */
  if (subscriptionToggle) {
    // Initialize toggle state
    subscriptionToggle.checked = true; // Default to subscription
    updateSellingPlanInput(true);
    updateAllCardPrices(true);
    updateAllCardSubtext(true);

    // Update active label styling
    function updateToggleLabels(isChecked) {
      const labels = section.querySelectorAll(
        ".cwc-product-cards__toggle-label"
      );
      labels.forEach((label, index) => {
        if (index === 0) {
          // One-time purchase label
          label.classList.toggle(
            "cwc-product-cards__toggle-label--active",
            !isChecked
          );
        } else {
          // Subscription label
          label.classList.toggle(
            "cwc-product-cards__toggle-label--active",
            isChecked
          );
        }
      });
    }

    updateToggleLabels(true);

    subscriptionToggle.addEventListener("change", function () {
      const isSubscription = this.checked;
      // console.log("Subscription toggle changed:", isSubscription);

      updateSellingPlanInput(isSubscription);
      updateAllCardPrices(isSubscription);
      updateAllCardSubtext(isSubscription);
      updateToggleLabels(isSubscription);
    });
  } else {
    // No selling plans available - ensure one-time purchase
    updateSellingPlanInput(false);
    updateAllCardPrices(false);
    updateAllCardSubtext(false);
  }

  /* =====================================================
     CARD BUTTON CLICK HANDLERS
     ===================================================== */
  cards.forEach((card) => {
    const button = card.querySelector(".cwc-product-cards__button");
    const variantId = card.dataset.variantId;
    const isAvailable = card.dataset.available === "true";

    if (!button || !variantId) {
      console.warn("Card missing button or variant ID:", card);
      return;
    }

    button.addEventListener("click", function (e) {
      e.preventDefault();

      const variant = findVariantById(variantId);

      if (!variant) {
        console.warn("Variant not found for ID:", variantId);
        alert("Selected product variant not found.");
        return;
      }

      if (!isAvailable || !variant.available) {
        // console.log("Variant is sold out:", variantId);
        alert("This product is currently unavailable.");
        return;
      }

      // console.log("Card button clicked - Adding to cart:", {
      //   variantId,
      //   variantTitle: variant.title,
      //   price: variant.price,
      //   isSubscription: subscriptionToggle ? subscriptionToggle.checked : false,
      // });

      // Update form hidden input
      variantIdInput.value = variantId;

      // Update visual selected state
      updateSelectedCard(variantId);

      // Add to cart
      addToCart(variant, button);
    });
  });

  /* =====================================================
     ADD TO CART FUNCTIONALITY
     ===================================================== */
  /* =====================================================
   ADD TO CART FUNCTIONALITY
   ===================================================== */
  function addToCart(variant, button) {
    // Prevent double-clicks
    if (button.disabled) {
      return;
    }

    // Show loading state
    button.classList.add("loading");
    button.disabled = true;

    const originalText = button.textContent;
    const isSubscription = subscriptionToggle
      ? subscriptionToggle.checked
      : false;
    const sellingPlanId = sellingPlanInput ? sellingPlanInput.value : "";

    // Build cart data
    const data = {
      quantity: 1,
      id: variant.id,
    };

    // Add selling plan if subscription is selected
    if (isSubscription && sellingPlanId) {
      data.selling_plan = sellingPlanId;
    }

    console.log("Adding to cart:", data, "Skip cart:", skipCart);

    // Make the request to Shopify's cart API
    fetch("/cart/add.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((err) => {
            throw new Error(err.description || "Failed to add item to cart");
          });
        }
        return res.json();
      })
      .then((response) => {
        console.log("Item added to cart successfully:", response);

        // Dispatch custom event for other scripts
        document.dispatchEvent(
          new CustomEvent("cwc:item-added-to-cart", {
            detail: {
              variant,
              sectionId,
              response,
              isSubscription,
              sellingPlanId: sellingPlanId || null,
            },
          })
        );

        if (skipCart) {
          // Redirect directly to checkout
          console.log("Redirecting to checkout...");
          button.textContent = "Redirecting...";

          // Small delay to ensure cart is updated
          setTimeout(() => {
            window.location.href = "/checkout";
          }, 300);
        } else {
          // Show success message and reset button
          button.textContent = "Added to Cart!";
          setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
            button.classList.remove("loading");
          }, 2000);
        }
      })
      .catch((error) => {
        console.error("Error adding to cart:", error);

        button.disabled = false;
        button.classList.remove("loading");

        alert(
          error.message ||
            "An error occurred while adding to cart. Please try again."
        );
      });
  }

  /* =====================================================
     INITIAL STATE
     ===================================================== */
  // Set first available variant as selected on load
  const firstAvailableCard = Array.from(cards).find(
    (card) => card.dataset.available === "true"
  );

  if (firstAvailableCard) {
    const firstVariantId = firstAvailableCard.dataset.variantId;
    variantIdInput.value = firstVariantId;
    updateSelectedCard(firstVariantId);
    // console.log("Set initial variant:", firstVariantId);
  }

  /* =====================================================
     INITIALIZATION COMPLETION
     ===================================================== */
  // console.log(
  // `Product cards initialized for section ${sectionId}: ${cards.length} cards, subscription available: ${hasSellingPlans}`
  // );

  // Expose for testing/debugging
  window.CWCProductCard = window.CWCProductCard || {};
  window.CWCProductCard[sectionId] = {
    section,
    form,
    variants,
    cards,
    sellingPlanGroups,
    selectedSellingPlan,
    updateAllCardPrices,
    updateSelectedCard,
  };
}
