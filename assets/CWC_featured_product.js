/* =====================================================
   CWC FEATURED PRODUCT - UI & DISPLAY
   =====================================================
   Purpose: Handles product variants, pricing display, 
   subscriptions, and FAQ interactions for featured 
   product sections.
   ===================================================== */

/* =====================================================
   INITIALIZATION
   ===================================================== */
document.addEventListener("DOMContentLoaded", function () {
  // Find all featured product sections on the page
  const sections = document.querySelectorAll(".cwc-featured-product");

  // Initialize each section independently
  sections.forEach((section) => {
    const sectionId = section.dataset.sectionId;
    const productId = section.dataset.productId;
    const variants = JSON.parse(section.dataset.variants || "[]");
    const sellingPlanGroups = JSON.parse(section.dataset.sellingPlans || "[]");
    const savingsDisplayType = section.dataset.savingsDisplay || "dollar";

    initFeaturedProductUI(
      section,
      sectionId,
      variants,
      sellingPlanGroups,
      savingsDisplayType
    );
  });
});

/* =====================================================
   MAIN UI INITIALIZATION FUNCTION
   ===================================================== */
function initFeaturedProductUI(
  section,
  sectionId,
  variants,
  sellingPlanGroups,
  savingsDisplayType
) {
  /* -----------------------------------------------------
     DOM ELEMENT REFERENCES
     ----------------------------------------------------- */
  // Form and core elements
  const form = section.querySelector(`#product-form-${sectionId}`);
  const variantIdInput = section.querySelector(".variant-id-input");
  const sellingPlanInput = section.querySelector(".selling-plan-input");

  // Product option controls
  const optionButtons = section.querySelectorAll(
    ".cwc-featured-product__option_button, .cwc-featured-product__option_type_button, .cwc-featured-product__option_size_button"
  );
  const optionInputs = section.querySelectorAll(
    ".cwc-featured-product__option-input, .cwc-featured-product__option_type-input, .cwc-featured-product__option_size-input"
  );

  console.log("Raw DOM query results:", {
    optionButtons: optionButtons.length,
    optionInputs: optionInputs.length,
    optionInputClasses: Array.from(optionInputs).map(input => ({
      className: input.className,
      optionIndex: input.dataset.optionIndex,
      name: input.name,
      value: input.value
    }))
  });

  // Pricing elements
  const currentPriceEl = section.querySelector(`#current-price-${sectionId}`);
  const comparePriceEl = section.querySelector(`#compare-price-${sectionId}`);
  const saveAmountEl = section.querySelector(`#save-amount-${sectionId}`);

  // Subscription controls
  const autoRefillCheckbox = section.querySelector(`#auto-refill-${sectionId}`);

  /* -----------------------------------------------------
     VALIDATION & LOGGING
     ----------------------------------------------------- */
  console.log("CWC UI Initialization - Found elements:", {
    form: !!form,
    variantIdInput: !!variantIdInput,
    sellingPlanInput: !!sellingPlanInput,
    optionButtons: optionButtons.length,
    optionInputs: optionInputs.length,
    autoRefillCheckbox: !!autoRefillCheckbox,
  });

  if (!form || !variantIdInput) {
    console.warn(
      "CWC Featured Product UI: Required elements not found for section",
      sectionId
    );
    console.warn("Missing:", {
      form: !form,
      variantIdInput: !variantIdInput,
    });
    return;
  }

  // Check if product has any options at all
  const hasOptions = optionInputs.length > 0;
  console.log(`Product has ${optionInputs.length} option(s)`);

  // Check if product has selling plans
  const hasSellingPlans = sellingPlanGroups.length > 0;
  console.log(`Product has ${sellingPlanGroups.length} selling plan group(s)`);

  /* =====================================================
     UTILITY FUNCTIONS
     ===================================================== */

  /* -----------------------------------------------------
     VARIANT FINDING FUNCTIONS
     ----------------------------------------------------- */
  function findVariant(selectedOptions) {
    return variants.find((variant) => {
      return variant.options.every((option, index) => {
        return option === selectedOptions[index];
      });
    });
  }

  function findVariantById(variantId) {
    return variants.find((variant) => variant.id == variantId);
  }

  /* -----------------------------------------------------
     SELLING PLAN MANAGEMENT
     ----------------------------------------------------- */
  function updateSellingPlan() {
    // If no selling plan input exists, nothing to update
    if (!sellingPlanInput) {
      console.log("No selling plan input - skipping selling plan update");
      return;
    }

    // If no checkbox exists, don't try to read it
    if (!autoRefillCheckbox) {
      console.log("No auto-refill checkbox - clearing selling plan");
      sellingPlanInput.value = "";
      return;
    }

    const isAutoRefill = autoRefillCheckbox.checked;

    if (isAutoRefill && sellingPlanGroups.length > 0) {
      const sellingPlanId = sellingPlanGroups[0]?.selling_plans?.[0]?.id;
      if (sellingPlanId) {
        sellingPlanInput.value = sellingPlanId;
        console.log("Set selling plan to:", sellingPlanId);
      }
    } else {
      sellingPlanInput.value = "";
      console.log("Cleared selling plan");
    }
  }

  /* -----------------------------------------------------
     PRICE FORMATTING
     ----------------------------------------------------- */
  function formatPrice(priceInCents, currencyCode = "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
    }).format(priceInCents / 100);
  }

  /* -----------------------------------------------------
     BUTTON PRICE UPDATES
     ----------------------------------------------------- */
  function updateAllButtonPrices(isAutoRefill) {
    const allButtons = section.querySelectorAll(
      ".cwc-featured-product__option_button"
    );

    // If no option buttons exist, skip this
    if (allButtons.length === 0) {
      console.log("No option buttons to update");
      return;
    }

    allButtons.forEach((button) => {
      const variantId = button.getAttribute("data-variant-id");
      const originalPrice = parseInt(button.getAttribute("data-price"));
      const originalComparePrice = parseInt(
        button.getAttribute("data-compare")
      );

      if (!variantId || !originalPrice) return;

      let displayPrice = originalPrice;
      let displayComparePrice = originalComparePrice;

      // Apply subscription discount if needed and selling plans exist
      if (isAutoRefill && sellingPlanGroups.length > 0) {
        const sellingPlan = sellingPlanGroups[0]?.selling_plans?.[0];
        if (sellingPlan && sellingPlan.price_adjustments?.[0]) {
          const adjustment = sellingPlan.price_adjustments[0];
          if (adjustment.value_type === "percentage") {
            displayPrice =
              originalPrice - (originalPrice * adjustment.value) / 100;
          } else if (adjustment.value_type === "fixed_amount") {
            displayPrice = originalPrice - adjustment.value;
          }
        }
      }

      // Update button price elements
      const priceEl = button.querySelector(
        ".cwc-featured-product__option_button_price"
      );
      const compareEl = button.querySelector(
        ".cwc-featured-product__option_button_compare_price"
      );
      const saveEl = button.querySelector(
        ".cwc-featured-product__option_button_save_perc"
      );

      if (priceEl) {
        priceEl.textContent = formatPrice(displayPrice);
      }

      // Show/hide compare price and savings
      if (displayComparePrice && displayComparePrice > displayPrice) {
        if (compareEl) {
          compareEl.textContent = formatPrice(displayComparePrice);
          compareEl.style.display = "inline";
        }
        if (saveEl) {
          const savings = displayComparePrice - displayPrice;
          const savingsPct = Math.round((savings / displayComparePrice) * 100);

          if (savingsDisplayType === "percentage") {
            saveEl.textContent = `You Save ${savingsPct}%`;
          } else {
            saveEl.textContent = `You Save ${formatPrice(savings)}`;
          }
          saveEl.style.display = "inline";
        }
      } else {
        if (compareEl) compareEl.style.display = "none";
        if (saveEl) saveEl.style.display = "none";
      }
    });

    console.log("Updated all button prices, subscription mode:", isAutoRefill);
  }

  /* =====================================================
     MAIN UPDATE FUNCTION
     ===================================================== */
  function updateVariant(variant = null) {
    // Debug: Log current state of all option inputs
    console.log("=== updateVariant called ===");

    // If no variant passed, try to find it from selected options
    if (!variant) {
      if (optionInputs.length === 0) {
        // Product has no options - use first variant or current
        variant = variants[0] || findVariantById(variantIdInput?.value);
        console.log("No options - using variant:", variant?.id);
      } else {
        // Product has options - find by selected values
        // IMPORTANT: Sort by option index to ensure correct order
        const sortedInputs = Array.from(optionInputs).sort((a, b) => {
          return parseInt(a.dataset.optionIndex || 0) - parseInt(b.dataset.optionIndex || 0);
        });

        const selectedOptions = sortedInputs.map(input => input.value);

        console.log("Finding variant for options:", selectedOptions);
        console.log("Option inputs found:", optionInputs.length);
        console.log("Option input values (sorted by index):", sortedInputs.map(input => ({
          index: input.dataset.optionIndex,
          value: input.value
        })));
        variant = findVariantByOptions(selectedOptions);
      }
    }

    // Check if subscription is enabled (only if checkbox exists)
    const isAutoRefill = autoRefillCheckbox ? autoRefillCheckbox.checked : false;

    if (!variant) {
      console.warn("No variant found in updateVariant");
      return;
    }

    console.log(
      "Updating to variant:",
      variant.id,
      "Options:",
      variant.options
    );

    /* -----------------------------------------------------
       UPDATE TYPE OPTION SELECTED DISPLAYS
       ----------------------------------------------------- */
    // Only run this if we have option inputs
    if (optionInputs.length > 0) {
      optionInputs.forEach((input) => {
        const currentValue = input.value;
        const wrapper = input.closest("[data-option-position]");
        if (!wrapper) return;

        const selectedName = wrapper.querySelector(
          ".cwc-featured-product__option_type_selected-name"
        );
        const selectedDesc = wrapper.querySelector(
          ".cwc-featured-product__option_type_selected-description"
        );

        if (selectedName && selectedDesc) {
          const buttons = wrapper.querySelectorAll(
            ".cwc-featured-product__option_type_button"
          );
          buttons.forEach((button) => {
            if (button.dataset.value === currentValue) {
              const description = button.dataset.variantDescription || "";
              selectedName.textContent = currentValue;
              selectedDesc.textContent = description;
            }
          });
        }
      });
    }

    /* -----------------------------------------------------
       UPDATE FORM INPUTS
       ----------------------------------------------------- */
    if (variantIdInput) {
      variantIdInput.value = variant.id;
    }

    updateSellingPlan();

    /* -----------------------------------------------------
       CALCULATE DISPLAY PRICES
       ----------------------------------------------------- */
    let displayPrice = variant.price;
    let displayComparePrice = variant.compare_at_price;

    // Apply subscription discount only if checkbox exists and is checked
    if (isAutoRefill && sellingPlanGroups.length > 0) {
      const sellingPlan = sellingPlanGroups[0]?.selling_plans?.[0];
      if (sellingPlan && sellingPlan.price_adjustments?.[0]) {
        const adjustment = sellingPlan.price_adjustments[0];
        if (adjustment.value_type === "percentage") {
          displayPrice =
            variant.price - (variant.price * adjustment.value) / 100;
        } else if (adjustment.value_type === "fixed_amount") {
          displayPrice = variant.price - adjustment.value;
        }
      }
    }

    /* -----------------------------------------------------
       UPDATE MAIN PRICE DISPLAY
       ----------------------------------------------------- */
    const priceElement =
      currentPriceEl ||
      section.querySelector(".cwc-featured-product__price-current") ||
      section.querySelector(`#current-price-${sectionId}`);

    if (priceElement) {
      priceElement.textContent = formatPrice(displayPrice);
    }

    /* -----------------------------------------------------
       UPDATE BUTTON PRICE DISPLAY
       ----------------------------------------------------- */
    const buttonCurrentPriceEl = section.querySelector(
      `#current-price-button-${sectionId}`
    );
    const buttonComparePriceEl = section.querySelector(
      `#compare-price-button-${sectionId}`
    );

    if (buttonCurrentPriceEl) {
      buttonCurrentPriceEl.textContent = formatPrice(displayPrice);
    }

    if (displayComparePrice && displayComparePrice > displayPrice) {
      if (buttonComparePriceEl) {
        buttonComparePriceEl.textContent = formatPrice(displayComparePrice);
        buttonComparePriceEl.style.display = "inline";
      }
    } else {
      if (buttonComparePriceEl) buttonComparePriceEl.style.display = "none";
    }

    /* -----------------------------------------------------
       UPDATE ALL OPTION BUTTON PRICES
       ----------------------------------------------------- */
    updateAllButtonPrices(isAutoRefill);

    /* -----------------------------------------------------
       UPDATE COMPARE PRICE AND SAVINGS DISPLAY
       ----------------------------------------------------- */
    const compareElement =
      comparePriceEl ||
      section.querySelector(".cwc-featured-product__price-compare") ||
      section.querySelector(`#compare-price-${sectionId}`);

    const saveElement =
      saveAmountEl ||
      section.querySelector(".cwc-featured-product__price-save") ||
      section.querySelector(`#save-amount-${sectionId}`);

    if (displayComparePrice && displayComparePrice > displayPrice) {
      if (compareElement) {
        compareElement.textContent = formatPrice(displayComparePrice);
        compareElement.style.display = "inline";
      }
      if (saveElement) {
        const savings = displayComparePrice - displayPrice;
        const savingsPct = Math.round((savings / displayComparePrice) * 100);

        if (savingsDisplayType === "percentage") {
          saveElement.innerHTML =
            "<span>Save</span> " + `<span>${savingsPct}%</span>`;
        } else {
          saveElement.innerHTML =
            "<span>Save</span> " + `<span>${formatPrice(savings)}</span>`;
        }
        saveElement.style.display = "flex";
      }
    } else {
      if (compareElement) compareElement.style.display = "none";
      if (saveElement) saveElement.style.display = "none";
    }

    /* -----------------------------------------------------
       DISPATCH VARIANT CHANGE EVENT
       ----------------------------------------------------- */
    // Dispatch event for add-to-cart script to listen
    document.dispatchEvent(
      new CustomEvent("cwc:variant-updated", {
        detail: {
          variant,
          displayPrice,
          displayComparePrice,
          isAutoRefill,
          sectionId,
        },
      })
    );
  }

  /* =====================================================
     EVENT LISTENERS SETUP
     ===================================================== */

  /* -----------------------------------------------------
   OPTION BUTTON CLICK HANDLERS
   ----------------------------------------------------- */
  // Only set up listeners if there are option buttons
  if (optionButtons.length > 0) {
    console.log(
      "CWC Debug - Setting up option button listeners:",
      optionButtons.length
    );

    optionButtons.forEach((button) => {
    button.addEventListener("click", function () {
      console.log("=== CWC Debug - Button clicked ===");

      const optionIndex = parseInt(this.getAttribute("data-option-index"));
      const value = this.getAttribute("data-value");

      console.log("Clicked option:", { optionIndex, value });

      // STEP 1: Update visual selection state for THIS option group only
      const optionWrapper = this.closest("[data-option-position]");
      if (optionWrapper) {
        const siblings = optionWrapper.querySelectorAll(
          ".cwc-featured-product__option_button, .cwc-featured-product__option_type_button, .cwc-featured-product__option_size_button"
        );
        siblings.forEach((sibling) => sibling.classList.remove("selected"));
      }
      this.classList.add("selected");

      // STEP 2: Update the hidden input for THIS option ONLY
      const hiddenInput = section.querySelector(
        `input[data-option-index="${optionIndex}"]`
      );
      if (hiddenInput) {
        console.log(
          `Updating option ${optionIndex} input: "${hiddenInput.value}" → "${value}"`
        );
        hiddenInput.value = value;
      } else {
        console.warn(`No hidden input found for option index ${optionIndex}`);
        return;
      }

      // STEP 3: Collect ALL current option values (including the one we just changed)
      // IMPORTANT: Sort by option index to ensure correct order
      const sortedInputs = Array.from(optionInputs).sort((a, b) => {
        return parseInt(a.dataset.optionIndex || 0) - parseInt(b.dataset.optionIndex || 0);
      });

      const selectedOptions = sortedInputs.map(input => input.value);
      console.log("All selected options after click (sorted):", selectedOptions);

      // STEP 4: Find the variant that matches ALL selected options
      const matchedVariant = findVariantByOptions(selectedOptions);

      if (matchedVariant) {
        console.log(
          "Found matching variant:",
          matchedVariant.id,
          matchedVariant.title
        );

        // Update the variant ID input
        if (variantIdInput) {
          variantIdInput.value = matchedVariant.id;
          console.log("Updated variant ID input to:", matchedVariant.id);
        }

        // Update the display with this variant
        updateVariant(matchedVariant);
      } else {
        console.warn("No variant found matching options:", selectedOptions);
        // Still try to update with current selection
        updateVariant();
      }
    });
    });
  } else {
    console.log("No option buttons found - product has no selectable options");
  }

  /* -----------------------------------------------------
   FIND VARIANT BY OPTIONS
   ----------------------------------------------------- */
  function findVariantByOptions(selectedOptions) {
    // Find variant where ALL options match the selected values
    console.log("Looking for variant with options:", selectedOptions);
    console.log("Product has", variants[0]?.options.length || 0, "option(s) total");

    const matchedVariant = variants.find((variant) => {
      // Only compare the options that exist in the variant
      // This handles cases where product has 1, 2, or 3 options
      const matches = variant.options.every((option, index) => {
        const selectedValue = selectedOptions[index];
        const variantValue = variant.options[index];

        // Log each comparison for debugging
        console.log(`  Comparing option ${index}: "${selectedValue}" === "${variantValue}"?`, selectedValue === variantValue);

        return option === selectedValue;
      });

      if (matches) {
        console.log("  ✓ Variant matched:", variant.id, variant.options);
      }

      return matches;
    });

    if (!matchedVariant) {
      console.warn("No variant matched. Available variants:",
        variants.map(v => ({ id: v.id, options: v.options }))
      );
    }

    return matchedVariant;
  }

  /* -----------------------------------------------------
     SUBSCRIPTION CHECKBOX HANDLER
     ----------------------------------------------------- */
  if (autoRefillCheckbox) {
    // Set checkbox as initially checked
    autoRefillCheckbox.checked = true;

    // Add visual styling for initially checked state
    const checkboxIcon = section.querySelector(".cwc-checkbox-icon");
    if (checkboxIcon) {
      checkboxIcon.classList.add("initially-checked");
    }

    autoRefillCheckbox.addEventListener("change", function () {
      console.log("Subscription checkbox changed:", this.checked);
      updateVariant(); // Recalculate all prices based on new subscription state
    });
  } else {
    console.log("No subscription checkbox found - product has no subscription options");
  }

  /* =====================================================
     FAQ FUNCTIONALITY
     ===================================================== */
  function initFAQBlocks() {
    const faqItems = section.querySelectorAll(".cwc-featured-product__faq");

    console.log(`Section ${sectionId}: Found ${faqItems.length} FAQ items`);

    faqItems.forEach((item, index) => {
      const question = item.querySelector(
        ".cwc-featured-product__faq-question"
      );
      const answer = item.querySelector(".cwc-featured-product__faq-answer");
      const icon = item.querySelector(".cwc-featured-product__faq-icon");

      if (!question || !answer) return;

      question.addEventListener("click", () => {
        console.log(`Clicked FAQ ${index} in section ${sectionId}`);
        console.log(
          `Current state: ${
            item.classList.contains("active") ? "active" : "inactive"
          }`
        );

        const isCurrentlyActive = item.classList.contains("active");

        // Close all others first - BUT ONLY IN THIS SECTION
        faqItems.forEach((other, otherIndex) => {
          if (other !== item && other.classList.contains("active")) {
            console.log(`Closing FAQ ${otherIndex} in section ${sectionId}`);
            const otherAnswer = other.querySelector(
              ".cwc-featured-product__faq-answer"
            );
            const otherIcon = other.querySelector(
              ".cwc-featured-product__faq-icon"
            );

            // Start closing animation
            otherAnswer.style.maxHeight = otherAnswer.scrollHeight + "px";
            setTimeout(() => {
              otherAnswer.style.maxHeight = "0";
              other.classList.remove("active");
              if (otherIcon) otherIcon.textContent = "+";
            }, 10);
          }
        });

        // Small delay to let others start closing, then toggle this one
        setTimeout(() => {
          if (isCurrentlyActive) {
            console.log(`Closing clicked FAQ ${index}`);
            // Close this FAQ
            answer.style.maxHeight = answer.scrollHeight + "px";
            setTimeout(() => {
              answer.style.maxHeight = "0";
              item.classList.remove("active");
              if (icon) icon.textContent = "+";
            }, 10);
          } else {
            console.log(`Opening clicked FAQ ${index}`);
            // Open this FAQ
            item.classList.add("active");
            if (icon) icon.textContent = "−";
            answer.style.maxHeight = answer.scrollHeight + "px";

            // After transition, allow natural height growth
            answer.addEventListener(
              "transitionend",
              () => {
                if (item.classList.contains("active")) {
                  answer.style.maxHeight = "none";
                }
              },
              { once: true }
            );
          }
        }, 50);
      });
    });
  }

  /* =====================================================
     INITIALIZATION COMPLETION
     ===================================================== */

  // Initialize FAQ blocks
  initFAQBlocks();

  // Initialize with current selection
  updateVariant();

  // Expose for testing/debugging
  window.CWCFeaturedProduct = window.CWCFeaturedProduct || {};
  window.CWCFeaturedProduct.testUpdate = function (testSection) {
    if (testSection === section) {
      console.log("Testing updateVariant for section:", sectionId);
      updateVariant();
    }
  };
}
