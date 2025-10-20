window.tailwind = window.tailwind || {};
window.tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#ea2a33",
        "background-light": "#f8f6f6",
        "background-dark": "#211111",
      },
      fontFamily: {
        display: ["Work Sans"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
    },
  },
};

(function initDynamicHeaderOffset() {
  function updateHeaderOffset() {
    const header = document.querySelector("header");
    const headerHeight = header ? header.getBoundingClientRect().height : 80;
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    const extraSpace = isDesktop ? 32 : 24;
    const offset = Math.round(headerHeight + extraSpace);
    document.documentElement.style.setProperty("--header-offset", `${offset}px`);
  }

  function setupObserver() {
    const header = document.querySelector("header");
    if ("ResizeObserver" in window && header) {
      const resizeObserver = new ResizeObserver(updateHeaderOffset);
      resizeObserver.observe(header);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    updateHeaderOffset();
    setupObserver();
    window.addEventListener("resize", updateHeaderOffset);
    window.addEventListener("orientationchange", updateHeaderOffset);
  });
})();

document.addEventListener("DOMContentLoaded", () => {
  const lightOptionColor = "#fcd34d";
  const darkOptionColor = "#fde68a";
  const placeholderLight = "#9ca3af";
  const placeholderDark = "#6b7280";

  const enhancedSelects = document.querySelectorAll("[data-enhanced-select]");

  const closeAllSelects = (except = null) => {
    enhancedSelects.forEach((container) => {
      if (container === except) return;
      const trigger = container.querySelector("[data-select-trigger]");
      const list = container.querySelector("[data-select-options]");
      if (!trigger || !list) return;
      trigger.setAttribute("aria-expanded", "false");
      list.classList.add("hidden");
      const icon = trigger.querySelector("svg");
      if (icon) {
        icon.classList.remove("rotate-180");
      }
    });
  };

  enhancedSelects.forEach((container) => {
    const select = container.querySelector("select");
    if (!select || container.dataset.enhanced === "true") return;
    container.dataset.enhanced = "true";

    const isDarkMode = () => document.documentElement.classList.contains("dark");

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className =
      "flex w-full h-11 items-center justify-between rounded-lg bg-gray-100 dark:bg-gray-800 border border-transparent px-4 text-left focus:outline-none focus:ring-2 focus:ring-primary";
    trigger.setAttribute("data-select-trigger", "");
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");

    const valueSpan = document.createElement("span");
    valueSpan.setAttribute("data-select-value", "");
    valueSpan.className = "block truncate text-gray-400 dark:text-gray-500";
    trigger.appendChild(valueSpan);

    const caret = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    caret.setAttribute("viewBox", "0 0 24 24");
    caret.setAttribute("fill", "none");
    caret.setAttribute("stroke", "currentColor");
    caret.setAttribute("stroke-width", "2");
    caret.classList.add(
      "ml-2",
      "h-5",
      "w-5",
      "flex-shrink-0",
      "text-[#fcd34d]",
      "dark:text-[#fde68a]",
      "transition-transform",
      "duration-200"
    );
    const caretPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    caretPath.setAttribute("stroke-linecap", "round");
    caretPath.setAttribute("stroke-linejoin", "round");
    caretPath.setAttribute("d", "M6 9l6 6 6-6");
    caret.appendChild(caretPath);
    trigger.appendChild(caret);

    const list = document.createElement("ul");
    list.className =
      "absolute left-0 right-0 top-full z-20 mt-2 max-h-56 overflow-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 shadow-2xl hidden";
    list.setAttribute("data-select-options", "");
    list.setAttribute("role", "listbox");

    const options = Array.from(select.options);
    options.forEach((option) => {
      if (option.disabled && option.hidden) return;
      const item = document.createElement("li");
      item.setAttribute("role", "option");
      item.setAttribute("data-option-value", option.value);
      item.className =
        "px-4 py-2 cursor-pointer text-[#fcd34d] dark:text-[#fde68a] hover:bg-primary/10 focus:bg-primary/10 focus:outline-none transition-colors duration-150";
      item.textContent = option.textContent;

      item.addEventListener("click", () => {
        select.value = option.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        updateDisplay();
        closeAllSelects();
      });

      item.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          item.click();
        }
      });

      list.appendChild(item);
    });

    container.appendChild(trigger);
    container.appendChild(list);

    const updateDisplay = () => {
      const currentOption = select.options[select.selectedIndex];
      const isPlaceholder =
        !currentOption || currentOption.disabled || currentOption.value === "";
      const optionColor = isDarkMode() ? darkOptionColor : lightOptionColor;
      const placeholderColor = isDarkMode() ? placeholderDark : placeholderLight;

      valueSpan.textContent = currentOption ? currentOption.textContent : "";
      valueSpan.className = isPlaceholder
        ? "block truncate text-gray-400 dark:text-gray-500"
        : "block truncate font-medium text-[#fcd34d] dark:text-[#fde68a]";

      Array.from(list.children).forEach((item) => {
        if (item.getAttribute("data-option-value") === select.value) {
          item.classList.add("bg-primary/10");
        } else {
          item.classList.remove("bg-primary/10");
        }
      });

      select.style.color = isPlaceholder ? placeholderColor : optionColor;
    };

    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      const isOpen = trigger.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        trigger.setAttribute("aria-expanded", "false");
        list.classList.add("hidden");
        caret.classList.remove("rotate-180");
      } else {
        closeAllSelects(container);
        trigger.setAttribute("aria-expanded", "true");
        list.classList.remove("hidden");
        caret.classList.add("rotate-180");
      }
    });

    select.addEventListener("change", updateDisplay);

    updateDisplay();
    select.classList.add("hidden");

    const themeObserver = new MutationObserver(updateDisplay);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
  });

  document.addEventListener("click", (event) => {
    const targetContainer = event.target.closest("[data-enhanced-select]");
    closeAllSelects(targetContainer || null);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllSelects();
    }
  });
});

