/** Shared helpers for the self-hosted bill page and WhatsApp sharing. */

/** Absolute URL of a booking's public bill page (empty origin on the server). */
export function billUrl(customerId: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/bill/${customerId}`;
}

/** WhatsApp click-to-chat link that sends the guest their bill link. */
export function waBillLink(number: string, name: string, url: string): string {
  const digits = (number || "").replace(/\D/g, "");
  const intl = digits.length === 10 ? `91${digits}` : digits;
  const title = process.env.NEXT_PUBLIC_TITLE || "Dormitary";
  const msg = `Hello ${name || "Guest"}, thank you for staying with ${title}. Here is your bill: ${url}`;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg)}`;
}
