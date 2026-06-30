const PHONE = "5598988703170";
const DEFAULT_MSG = "Olá! Vim pelo site da Brenda Boutique e quero ver as novidades.";

export function buildWhatsAppUrl(message = DEFAULT_MSG) {
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
}

export function initWhatsAppLinks() {
  document.querySelectorAll("[data-whatsapp]").forEach((link) => {
    const product = link.getAttribute("data-product");
    const customMsg = link.getAttribute("data-message");
    const message = product
      ? `Olá! Vim pelo site e me interessei pelo ${product}. Tem disponível no meu tamanho?`
      : customMsg || DEFAULT_MSG;
    link.setAttribute("href", buildWhatsAppUrl(message));
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
  });
}
