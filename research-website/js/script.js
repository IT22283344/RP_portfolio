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
  bindMilestoneFilter();
  bindContactForm();

  function initTheme() {
    const savedTheme = localStorage.getItem("sf-theme");
    const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    const initialTheme = savedTheme || preferredTheme;

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

  function bindContactForm() {
    const contactForm = document.getElementById("contactForm");
    if (!contactForm) return;

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const messageInput = document.getElementById("message");
    const formMessage = document.getElementById("formMessage");

    contactForm.addEventListener("submit", (event) => {
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

      if (isValid) {
        formMessage.textContent =
          "Thank you. Your message has been validated successfully.";
        contactForm.reset();
      }
    });
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