(function initEmailJS() {
  if (typeof emailjs === "undefined" || typeof emailjs.init !== "function") {
    console.warn("EmailJS SDK is not available.");
    return;
  }

  try {
    emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
  } catch (error) {
    console.error("Failed to initialize EmailJS", error);
  }
})();

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("applicationForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const successModal = document.getElementById("successModal");
    const errorModal = document.getElementById("errorModal");
    const submitButton = form.querySelector('button[type="submit"]');
    if (!submitButton) return;

    successModal?.classList.add("hidden");
    errorModal?.classList.add("hidden");

    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="truncate">Відправляється...</span>';

    const formDataRaw = new FormData(form);
    const templateParams = {
      user_name: formDataRaw.get("user_name"),
      user_phone: formDataRaw.get("user_phone"),
      user_age: formDataRaw.get("user_age"),
      user_status: formDataRaw.get("user_status"),
      user_rank: formDataRaw.get("user_rank"),
      user_comment: formDataRaw.get("user_comment"),
    };

    console.log("Відправляємо дані:", templateParams);

    emailjs
      .send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams
      )
      .then((response) => {
        console.log("SUCCESS!", response.status, response.text);
        window.showSuccessModal();
        form.reset();
      })
      .catch((error) => {
        console.error("FAILED...", error);
        window.showErrorModal();
      })
      .finally(() => {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
      });
  });
});

window.showSuccessModal = function showSuccessModal() {
  const modal = document.getElementById("successModal");
  const content = document.getElementById("successModalContent");
  if (!modal || !content) return;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  setTimeout(() => {
    content.classList.remove("scale-95");
    content.classList.add("scale-100");
  }, 10);
};

window.closeSuccessModal = function closeSuccessModal() {
  const modal = document.getElementById("successModal");
  const content = document.getElementById("successModalContent");
  if (!modal || !content) return;
  content.classList.remove("scale-100");
  content.classList.add("scale-95");
  setTimeout(() => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }, 200);
};

window.showErrorModal = function showErrorModal() {
  const modal = document.getElementById("errorModal");
  const content = document.getElementById("errorModalContent");
  if (!modal || !content) return;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  setTimeout(() => {
    content.classList.remove("scale-95");
    content.classList.add("scale-100");
  }, 10);
};

window.closeErrorModal = function closeErrorModal() {
  const modal = document.getElementById("errorModal");
  const content = document.getElementById("errorModalContent");
  if (!modal || !content) return;
  content.classList.remove("scale-100");
  content.classList.add("scale-95");
  setTimeout(() => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }, 200);
};

