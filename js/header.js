const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function initHeader() {
  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-nav]");

  function closeMenu() {
    if (!header || !menuToggle) return;
    header.classList.remove("menu-open");
    document.body.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menu");
  }

  if (header && menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = header.classList.toggle("menu-open");
      document.body.classList.toggle("menu-open", isOpen);
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

  function updateHeaderState() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  }

  updateHeaderState();
  window.addEventListener("scroll", updateHeaderState, { passive: true });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;
      const target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    });
  });
}
