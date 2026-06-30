export function initFaq() {
  document.querySelectorAll("[data-faq-button]").forEach((button) => {
    const item = button.closest(".faq-item");
    const panel = item?.querySelector(".faq-panel");
    if (!item || !panel) return;

    if (item.classList.contains("is-open")) {
      panel.style.maxHeight = `${panel.scrollHeight}px`;
    }

    button.addEventListener("click", () => {
      const isOpen = item.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(isOpen));
      panel.style.maxHeight = isOpen ? `${panel.scrollHeight}px` : "0px";
    });
  });
}
