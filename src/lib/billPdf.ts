/** Browser-only helpers to turn a bill's HTML into a PDF and save it. */

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

export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Fetch a booking's bill page and download it as a PDF. */
export async function downloadBill(customerId: string, guestName?: string) {
  const res = await fetch(`/bill/${customerId}?embed=1`, { cache: "no-store" });
  if (!res.ok) throw new Error("Could not load the bill");
  const html = await res.text();
  const safe = (guestName || "guest").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "guest";
  const filename = `Bill-${safe}-${customerId.slice(-6).toUpperCase()}.pdf`;
  saveBlob(await htmlToPdfBlob(html, filename), filename);
}
