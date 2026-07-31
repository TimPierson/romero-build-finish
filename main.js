(() => {
  /* Set Jorge’s real inbox when ready — leave blank to draft without a To: address */
  const CONSULT_EMAIL = "";

  const nav = document.querySelector("[data-nav]");
  const year = document.querySelector("[data-year]");
  const form = document.getElementById("consult-form");
  const statusEl = document.querySelector("[data-status]");
  const submitBtn = document.querySelector("[data-submit]");

  if (year) year.textContent = String(new Date().getFullYear());

  /* Sticky nav hairline on scroll */
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Reveal on enter — always show content as fallback */
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
      { rootMargin: "0px 0px -4% 0px", threshold: 0.05 }
    );
    items.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i % 4, 3) * 60}ms`;
      io.observe(el);
    });
    /* Safety: never leave content hidden */
    window.setTimeout(showAll, 1200);
  }

  /* Contact form → mailto (no backend) */
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const phone = String(data.get("phone") || "").trim();
      const type = String(data.get("type") || "").trim();
      const message = String(data.get("message") || "").trim();

      form.querySelectorAll(".field--error").forEach((el) => el.classList.remove("field--error"));

      let ok = true;
      if (!name) {
        form.querySelector("#name")?.closest(".field")?.classList.add("field--error");
        ok = false;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        form.querySelector("#email")?.closest(".field")?.classList.add("field--error");
        ok = false;
      }
      if (!message) {
        form.querySelector("#message")?.closest(".field")?.classList.add("field--error");
        ok = false;
      }

      if (!ok) {
        if (statusEl) statusEl.textContent = "Please complete the required fields.";
        if (submitBtn) submitBtn.dataset.state = "error";
        return;
      }

      if (submitBtn) {
        submitBtn.dataset.state = "loading";
        submitBtn.textContent = "Opening…";
      }

      const subject = encodeURIComponent(`Consult request — ${type} — ${name}`);
      const body = encodeURIComponent(
        [
          `Name: ${name}`,
          `Email: ${email}`,
          phone ? `Phone: ${phone}` : null,
          `Project type: ${type}`,
          "",
          "Notes:",
          message,
        ]
          .filter(Boolean)
          .join("\n")
      );

      const to = CONSULT_EMAIL ? encodeURIComponent(CONSULT_EMAIL) : "";
      const mailto = `mailto:${to}?subject=${subject}&body=${body}`;

      window.location.href = mailto;

      if (statusEl) {
        statusEl.textContent = "Your email app should open with the request drafted.";
      }
      if (submitBtn) {
        submitBtn.dataset.state = "success";
        submitBtn.textContent = "Request drafted";
        window.setTimeout(() => {
          submitBtn.dataset.state = "";
          submitBtn.textContent = "Send request";
        }, 3200);
      }
    });
  }
})();
