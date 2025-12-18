/* =====================================================
   CWC FEATURED PRODUCT JAVASCRIPT - COMPLETE WITH FIX
   =====================================================
   Purpose: Handles product variants, pricing, subscriptions, 
   add-to-cart functionality, and FAQ interactions for 
   featured product sections.
   
   FIXED: Variant selection now uses Dawn's proven approach
   ===================================================== */

/* =====================================================
   INITIALIZATION
   ===================================================== */
document.addEventListener("DOMContentLoaded", function () {
  const sections = document.querySelectorAll(".cwc-featured-product");

  sections.forEach((section) => {
    const sectionId = section.dataset.sectionId;
    const productId = section.dataset.productId;
    const variants = JSON.parse(section.dataset.variants || "[]");
    const sellingPlanGroups = JSON.parse(section.dataset.sellingPlans || "[]");
    const savingsDisplayType = section.dataset.savingsDisplay || "dollar";

    initFeaturedProduct(
      section,
      sectionId,
      variants,
      sellingPlanGroups,
      savingsDisplayType
    );
  });
});

/* =====================================================
   MAIN INITIALIZATION FUNCTION
   ===================================================== */
function initFeaturedProduct(
  section,
  sectionId,
  variants,
  sellingPlanGroups,
  savingsDisplayType
) {
  console.log("=== Initializing Featured Product ===");
  console.log("Section ID:", sectionId);
  console.log("Variants:", variants.length);

  /* -----------------------------------------------------
     DOM ELEMENT REFERENCES
     ----------------------------------------------------- */
  const form = section.querySelector(`#product-form-${sectionId}`);
  const variantIdInput = section.querySelector(".variant-id-input");
  const sellingPlanInput = section.querySelector(".selling-plan-input");

  const optionButtons = section.querySelectorAll(
    ".cwc-featured-product__option_button, .cwc-featured-product__option_type_button, .cwc-featured-product__option_size_button"
  );

  const optionInputs = section.querySelectorAll(
    "input[data-option-index]:not(.variant-id-input):not(.selling-plan-input)"
  );

  const autoRefillCheckbox = section.querySelector(`#auto-refill-${sectionId}`);

  const addToCartButton = section.querySelector(".cwc-add-to-cart-button");

  const priceDisplay = section.querySelector(".cwc-price-display");

  /* -----------------------------------------------------
     VALIDATION
     ----------------------------------------------------- */
  if (!form || !variantIdInput) {
    console.warn("Required elements not found for section", sectionId);
    return;
  }

  console.log("Found option inputs:", optionInputs.length);
  console.log("Found option buttons:", optionButtons.length);

  /* =====================================================
     SELLING PLAN MANAGEMENT
     ===================================================== */
  let finalSellingPlanInput = sellingPlanInput;

  if (!finalSellingPlanInput && form) {
    const newInput = document.createElement("input");
    newInput.type = "hidden";
    newInput.name = "selling_plan";
    newInput.className = "selling-plan-input";
    newInput.value = "";
    form.appendChild(newInput);
    finalSellingPlanInput = newInput;
    console.log("Created selling plan input");
  }

  function updateSellingPlan() {
    if (!finalSellingPlanInput) return;

    const isAutoRefill = autoRefillCheckbox && autoRefillCheckbox.checked;

    if (isAutoRefill && sellingPlanGroups.length > 0) {
      const sellingPlanId =
        sellingPlanGroups[0]?.selling_plans?.[0]?.id ||
        sellingPlanGroups[0]?.selling_plans?.[0];
      finalSellingPlanInput.value = sellingPlanId || "";
      console.log("Selling plan set:", sellingPlanId);
    } else {
      finalSellingPlanInput.value = "";
      console.log("Selling plan cleared");
    }
  }

  /* =====================================================
     VARIANT FINDING FUNCTIONS
     ===================================================== */
  function findVariantById(variantId) {
    return variants.find((v) => v.id == variantId);
  }

  /* =====================================================
     PRICING FUNCTIONS
     ===================================================== */
  function formatPrice(priceInCents) {
    return (priceInCents / 100).toFixed(2);
  }

  function getPriceForDisplay(variant) {
    if (!variant) return null;

    const isAutoRefill = autoRefillCheckbox && autoRefillCheckbox.checked;
    const sellingPlanId = finalSellingPlanInput?.value;

    if (isAutoRefill && sellingPlanId && variant.selling_plan_allocations) {
      const allocation = variant.selling_plan_allocations.find(
        (alloc) => alloc.selling_plan_id == sellingPlanId
      );

      if (allocation) {
        return {
          price: allocation.per_delivery_price,
          compareAtPrice: variant.price,
          isSubscription: true,
        };
      }
    }

    return {
      price: variant.price,
      compareAtPrice: variant.compare_at_price,
      isSubscription: false,
    };
  }

  function updatePriceDisplay(variant) {
    if (!priceDisplay || !variant) return;

    const pricing = getPriceForDisplay(variant);
    if (!pricing) return;

    const priceElement = priceDisplay.querySelector(".cwc-price");
    const compareElement = priceDisplay.querySelector(".cwc-compare-price");
    const saveElement = priceDisplay.querySelector(".cwc-save-amount");

    if (priceElement) {
      priceElement.textContent = `$${formatPrice(pricing.price)}`;
    }

    if (pricing.compareAtPrice && pricing.compareAtPrice > pricing.price) {
      if (compareElement) {
        compareElement.textContent = `$${formatPrice(pricing.compareAtPrice)}`;
        compareElement.style.display = "";
      }

      if (saveElement) {
        const savings = pricing.compareAtPrice - pricing.price;
        const saveText =
          savingsDisplayType === "percent"
            ? `${Math.round((savings / pricing.compareAtPrice) * 100)}%`
            : `$${formatPrice(savings)}`;
        saveElement.textContent = `Save ${saveText}`;
        saveElement.style.display = "";
      }
    } else {
      if (compareElement) compareElement.style.display = "none";
      if (saveElement) saveElement.style.display = "none";
    }

    console.log("Price updated:", pricing);
  }

  function updateAddToCartButton(variant) {
    if (!addToCartButton) return;

    const buttonText = addToCartButton.querySelector(".cwc-button-text");

    if (variant && variant.available) {
      addToCartButton.disabled = false;
      if (buttonText) {
        buttonText.textContent =
          buttonText.dataset.originalText || "Add to Cart";
      }
    } else {
      addToCartButton.disabled = true;
      if (buttonText) {
        buttonText.textContent = "Sold Out";
      }
    }
  }

  /* =====================================================
     MAIN UPDATE FUNCTION
     ===================================================== */
  function updateVariant(variant = null) {
    console.log("=== Updating Variant ===");

    if (!variant && optionInputs.length === 0) {
      variant = variants[0] || findVariantById(variantIdInput?.value);
    }

    if (!variant) {
      console.warn("No variant to update");
      return;
    }

    console.log("Variant:", variant.id, variant.title);

    if (variantIdInput) {
      variantIdInput.value = variant.id;
    }

    updateSellingPlan();
    updatePriceDisplay(variant);
    updateAddToCartButton(variant);

    // Dispatch event for add-to-cart script
    document.dispatchEvent(
      new CustomEvent("cwc:variant-updated", {
        detail: { variant, sectionId },
      })
    );

    console.log("=== Variant Update Complete ===");
  }

  /* =====================================================
     EVENT LISTENERS - OPTION BUTTONS (THE FIX!)
     ===================================================== */
  console.log("Setting up option button listeners:", optionButtons.length);

  /* =====================================================
   FIX FOR PARTIAL OPTION SELECTION
   ===================================================== 
   
   Problem: Product has 2 options (Flavor + Size) but section
   only shows Flavor option. Need to fill in missing Size value.
   
   Solution: When collecting options, if we're missing some,
   use the current variant's values for the missing positions.
   
   ===================================================== */

  // REPLACE the optionButtons.forEach block with this:

  optionButtons.forEach((button) => {
    button.addEventListener("click", function () {
      console.log("\n=== Option Button Clicked ===");

      const optionIndex = this.getAttribute("data-option-index");
      const value = this.getAttribute("data-value");

      console.log("Option Index:", optionIndex);
      console.log("Value:", value);

      // Update visual state
      const siblings = this.parentNode.querySelectorAll(
        ".cwc-featured-product__option_button, .cwc-featured-product__option_type_button, .cwc-featured-product__option_size_button"
      );
      siblings.forEach((sibling) => sibling.classList.remove("selected"));
      this.classList.add("selected");

      // Update hidden input
      const hiddenInput = section.querySelector(
        `input[data-option-index="${optionIndex}"]`
      );

      if (hiddenInput) {
        console.log(
          `Updating option ${optionIndex}: "${hiddenInput.value}" → "${value}"`
        );
        hiddenInput.value = value;
      } else {
        console.warn("⚠ Hidden input not found for option index:", optionIndex);
        return;
      }

      // ========================================================
      // FIXED: Build complete option array for variant matching
      // ========================================================

      // Get current variant to know how many options we need
      const currentVariantId = variantIdInput.value;
      const currentVariant = findVariantById(currentVariantId);

      if (!currentVariant) {
        console.error("No current variant found");
        return;
      }

      const totalOptionsInProduct = currentVariant.options.length;
      console.log("Product has", totalOptionsInProduct, "total options");
      console.log("Section displays", optionInputs.length, "option inputs");

      // Build complete option array
      const selectedOptions = [];

      for (let i = 0; i < totalOptionsInProduct; i++) {
        // Try to find an input for this position
        const input = Array.from(optionInputs).find(
          (inp) => inp.getAttribute("data-option-index") === String(i)
        );

        if (input) {
          // We have an input for this position - use its value
          selectedOptions[i] = input.value;
          console.log(`Position ${i}: Using input value "${input.value}"`);
        } else {
          // No input for this position - use current variant's value
          selectedOptions[i] = currentVariant.options[i];
          console.log(
            `Position ${i}: Using current variant value "${currentVariant.options[i]}" (no input)`
          );
        }
      }

      console.log("Complete options array:", selectedOptions);

      // Find matching variant
      const variant = variants.find((v) => {
        const isMatch = v.options.every((variantOptionValue, position) => {
          return variantOptionValue === selectedOptions[position];
        });

        if (isMatch) {
          console.log(`✓ Match found: Variant ${v.id} - ${v.title}`);
        }

        return isMatch;
      });

      if (variant) {
        console.log("=== Variant Found ===");
        console.log("ID:", variant.id);
        console.log("Title:", variant.title);
        console.log("Options:", variant.options);

        updateVariant(variant);
      } else {
        console.error("=== ✗ No Variant Found ===");
        console.log("Searched for:", selectedOptions);
        console.log("Available variants:");
        variants.forEach((v) => {
          console.log(`  ${v.id}: [${v.options.join(", ")}]`);
        });

        if (addToCartButton) {
          addToCartButton.disabled = true;
          const buttonText = addToCartButton.querySelector(".cwc-button-text");
          if (buttonText) {
            buttonText.textContent = "Unavailable";
          }
        }
      }

      console.log("=== End Option Change ===\n");
    });
  });

  /* =====================================================
   HOW THIS WORKS
   ===================================================== 
   
   Example: Product with Flavor + Size
   
   Scenario 1: Section shows BOTH options
   ----------------------------------------
   Product options: [Flavor, Size]
   Section displays: Flavor input + Size input
   User clicks: "Cinnamon" (Flavor)
   
   Result: selectedOptions = ["Cinnamon", "Single"]
           Position 0: From Flavor input = "Cinnamon"
           Position 1: From Size input = "Single"
   
   
   Scenario 2: Section shows ONLY Flavor
   ----------------------------------------
   Product options: [Flavor, Size]
   Section displays: Flavor input only
   User clicks: "Cinnamon" (Flavor)
   Current variant: "Clean Mint / Single"
   
   Result: selectedOptions = ["Cinnamon", "Single"]
           Position 0: From Flavor input = "Cinnamon"
           Position 1: From current variant = "Single" (no input)
   
   This finds: "Cinnamon / Single" variant ✓
   
   
   Scenario 3: Section shows ONLY Size
   ----------------------------------------
   Product options: [Flavor, Size]
   Section displays: Size input only
   User clicks: "Two-Pack" (Size)
   Current variant: "Cinnamon / Single"
   
   Result: selectedOptions = ["Cinnamon", "Two-Pack"]
           Position 0: From current variant = "Cinnamon" (no input)
           Position 1: From Size input = "Two-Pack"
   
   This finds: "Cinnamon / Two-Pack" variant ✓
   
   ===================================================== */

  /* =====================================================
   EXPECTED CONSOLE OUTPUT (After Fix)
   ===================================================== 
   
   === Option Button Clicked ===
   Option Index: 0
   Value: Cinnamon
   Updating option 0: "Clean Mint" → "Cinnamon"
   Product has 2 total options
   Section displays 1 option inputs
   Position 0: Using input value "Cinnamon"
   Position 1: Using current variant value "Single" (no input)
   Complete options array: ["Cinnamon", "Single"]
   ✓ Match found: Variant 41905341366352 - Cinnamon / Single
   === Variant Found ===
   ID: 41905341366352
   Title: Cinnamon / Single
   Options: ["Cinnamon", "Single"]
   
   ===================================================== */

  /* -----------------------------------------------------
     SUBSCRIPTION CHECKBOX HANDLER
     ----------------------------------------------------- */
  if (autoRefillCheckbox) {
    autoRefillCheckbox.checked = true;

    const checkboxIcon = section.querySelector(".cwc-checkbox-icon");
    if (checkboxIcon) {
      checkboxIcon.classList.add("initially-checked");
    }

    autoRefillCheckbox.addEventListener("change", function () {
      console.log("Subscription toggled:", this.checked);
      const currentVariantId = variantIdInput.value;
      const currentVariant = findVariantById(currentVariantId);
      if (currentVariant) {
        updateVariant(currentVariant);
      }
    });
  }

  /* =====================================================
     FAQ FUNCTIONALITY
     ===================================================== */
  function initFAQBlocks() {
    const faqItems = section.querySelectorAll(".cwc-featured-product__faq");
    console.log(`Found ${faqItems.length} FAQ items`);

    faqItems.forEach((item, index) => {
      const question = item.querySelector(
        ".cwc-featured-product__faq-question"
      );
      const answer = item.querySelector(".cwc-featured-product__faq-answer");
      const icon = item.querySelector(".cwc-featured-product__faq-icon");

      if (!question || !answer) return;

      question.addEventListener("click", () => {
        const isCurrentlyActive = item.classList.contains("active");

        faqItems.forEach((other) => {
          if (other !== item && other.classList.contains("active")) {
            const otherAnswer = other.querySelector(
              ".cwc-featured-product__faq-answer"
            );
            const otherIcon = other.querySelector(
              ".cwc-featured-product__faq-icon"
            );

            otherAnswer.style.maxHeight = otherAnswer.scrollHeight + "px";
            setTimeout(() => {
              otherAnswer.style.maxHeight = "0";
              other.classList.remove("active");
              if (otherIcon) otherIcon.textContent = "+";
            }, 10);
          }
        });

        setTimeout(() => {
          if (isCurrentlyActive) {
            answer.style.maxHeight = answer.scrollHeight + "px";
            setTimeout(() => {
              answer.style.maxHeight = "0";
              item.classList.remove("active");
              if (icon) icon.textContent = "+";
            }, 10);
          } else {
            item.classList.add("active");
            if (icon) icon.textContent = "−";
            answer.style.maxHeight = answer.scrollHeight + "px";

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
  initFAQBlocks();

  // Initialize with current selection
  const initialVariantId = variantIdInput.value;
  const initialVariant = findVariantById(initialVariantId);
  if (initialVariant) {
    console.log("Initial variant:", initialVariant.id);
    updateVariant(initialVariant);
  }

  console.log("=== Initialization Complete ===\n");
}
