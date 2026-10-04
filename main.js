/* ==========================================================================
   Charles Sports Club — shared behaviour
   Nav drawer · active link · scroll reveal · header state · counters · form
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Mobile menu drawer ---------- */
  const toggle = document.getElementById("menu-toggle");
  const navList = document.getElementById("nav-list");
  const backdrop = document.getElementById("drawer-backdrop");

  function openDrawer() {
    if (!navList) return;
    navList.classList.add("is-open");
    if (backdrop) { backdrop.hidden = false; requestAnimationFrame(() => backdrop.classList.add("is-open")); }
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
    document.body.classList.add("no-scroll");
  }

  function closeDrawer() {
    if (!navList) return;
    navList.classList.remove("is-open");
    if (backdrop) {
      backdrop.classList.remove("is-open");
      setTimeout(() => { backdrop.hidden = true; }, 300);
    }
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    document.body.classList.remove("no-scroll");
  }

  if (toggle && navList) {
    toggle.addEventListener("click", () => {
      navList.classList.contains("is-open") ? closeDrawer() : openDrawer();
    });
    if (backdrop) backdrop.addEventListener("click", closeDrawer);
    navList.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeDrawer));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navList.classList.contains("is-open")) closeDrawer();
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 720 && navList.classList.contains("is-open")) closeDrawer();
    });
  }

  /* ---------- Mark active nav link ---------- */
  const path = window.location.pathname.split("/").pop() || "index.html";
  const current = path.replace(".html", "") || "index";
  document.querySelectorAll(".nav-link").forEach((link) => {
    if (link.dataset.page === current) link.classList.add("is-active");
  });

  /* ---------- Header scrolled state ---------- */
  const header = document.getElementById("site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Scroll reveal ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i % 6, 5) * 70}ms`;
      io.observe(el);
    });
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Animated stat counters ---------- */
  const counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && counters.length) {
    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10) || 0;
          const duration = 1400;
          const start = performance.now();
          const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(eased * target).toLocaleString();
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          countObserver.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => countObserver.observe(el));
  }

  /* ---------- Card spotlight follows cursor ---------- */
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      card.style.setProperty("--my", `${e.clientY - rect.top}px`);
    });
  });

  /* ---------- Contact form validation ---------- */
  const form = document.getElementById("contact-form");
  if (form) {
    const status = document.getElementById("form-status");

    const rules = {
      name: (v) => (v.trim().length >= 2 ? "" : "Please enter your name."),
      email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Please enter a valid email address."),
      sport: (v) => (v ? "" : "Please choose a sport."),
      message: (v) => (v.trim().length >= 12 ? "" : "Tell us a little more (at least 12 characters)."),
    };

    function validateField(field) {
      const rule = rules[field.name];
      if (!rule) return true;
      const errorEl = form.querySelector(`[data-error-for="${field.name}"]`);
      const msg = rule(field.value);
      const wrap = field.closest(".field");
      if (msg) {
        wrap.classList.add("has-error");
        if (errorEl) errorEl.textContent = msg;
        return false;
      }
      wrap.classList.remove("has-error");
      if (errorEl) errorEl.textContent = "";
      return true;
    }

    Object.keys(rules).forEach((name) => {
      const field = form.elements[name];
      if (!field) return;
      field.addEventListener("blur", () => validateField(field));
      field.addEventListener("input", () => {
        if (field.closest(".field").classList.contains("has-error")) validateField(field);
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;
      Object.keys(rules).forEach((name) => {
        const field = form.elements[name];
        if (field && !validateField(field)) valid = false;
      });

      if (!valid) {
        status.textContent = "Please fix the highlighted fields and try again.";
        status.className = "form-status error";
        const firstError = form.querySelector(".has-error input, .has-error select, .has-error textarea");
        if (firstError) firstError.focus();
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      status.textContent = "Sending…";
      status.className = "form-status";

      // Demo only — no backend. Simulate a request.
      setTimeout(() => {
        status.textContent = "Thanks! Your message is on its way — we'll reply within two working days.";
        status.className = "form-status success";
        form.reset();
        btn.disabled = false;
      }, 900);
    });
  }
})();
