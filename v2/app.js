(() => {
  const root = document.documentElement;
  const body = document.body;
  const header = document.querySelector(".site-header");
  const progress = document.getElementById("scrollProgress");
  const menuButton = document.getElementById("menuButton");
  const mobileNav = document.getElementById("mobileNav");
  const cursor = document.querySelector(".cursor-orb");
  const langButtons = document.querySelectorAll("[data-lang-button]");
  const translated = document.querySelectorAll("[data-es][data-en]");
  const navLinks = document.querySelectorAll('.desktop-nav a[href^="#"], .mobile-nav a[href^="#"]');

  const preferredLanguage = () => {
    try {
      const saved = localStorage.getItem("portfolio-language");
      if (saved === "es" || saved === "en") return saved;
    } catch (_) {}
    return navigator.language && navigator.language.toLowerCase().startsWith("en") ? "en" : "es";
  };

  const setLanguage = (language) => {
    const lang = language === "en" ? "en" : "es";
    root.lang = lang;

    translated.forEach((node) => {
      const value = node.getAttribute("data-" + lang);
      if (value !== null) node.textContent = value;
    });

    langButtons.forEach((button) => {
      const active = button.getAttribute("data-lang-button") === lang;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    try {
      localStorage.setItem("portfolio-language", lang);
    } catch (_) {}
  };

  langButtons.forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.getAttribute("data-lang-button")));
  });

  setLanguage(preferredLanguage());

  const closeMenu = () => {
    if (!menuButton || !mobileNav) return;
    menuButton.setAttribute("aria-expanded", "false");
    mobileNav.classList.remove("is-open");
    body.classList.remove("menu-open");
  };

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", () => {
      const open = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!open));
      mobileNav.classList.toggle("is-open", !open);
      body.classList.toggle("menu-open", !open);
    });

    mobileNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }

  const updateScroll = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const pct = Math.min(100, Math.max(0, (scrollTop / max) * 100));
    if (progress) progress.style.width = pct + "%";
    if (header) header.classList.toggle("is-scrolled", scrollTop > 12);
  };

  let scrollTicking = false;
  window.addEventListener("scroll", () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      updateScroll();
      scrollTicking = false;
    });
  }, { passive: true });
  updateScroll();

  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealItems = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, {
      rootMargin: "0px 0px -8% 0px",
      threshold: 0.08
    });

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const sectionIds = ["work", "capabilities", "experience", "about", "contact"];
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const navObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (!visible.length) return;
      const activeId = visible[0].target.id;

      navLinks.forEach((link) => {
        const active = link.getAttribute("href") === "#" + activeId;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      });
    }, {
      rootMargin: "-35% 0px -50% 0px",
      threshold: [0, 0.1, 0.3, 0.6]
    });

    sections.forEach((section) => navObserver.observe(section));
  }

  if (cursor && window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduceMotion) {
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    window.addEventListener("pointermove", (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
    }, { passive: true });

    const animateCursor = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      cursor.style.transform = "translate3d(" + currentX + "px," + currentY + "px,0)";
      requestAnimationFrame(animateCursor);
    };
    animateCursor();
  }

  const heroVisual = document.querySelector(".portrait-frame");
  if (heroVisual && !reduceMotion && window.matchMedia("(min-width: 861px)").matches) {
    let parallaxTicking = false;
    const updateParallax = () => {
      const amount = Math.min(22, window.scrollY * 0.035);
      heroVisual.style.transform = "translate3d(0," + amount + "px,0)";
      parallaxTicking = false;
    };

    window.addEventListener("scroll", () => {
      if (parallaxTicking) return;
      parallaxTicking = true;
      requestAnimationFrame(updateParallax);
    }, { passive: true });
  }
})();