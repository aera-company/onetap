export function buildWhatsappUrl(number: string, message: string) {
  const normalizedNumber = number.replace(/\D/g, "");

  if (!normalizedNumber) return null;

  return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`;
}
