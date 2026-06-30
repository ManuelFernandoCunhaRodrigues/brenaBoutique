import { buildWhatsAppUrl } from "./whatsapp.js";

const GAP = 18;
const DURATION = 420;
const AUTOPLAY_DELAY = 3500;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function cloneSlides(slides) {
  return slides.map((s) => {
    const c = s.cloneNode(true);
    c.setAttribute("aria-hidden", "true");
    c.setAttribute("inert", "");
    c.querySelectorAll("*").forEach((el) => {
      el.setAttribute("aria-hidden", "true");
    });
    c.querySelectorAll("a, button, input, select, textarea, [tabindex]").forEach((el) => {
      el.setAttribute("tabindex", "-1");
    });
    return c;
  });
}

export function initCarousel() {
  const carousel = document.querySelector("[data-carousel]");
  if (!carousel) return;

  const viewport = carousel.querySelector("[data-carousel-viewport]");
  const track = carousel.querySelector("[data-carousel-track]");
  const prevBtn = carousel.querySelector("[data-carousel-prev]");
  const nextBtn = carousel.querySelector("[data-carousel-next]");
  if (!viewport || !track) return;

  const origSlides = Array.from(track.querySelectorAll(".product-card"));
  const count = origSlides.length;
  if (count < 2) return;

  const clonesBefore = cloneSlides(origSlides);
  const clonesAfter = cloneSlides(origSlides);
  [...clonesBefore].reverse().forEach((c) => track.prepend(c));
  clonesAfter.forEach((c) => track.append(c));

  track.querySelectorAll("[data-whatsapp][data-product]").forEach((link) => {
    const product = link.getAttribute("data-product");
    const msg = `Olá! Vim pelo site e me interessei pelo ${product}. Tem disponível no meu tamanho?`;
    link.setAttribute("href", buildWhatsAppUrl(msg));
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
  });

  // ── Dots ──────────────────────────────────
  const dotsContainer = document.createElement("div");
  dotsContainer.className = "carousel-dots";
  dotsContainer.setAttribute("aria-label", "Navegação do carousel");

  const dots = Array.from({ length: count }, (_, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "carousel-dot";
    btn.setAttribute("aria-label", `Produto ${i + 1} de ${count}`);
    btn.setAttribute("aria-current", i === 0 ? "true" : "false");
    dotsContainer.appendChild(btn);
    return btn;
  });

  const carouselNav = carousel.querySelector(".carousel-nav");
  if (carouselNav && nextBtn) {
    carouselNav.insertBefore(dotsContainer, nextBtn);
  } else {
    carousel.appendChild(dotsContainer);
  }

  function updateDots(active) {
    dots.forEach((d, i) => {
      const isCurrent = i === active;
      d.classList.toggle("is-active", isCurrent);
      d.setAttribute("aria-current", String(isCurrent));
    });
  }

  updateDots(0);
  // ── End Dots ───────────────────────────────

  let currentReal = 0;
  let isTransitioning = false;
  let pendingReal = null;
  let autoplayId = null;

  function visibleCount() {
    if (window.innerWidth >= 980) return 3;
    if (window.innerWidth >= 560) return 2;
    return 1;
  }

  function slideStep() {
    return (viewport.offsetWidth + GAP) / visibleCount();
  }

  function applyTransform(domIdx, animate) {
    track.style.transition = animate
      ? `transform ${DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`
      : "none";
    track.style.transform = `translateX(-${domIdx * slideStep()}px)`;
  }

  function currentDomIdx() {
    return count + currentReal;
  }

  applyTransform(currentDomIdx(), false);

  track.addEventListener("transitionend", () => {
    if (pendingReal !== null) {
      currentReal = pendingReal;
      pendingReal = null;
    }
    applyTransform(currentDomIdx(), false);
    isTransitioning = false;
    updateDots(currentReal);
  });

  function next() {
    if (isTransitioning) return;
    isTransitioning = true;
    pendingReal = (currentReal + 1) % count;
    updateDots(pendingReal);
    applyTransform(currentDomIdx() + 1, true);
  }

  function prev() {
    if (isTransitioning) return;
    isTransitioning = true;
    pendingReal = (currentReal - 1 + count) % count;
    updateDots(pendingReal);
    applyTransform(currentDomIdx() - 1, true);
  }

  function goTo(targetReal) {
    if (isTransitioning || targetReal === currentReal) return;
    isTransitioning = true;
    pendingReal = targetReal;
    updateDots(targetReal);
    // Use direction-aware navigation for natural animation
    const forward = (targetReal - currentReal + count) % count;
    const backward = (currentReal - targetReal + count) % count;
    if (forward <= backward) {
      applyTransform(currentDomIdx() + forward, true);
    } else {
      applyTransform(currentDomIdx() - backward, true);
    }
  }

  dots.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      stopAutoplay();
      goTo(i);
      startAutoplay();
    });
  });

  function startAutoplay() {
    if (prefersReducedMotion) return;
    clearInterval(autoplayId);
    autoplayId = setInterval(next, AUTOPLAY_DELAY);
  }

  function stopAutoplay() {
    clearInterval(autoplayId);
    autoplayId = null;
  }

  startAutoplay();
  carousel.addEventListener("mouseenter", stopAutoplay);
  carousel.addEventListener("mouseleave", startAutoplay);
  prevBtn?.addEventListener("click", () => { stopAutoplay(); prev(); startAutoplay(); });
  nextBtn?.addEventListener("click", () => { stopAutoplay(); next(); startAutoplay(); });

  let touchStartX = 0;
  let touchDeltaX = 0;
  track.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    stopAutoplay();
  }, { passive: true });
  track.addEventListener("touchmove", (e) => {
    touchDeltaX = e.touches[0].clientX - touchStartX;
  }, { passive: true });
  track.addEventListener("touchend", () => {
    if (Math.abs(touchDeltaX) > 50) touchDeltaX < 0 ? next() : prev();
    touchDeltaX = 0;
    startAutoplay();
  });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => applyTransform(currentDomIdx(), false), 100);
  });
}
