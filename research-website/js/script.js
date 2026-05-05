// Shared interactions across the website: theme toggle, mobile navigation,
// scroll progress, reveal-on-scroll animations, and contact form validation.
document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const navLinks = document.getElementById("navLinks");
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const progressBar = document.querySelector(".scroll-progress__bar");

  initTheme();
  bindMenu();
  bindSmoothScroll();
  bindRevealAnimations();
  bindScrollProgress();
  bindHeroSlider();
  bindProposalSelector();
  bindMilestoneFilter();
  bindContactForm();

  function initTheme() {
    const savedTheme = localStorage.getItem("sf-theme");
    const initialTheme = savedTheme || "light";

    root.dataset.theme = initialTheme;
    updateThemeButton(initialTheme);

    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
        root.dataset.theme = nextTheme;
        localStorage.setItem("sf-theme", nextTheme);
        updateThemeButton(nextTheme);
      });
    }
  }

  function updateThemeButton(theme) {
    if (!themeToggle) return;
    const isDark = theme === "dark";
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.innerHTML = isDark
      ? '<span aria-hidden="true">☀</span><span class="theme-toggle-label">Light</span>'
      : '<span aria-hidden="true">☾</span><span class="theme-toggle-label">Dark</span>';
  }

  function bindMenu() {
    if (!menuToggle || !navLinks) return;

    menuToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function bindSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (event) => {
        const targetId = anchor.getAttribute("href");
        if (!targetId || targetId === "#") return;

        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;

        event.preventDefault();
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function bindRevealAnimations() {
    const revealTargets = document.querySelectorAll(
      ".fade-in, .slide-up, [data-animate]",
    );
    if (!revealTargets.length) return;

    if (!("IntersectionObserver" in window)) {
      revealTargets.forEach((element) => element.classList.add("in-view"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in-view");
          observerInstance.unobserve(entry.target);
        });
      },
      { threshold: 0.16 },
    );

    revealTargets.forEach((element) => observer.observe(element));
  }

  function bindScrollProgress() {
    if (!progressBar) return;

    const updateProgress = () => {
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
      progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
  }

  function bindHeroSlider() {
    const sliders = document.querySelectorAll("[data-hero-slider]");
    if (!sliders.length) return;

    sliders.forEach((slider) => {
      const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
      const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
      if (slides.length < 2) return;

      let activeIndex = 0;
      let sliderTimer;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const showSlide = (nextIndex) => {
        activeIndex = (nextIndex + slides.length) % slides.length;

        slides.forEach((slide, index) => {
          slide.classList.toggle("is-active", index === activeIndex);
        });

        dots.forEach((dot, index) => {
          const isActive = index === activeIndex;
          dot.classList.toggle("is-active", isActive);
          dot.setAttribute("aria-pressed", String(isActive));
        });
      };

      const startSlider = () => {
        if (reduceMotion) return;
        window.clearInterval(sliderTimer);
        sliderTimer = window.setInterval(() => {
          showSlide(activeIndex + 1);
        }, 4200);
      };

      dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
          showSlide(index);
          startSlider();
        });
      });

      slider.addEventListener("mouseenter", () => {
        window.clearInterval(sliderTimer);
      });
      slider.addEventListener("mouseleave", startSlider);
      slider.addEventListener("focusin", () => {
        window.clearInterval(sliderTimer);
      });
      slider.addEventListener("focusout", startSlider);

      showSlide(0);
      startSlider();
    });
  }

  function bindContactForm() {
    const contactForm = document.getElementById("contactForm");
    if (!contactForm) return;

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const subjectInput = document.getElementById("subject");
    const messageInput = document.getElementById("message");
    const formMessage = document.getElementById("formMessage");
    const submitButton = document.getElementById("contactSubmitBtn");
    const mailPopup = document.querySelector("[data-mail-popup]");
    const formSubject = contactForm.querySelector("[data-form-subject]");
    const submitButtonText = submitButton ? submitButton.textContent : "";

    const publicKey = (contactForm.dataset.emailjsPublicKey || "").trim();
    const serviceId = (contactForm.dataset.emailjsServiceId || "").trim();
    const templateId = (contactForm.dataset.emailjsTemplateId || "").trim();

    const hasEmailJsConfig =
      publicKey &&
      serviceId &&
      templateId &&
      !publicKey.startsWith("YOUR_") &&
      !serviceId.startsWith("YOUR_") &&
      !templateId.startsWith("YOUR_");

    if (window.emailjs && hasEmailJsConfig) {
      window.emailjs.init({ publicKey });
    }

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      clearErrors();
      formMessage.textContent = "";

      let isValid = true;

      if (!nameInput.value.trim()) {
        showError("nameError", "Please enter your name.");
        isValid = false;
      }

      const emailValue = emailInput.value.trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(emailValue)) {
        showError("emailError", "Please enter a valid email address.");
        isValid = false;
      }

      if (messageInput.value.trim().length < 12) {
        showError(
          "messageError",
          "Message should be at least 12 characters long.",
        );
        isValid = false;
      }

      if (!isValid) {
        return;
      }

      if (!window.emailjs || !hasEmailJsConfig) {
        const subject =
          subjectInput && subjectInput.value.trim()
            ? subjectInput.value.trim()
            : "Smart Fisher Lanka contact message";

        if (formSubject) {
          formSubject.value = subject;
        }

        showMailPopup(
          "Message submitted",
          "Please check your email if FormSubmit asks for activation.",
        );
        formMessage.textContent =
          "Message submitted. If this is the first message, confirm FormSubmit from the project email inbox.";
        formMessage.style.color = "#0e8f6d";
        contactForm.submit();
        window.setTimeout(() => contactForm.reset(), 700);
        return;
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
      }

      try {
        await window.emailjs.send(serviceId, templateId, {
          from_name: nameInput.value.trim(),
          from_email: emailInput.value.trim(),
          message: messageInput.value.trim(),
          to_email:
            contactForm.dataset.recipientEmail ||
            "Ravindujayaweera123@gmail.com",
          reply_to: emailInput.value.trim(),
        });

        formMessage.textContent =
          "Message sent successfully. We will get back to you soon.";
        formMessage.style.color = "#0e8f6d";
        showMailPopup("Message sent", "Thank you for contacting us.");
        contactForm.reset();
      } catch (error) {
        formMessage.textContent =
          "Failed to send message. Please try again in a moment.";
        formMessage.style.color = "#c0392b";
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = submitButtonText;
        }
      }
    });

    function showMailPopup(
      title = "Mail app opening",
      text = "Your message is ready to send.",
    ) {
      if (!mailPopup) return;

      const popupTitle = mailPopup.querySelector("strong");
      const popupText = mailPopup.querySelector("span");

      if (popupTitle) popupTitle.textContent = title;
      if (popupText) popupText.textContent = text;

      mailPopup.setAttribute("aria-hidden", "false");
      mailPopup.classList.add("is-visible");

      window.setTimeout(() => {
        mailPopup.classList.remove("is-visible");
        mailPopup.setAttribute("aria-hidden", "true");
      }, 3600);
    }
  }

  function bindMilestoneFilter() {
    const filter = document.getElementById("milestoneFilter");
    const cards = document.querySelectorAll("[data-milestone]");
    if (!filter || !cards.length) return;

    filter.addEventListener("change", () => {
      const selected = filter.value;

      cards.forEach((card) => {
        const cardType = card.getAttribute("data-milestone");
        const show = selected === "all" || selected === cardType;
        card.style.display = show ? "" : "none";
      });
    });
  }

  function bindProposalSelector() {
    const proposalSelect = document.getElementById("proposalMember");
    const proposalView = document.querySelector("[data-proposal-view]");
    const proposalDownload = document.querySelector("[data-proposal-download]");
    const proposalPicker = document.querySelector("[data-proposal-picker]");
    const proposalToggle = document.querySelector("[data-proposal-toggle]");

    if (
      !proposalSelect ||
      !proposalView ||
      !proposalDownload ||
      !proposalPicker ||
      !proposalToggle
    ) {
      return;
    }

    const updateLinks = () => {
      const selectedFile = proposalSelect.value;
      proposalView.href = selectedFile;
      proposalDownload.href = selectedFile;
    };

    const closePicker = () => {
      proposalPicker.classList.remove("is-open");
      proposalToggle.setAttribute("aria-expanded", "false");
    };

    const togglePicker = () => {
      const isOpen = proposalPicker.classList.toggle("is-open");
      proposalToggle.setAttribute("aria-expanded", String(isOpen));
    };

    proposalSelect.addEventListener("change", updateLinks);
    proposalToggle.addEventListener("click", togglePicker);
    document.addEventListener("click", (event) => {
      if (!proposalPicker.contains(event.target)) {
        closePicker();
      }
    });
    proposalPicker.addEventListener("mouseleave", () => {
      if (!proposalPicker.classList.contains("is-open")) {
        closePicker();
      }
    });
    updateLinks();
  }

  function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  function clearErrors() {
    ["nameError", "emailError", "messageError"].forEach((id) => {
      const errorElement = document.getElementById(id);
      if (errorElement) {
        errorElement.textContent = "";
      }
    });
  }
});