document.addEventListener("DOMContentLoaded", () => {
  const successModal = document.getElementById("successModal");
  const errorModal = document.getElementById("errorModal");

  successModal?.addEventListener("click", (event) => {
    if (event.target === successModal) {
      window.closeSuccessModal();
    }
  });

  errorModal?.addEventListener("click", (event) => {
    if (event.target === errorModal) {
      window.closeErrorModal();
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    window.closeSuccessModal();
    window.closeErrorModal();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const mobileMenuButton = document.getElementById("mobile-menu-button");
  const mobileMenu = document.getElementById("mobile-menu");

  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });

    document.addEventListener("click", (event) => {
      const isMenuClick = mobileMenu.contains(event.target);
      const isButtonClick = mobileMenuButton.contains(event.target);
      if (!isMenuClick && !isButtonClick) {
        mobileMenu.classList.add("hidden");
      }
    });
  }

  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const targetId = link.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetId === "contacts") {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      } else if (targetElement) {
        const header = document.querySelector("header");
        const headerHeight = header ? header.getBoundingClientRect().height : 80;
        const cssOffset = getComputedStyle(document.documentElement).getPropertyValue(
          "--header-offset"
        );
        const parsedOffset = parseFloat(cssOffset) || headerHeight + 32;
        const offset = parsedOffset;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }

      if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
        mobileMenu.classList.add("hidden");
      }
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("image-modal");
  const modalImage = document.getElementById("modal-image");
  const closeModal = document.getElementById("close-modal");
  const prevButton = document.getElementById("prev-image");
  const nextButton = document.getElementById("next-image");
  const gallerySection = document.getElementById("gallery");

  if (!modal || !modalImage || !closeModal || !prevButton || !nextButton || !gallerySection) {
    return;
  }

  const photoElements = gallerySection.querySelectorAll(".group .bg-cover");
  const imageUrls = [];
  let currentImageIndex = 0;

  const extractImageUrl = (backgroundImage) => {
    const match = backgroundImage.match(/url\((['"]?)(.*?)\1\)/);
    return match ? match[2] : "";
  };

  photoElements.forEach((photoElement) => {
    photoElement.style.cursor = "pointer";
    const backgroundImage = getComputedStyle(photoElement).backgroundImage || "";
    const imageUrl = extractImageUrl(backgroundImage);
    if (imageUrl) {
      imageUrls.push(imageUrl);
    }
  });

  const showImage = (index) => {
    if (index < 0 || index >= imageUrls.length) return;
    currentImageIndex = index;
    modalImage.src = imageUrls[currentImageIndex];
    prevButton.style.display = currentImageIndex > 0 ? "flex" : "none";
    nextButton.style.display =
      currentImageIndex < imageUrls.length - 1 ? "flex" : "none";
  };

  photoElements.forEach((photoElement, index) => {
    photoElement.addEventListener("click", () => {
      if (!imageUrls.length) return;
      modal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
      showImage(index);
    });
  });

  prevButton.addEventListener("click", () => {
    if (currentImageIndex > 0) {
      showImage(currentImageIndex - 1);
    }
  });

  nextButton.addEventListener("click", () => {
    if (currentImageIndex < imageUrls.length - 1) {
      showImage(currentImageIndex + 1);
    }
  });

  const closeGalleryModal = () => {
    modal.classList.add("hidden");
    document.body.style.overflow = "auto";
  };

  closeModal.addEventListener("click", closeGalleryModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeGalleryModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (modal.classList.contains("hidden")) return;
    if (event.key === "Escape") {
      closeGalleryModal();
    } else if (event.key === "ArrowLeft" && currentImageIndex > 0) {
      showImage(currentImageIndex - 1);
    } else if (event.key === "ArrowRight" && currentImageIndex < imageUrls.length - 1) {
      showImage(currentImageIndex + 1);
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const videoCarousel = document.getElementById("video-carousel");
  const prevVideoBtn = document.getElementById("prev-video");
  const nextVideoBtn = document.getElementById("next-video");

  if (videoCarousel && prevVideoBtn && nextVideoBtn) {
    let currentVideoSlide = 0;
    const visibleItems = 3;
    const totalItems = videoCarousel.children.length;
    const maxSlide = Math.max(0, Math.ceil(totalItems / visibleItems) - 1);

    const updateCarousel = () => {
      const offset = currentVideoSlide * (100 / visibleItems);
      videoCarousel.style.transform = `translateX(-${offset}%)`;
    };

    prevVideoBtn.addEventListener("click", () => {
      if (currentVideoSlide > 0) {
        currentVideoSlide -= 1;
        updateCarousel();
      }
    });

    nextVideoBtn.addEventListener("click", () => {
      if (currentVideoSlide < maxSlide) {
        currentVideoSlide += 1;
        updateCarousel();
      }
    });
  }

  document.querySelectorAll(".faq-question").forEach((button) => {
    button.addEventListener("click", () => {
      const answer = button.nextElementSibling;
      const icon = button.querySelector(".faq-icon");
      const isOpen = answer && !answer.classList.contains("hidden");

      document.querySelectorAll(".faq-answer").forEach((item) => {
        if (item !== answer) {
          item.classList.add("hidden");
        }
      });

      document.querySelectorAll(".faq-icon").forEach((item) => {
        if (item !== icon) {
          item.classList.remove("rotate-180");
        }
      });

      if (answer && icon) {
        if (isOpen) {
          answer.classList.add("hidden");
          icon.classList.remove("rotate-180");
        } else {
          answer.classList.remove("hidden");
          icon.classList.add("rotate-180");
        }
      }
    });
  });
});
