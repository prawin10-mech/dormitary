/**
 * Client-side PDF → image helpers, used when a guest uploads an Aadhaar PDF
 * (e.g. the eAadhaar letter) instead of separate front/back photos.
 *
 * Everything runs in the browser with pdf.js; the file never leaves the device
 * until the resulting images are uploaded as part of the normal check-in flow.
 */

type RenderedPage = { file: File; width: number; height: number };

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function canvasToJpeg(canvas: HTMLCanvasElement, name: string): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("Failed to encode image"));
        resolve(new File([blob], name, { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.92
    );
  });
}

/** Render every page of a PDF file to a JPEG File. */
async function renderPdfPages(file: File): Promise<RenderedPage[]> {
  const pdfjs = await import("pdfjs-dist");
  // Load the worker from a CDN pinned to the exact installed version. This
  // avoids bundling the worker (which Next's webpack/Terser can't process).
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

  const data = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data }).promise;
  const pages: RenderedPage[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unsupported");
    await page.render({ canvasContext: ctx, viewport }).promise;
    pages.push({
      file: await canvasToJpeg(canvas, `aadhaar-page-${i}.jpg`),
      width: canvas.width,
      height: canvas.height,
    });
  }
  return pages;
}

/** Crop a File image to a fractional box and return a new JPEG File. */
async function cropImage(
  file: File,
  box: { x: number; y: number; w: number; h: number },
  name: string
): Promise<File> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const sx = Math.round(img.naturalWidth * box.x);
    const sy = Math.round(img.naturalHeight * box.y);
    const sw = Math.round(img.naturalWidth * box.w);
    const sh = Math.round(img.naturalHeight * box.h);
    const canvas = document.createElement("canvas");
    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unsupported");
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    return canvasToJpeg(canvas, name);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Turn an Aadhaar PDF into a { front, back } pair.
 *  - 2+ pages  -> page 1 = front, page 2 = back.
 *  - 1 page    -> split the page in half. Portrait pages split top/bottom,
 *                 landscape pages split left/right (both common eAadhaar layouts).
 */
export async function aadhaarPdfToSides(
  file: File
): Promise<{ front: File; back: File }> {
  const pages = await renderPdfPages(file);
  if (pages.length === 0) throw new Error("Empty PDF");

  if (pages.length >= 2) {
    return { front: pages[0].file, back: pages[1].file };
  }

  const { file: single, width, height } = pages[0];
  const landscape = width >= height;
  const front = landscape
    ? await cropImage(single, { x: 0, y: 0, w: 0.5, h: 1 }, "aadhaar-front.jpg")
    : await cropImage(single, { x: 0, y: 0, w: 1, h: 0.5 }, "aadhaar-front.jpg");
  const back = landscape
    ? await cropImage(single, { x: 0.5, y: 0, w: 0.5, h: 1 }, "aadhaar-back.jpg")
    : await cropImage(single, { x: 0, y: 0.5, w: 1, h: 0.5 }, "aadhaar-back.jpg");
  return { front, back };
}

export function isPdf(file: File): boolean {
  return (
    file.type === "application/pdf" || /\.pdf$/i.test(file.name || "")
  );
}
