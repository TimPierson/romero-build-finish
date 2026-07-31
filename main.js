(() => {
  /* Set Jorge’s real inbox when ready */
  const CONSULT_EMAIL = "";

  const nav = document.querySelector("[data-nav]");
  const year = document.querySelector("[data-year]");
  const form = document.getElementById("consult-form");
  const statusEl = document.querySelector("[data-status]");
  const submitBtn = document.querySelector("[data-submit]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const menuPanel = document.querySelector("[data-menu-panel]");

  if (year) year.textContent = String(new Date().getFullYear());

  /* Sticky nav */
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle("is-scrolled", window.scrollY > 6);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Mobile menu */
  if (menuToggle && menuPanel && nav) {
    const closeMenu = () => {
      nav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open menu");
      menuPanel.setAttribute("hidden", "");
    };
    const openMenu = () => {
      nav.classList.add("is-open");
      menuToggle.setAttribute("aria-expanded", "true");
      menuToggle.setAttribute("aria-label", "Close menu");
      menuPanel.removeAttribute("hidden");
    };

    menuToggle.addEventListener("click", () => {
      if (nav.classList.contains("is-open")) closeMenu();
      else openMenu();
    });

    menuPanel.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 640) closeMenu();
    });
  }

  /* Reveal */
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const items = document.querySelectorAll(".reveal");
  const showAll = () => items.forEach((el) => el.classList.add("is-in"));

  if (reduce || !("IntersectionObserver" in window)) {
    showAll();
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -4% 0px", threshold: 0.06 }
    );
    items.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i % 5, 4) * 50}ms`;
      io.observe(el);
    });
    window.setTimeout(showAll, 1000);
  }

  /* Consult form → mailto */
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const phone = String(data.get("phone") || "").trim();
      const type = String(data.get("type") || "").trim();
      const location = String(data.get("location") || "").trim();
      const message = String(data.get("message") || "").trim();

      form.querySelectorAll(".field--error").forEach((el) => {
        el.classList.remove("field--error");
      });

      let ok = true;
      const mark = (id) => {
        form.querySelector(`#${id}`)?.closest(".field")?.classList.add("field--error");
        ok = false;
      };

      if (!name) mark("name");
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) mark("email");
      if (!message) mark("message");

      if (!ok) {
        if (statusEl) statusEl.textContent = "Please complete the required fields.";
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Opening…";
      }

      const typeLabel = {
        remodel: "Home remodel / interiors",
        kitchen: "Kitchen",
        flooring: "Flooring / tile / epoxy",
        deck: "Deck / outdoor structure",
        sauna: "Sauna / spa / outdoor shower",
        fab: "Steel / custom fabrication",
        site: "Site work / equipment",
        other: "Other / not sure yet",
      }[type] || type;

      const subject = encodeURIComponent(`Consult request — ${typeLabel} — ${name}`);
      const body = encodeURIComponent(
        [
          `Name: ${name}`,
          `Email: ${email}`,
          phone ? `Phone: ${phone}` : null,
          location ? `Location: ${location}` : null,
          `Project type: ${typeLabel}`,
          "",
          "Details:",
          message,
        ]
          .filter(Boolean)
          .join("\n")
      );

      const to = CONSULT_EMAIL ? encodeURIComponent(CONSULT_EMAIL) : "";
      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;

      if (statusEl) {
        statusEl.textContent = "Your email app should open with the request drafted.";
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Request sent";
        window.setTimeout(() => {
          submitBtn.textContent = "Send request";
        }, 2800);
      }
    });
  }
})();
