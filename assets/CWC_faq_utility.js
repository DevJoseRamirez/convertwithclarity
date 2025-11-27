document.addEventListener("DOMContentLoaded", function () {
  // Find all FAQ sections on the page and handle each independently
  const faqSections = document.querySelectorAll(".CWC_faq_utility");

  faqSections.forEach(function (section) {
    // Only get FAQ items within THIS specific section
    const faqItems = section.querySelectorAll(".CWC_faq_utility-item");

    faqItems.forEach(function (item) {
      const question = item.querySelector(".faq-question");
      const answer = item.querySelector(".faq-answer");
      const icon = item.querySelector(".faq-icon");

      if (question && answer) {
        question.addEventListener("click", function () {
          // Close all other FAQ items ONLY within this section
          faqItems.forEach(function (otherItem) {
            if (otherItem !== item && otherItem.classList.contains("open")) {
              const otherAnswer = otherItem.querySelector(".faq-answer");
              const otherQuestion = otherItem.querySelector(".faq-question");
              const otherIcon = otherItem.querySelector(".faq-icon");

              otherAnswer.style.maxHeight = otherAnswer.scrollHeight + "px";
              setTimeout(function () {
                otherAnswer.style.maxHeight = "0";
                otherItem.classList.remove("open");
                otherQuestion.setAttribute("aria-expanded", "false");
                if (otherIcon) otherIcon.textContent = "+";
              }, 10);
            }
          });

          // Toggle current item
          if (item.classList.contains("open")) {
            // Close current item
            answer.style.maxHeight = answer.scrollHeight + "px";
            setTimeout(function () {
              answer.style.maxHeight = "0";
              item.classList.remove("open");
              question.setAttribute("aria-expanded", "false");
              if (icon) icon.textContent = "+";
            }, 10);
          } else {
            // Open current item
            answer.style.maxHeight = answer.scrollHeight + "px";
            item.classList.add("open");
            question.setAttribute("aria-expanded", "true");
            if (icon) icon.textContent = "−";

            answer.addEventListener(
              "transitionend",
              function () {
                if (item.classList.contains("open")) {
                  answer.style.maxHeight = "none"; // Reset so it can grow naturally
                }
              },
              { once: true }
            );
          }
        });
      }
    });
  });
});
