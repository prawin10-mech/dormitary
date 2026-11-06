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
  rawText: string;
}

/** Run OCR on an image File/Blob and return the recognised text. */
export async function runOcr(
  image: File | Blob,
  onProgress?: (pct: number) => void
): Promise<string> {
  const Tesseract = (await import("tesseract.js")).default;
  const { data } = await Tesseract.recognize(image, "eng", {
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
  /government|india|unique|identification|authority|male|female|dob|year|birth|father|address|aadhaar|gov|uidai|\d/i;

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

  // Name: the first "clean" alphabetic line, preferring the line just above DOB.
  const dobLineIdx = lines.findIndex((l) => /DOB|Birth|\d{2}[/\-]\d{2}[/\-]\d{4}/i.test(l));
  const indices = lines.map((_, i) => i);
  const candidateOrder = dobLineIdx > 0 ? [dobLineIdx - 1, ...indices] : indices;
  for (const idx of candidateOrder) {
    const line = lines[idx];
    if (!line) continue;
    const letters = line.replace(/[^A-Za-z ]/g, "").trim();
    if (
      letters.length >= 4 &&
      letters.split(" ").length <= 5 &&
      !NAME_STOPWORDS.test(line)
    ) {
      result.name = letters
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .trim();
      break;
    }
  }

  return result;
}
