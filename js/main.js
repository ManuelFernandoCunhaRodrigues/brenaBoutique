import { initWhatsAppLinks } from "./whatsapp.js";
import { initHeader } from "./header.js";
import { initFaq } from "./faq.js";
import { initReveal } from "./reveal.js";
import { initCarousel } from "./carousel.js";

function initCurrentYear() {
  const el = document.querySelector("[data-current-year]");
  if (el) el.textContent = String(new Date().getFullYear());
}

initWhatsAppLinks();
initHeader();
initFaq();
initReveal();
initCarousel();
initCurrentYear();
