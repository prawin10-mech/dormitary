/**
 * In-browser Aadhaar / ID OCR. The image is processed on-device with
 * Tesseract.js — the raw ID never goes to a third-party OCR service.
 *
 * Note: we deliberately do NOT return or store the full 12-digit Aadhaar
 * number (sensitive & regulated). We surface the masked last-4 only, for the
 * operator to visually confirm the right card was scanned.
 */

export interface AadhaarFields {
  name?: string;
  dob?: string; // dd/mm/yyyy or yyyy
  age?: number;
  gender?: "Male" | "Female" | "Other";
  aadhaarLast4?: string;
  phone?: string; // 10-digit Indian mobile, if printed on the card
  rawText: string;
}

/**
 * Preprocess an ID image for OCR: upscale small images and convert to high
 * contrast grayscale. Tesseract reads Aadhaar text far more reliably this way.
 * Falls back to the original file if canvas isn't available.
 */
async function preprocess(image: File | Blob): Promise<HTMLCanvasElement | Blob> {
  if (typeof document === "undefined") return image;
  try {
    const url = URL.createObjectURL(image);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });
    URL.revokeObjectURL(url);

    // Scale so the longest edge is ~1800px (helps small phone photos).
    const target = 1800;
    const scale = Math.min(3, Math.max(1, target / Math.max(img.width, img.height)));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return image;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Grayscale + mild contrast stretch.
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const px = data.data;
    for (let i = 0; i < px.length; i += 4) {
      const g = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
      const c = Math.min(255, Math.max(0, (g - 128) * 1.25 + 128));
      px[i] = px[i + 1] = px[i + 2] = c;
    }
    ctx.putImageData(data, 0, 0);
    return canvas;
  } catch {
    return image;
  }
}

/** Run OCR on an image File/Blob and return the recognised text. */
export async function runOcr(
  image: File | Blob,
  onProgress?: (pct: number) => void
): Promise<string> {
  const Tesseract = (await import("tesseract.js")).default;
  const source = await preprocess(image);
  const { data } = await Tesseract.recognize(source as Blob, "eng", {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === "recognizing text" && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });
  return data.text || "";
}

function ageFromDob(dob: string): number | undefined {
  // dob may be "dd/mm/yyyy", "dd-mm-yyyy" or just "yyyy".
  let year: number | undefined;
  let month = 0;
  let day = 1;

  const full = dob.match(/(\d{2})[/\-](\d{2})[/\-](\d{4})/);
  if (full) {
    day = Number(full[1]);
    month = Number(full[2]) - 1;
    year = Number(full[3]);
  } else {
    const y = dob.match(/(\d{4})/);
    if (y) year = Number(y[1]);
  }
  if (!year) return undefined;

  const birth = new Date(year, month, day);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age >= 0 && age < 120 ? age : undefined;
}

const NAME_STOPWORDS =
  /government|india|republic|unique|identification|authority|male|female|transgender|dob|year|birth|father|husband|wife|mother|address|aadhaar|aadhar|gov|uidai|vid|mobile|phone|enrol|issue|download|date|help|www|http|proof|identity|\d/i;

/**
 * Decide whether an OCR line looks like a person's name, and if so return it
 * cleaned up and title-cased. Returns null when the line isn't a plausible name.
 */
function nameFromLine(line: string): string | null {
  // Drop relationship prefixes like "S/O", "D/O", "C/O" and anything after.
  const withoutRel = line.replace(/\b[SDWC]\s*[/\\]?\s*O\b.*$/i, " ");
  // Keep letters, spaces and dots (for initials); collapse whitespace.
  const cleaned = withoutRel
    .replace(/[^A-Za-z. ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return null;
  if (NAME_STOPWORDS.test(line)) return null;

  const words = cleaned.split(" ").filter((w) => w.replace(/\./g, "").length);
  if (words.length < 1 || words.length > 5) return null;

  const letters = cleaned.replace(/[^A-Za-z]/g, "");
  if (letters.length < 3 || letters.length > 40) return null;

  // Reject lines dominated by 1-letter noise (OCR garbage).
  const realWords = words.filter((w) => w.replace(/\./g, "").length >= 2);
  if (realWords.length === 0) return null;

  return cleaned
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

/** Parse Aadhaar fields out of OCR text using robust-ish heuristics. */
export function parseAadhaar(text: string): AadhaarFields {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const result: AadhaarFields = { rawText: text };

  // 12-digit Aadhaar number (keep only the masked last 4).
  const numMatch = text.match(/\b(\d{4})\s?(\d{4})\s?(\d{4})\b/);
  if (numMatch) result.aadhaarLast4 = numMatch[3];

  // Mobile number, if printed (some cards show it). Indian mobiles are 10
  // digits starting 6-9. Strip spaces/dashes so "98765 43210" matches too.
  const compact = text.replace(/[\s-]/g, "");
  // 12-digit runs are the Aadhaar number — never read a mobile out of those.
  const aadhaarRuns = compact.match(/\d{12,}/g) ?? [];
  const phoneCandidates = compact.match(/(?:\+?91)?[6-9]\d{9}(?!\d)/g) ?? [];
  for (const raw of phoneCandidates) {
    const candidate = raw.replace(/^\+?91/, "");
    if (candidate.length !== 10) continue;
    if (aadhaarRuns.some((run) => run.includes(candidate))) continue;
    result.phone = candidate;
    break;
  }

  // DOB / Year of birth.
  const dobMatch =
    text.match(/(?:DOB|D\.?O\.?B|Date of Birth)[:\s]*([0-3]?\d[/\-][01]?\d[/\-]\d{4})/i) ||
    text.match(/\b([0-3]\d[/\-][01]\d[/\-]\d{4})\b/) ||
    text.match(/(?:Year of Birth|YOB)[:\s]*(\d{4})/i);
  if (dobMatch) {
    result.dob = dobMatch[1];
    result.age = ageFromDob(dobMatch[1]);
  }

  // Gender.
  if (/\bfemale\b|महिला/i.test(text)) result.gender = "Female";
  else if (/\bmale\b|पुरुष/i.test(text)) result.gender = "Male";

  // Name: the strongest signal on an Aadhaar front is the English line(s) just
  // ABOVE the DOB / gender line. Search the 3 lines above it first (nearest
  // wins), then fall back to scanning the whole card top-to-bottom.
  const anchorIdx = lines.findIndex((l) =>
    /DOB|Date of Birth|Year of Birth|YOB|\bMale\b|\bFemale\b|[0-3]\d[/\-][01]\d[/\-]\d{4}/i.test(l)
  );

  if (anchorIdx > 0) {
    for (let i = anchorIdx - 1; i >= 0 && i >= anchorIdx - 3; i--) {
      const n = nameFromLine(lines[i]);
      if (n) {
        result.name = n;
        break;
      }
    }
  }
  if (!result.name) {
    for (const line of lines) {
      const n = nameFromLine(line);
      if (n) {
        result.name = n;
        break;
      }
    }
  }

  return result;
}
