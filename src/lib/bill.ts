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

/** Render invoice HTML to a PDF Blob in the browser (no server Chromium needed). */
export async function htmlToPdfBlob(html: string, filename: string): Promise<Blob> {
  const html2pdf = (await import("html2pdf.js")).default;
  const opt = {
    filename,
    margin: 8,
    image: { type: "jpeg" as const, quality: 0.95 },
    html2canvas: { useCORS: true, scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
  };
  return html2pdf().set(opt).from(html).outputPdf("blob");
}

/** Fetch a booking's bill page and turn it into a PDF File ready to share. */
export async function billPdfFile(url: string, name: string): Promise<File> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Couldn't load the bill");
  const html = await res.text();
  const safe = (name || "guest").replace(/[^\w-]+/g, "_");
  const filename = `${safe}-bill.pdf`;
  const blob = await htmlToPdfBlob(html, filename);
  return new File([blob], filename, { type: "application/pdf" });
}

/** Text that goes with the bill when it is sent as a PDF. */
export function billMessage(name: string): string {
  const title = process.env.NEXT_PUBLIC_TITLE || "Dormitary";
  return `Hello ${name || "Guest"}, thank you for staying with ${title}. Your bill is attached.`;
}
