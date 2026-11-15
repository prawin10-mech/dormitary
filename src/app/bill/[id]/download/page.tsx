"use client";

import { useEffect, useRef, useState } from "react";
import { downloadBill } from "@/lib/billPdf";
import { CheckCircle2, Download, Loader2, AlertCircle } from "lucide-react";

/**
 * Public page that turns a booking's bill into a PDF and downloads it.
 * Linked from the "Download PDF" button on /bill/[id] (shared with guests).
 */
export default function BillDownloadPage({ params }: { params: { id: string } }) {
  const [state, setState] = useState<"working" | "done" | "error">("working");
  const started = useRef(false);

  const run = async () => {
    setState("working");
    try {
      await downloadBill(params.id);
      setState("done");
    } catch {
      setState("error");
    }
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
        {state === "working" && (
          <>
            <Loader2 className="mx-auto animate-spin text-indigo-600" size={32} />
            <p className="mt-3 font-semibold text-slate-800">Preparing your bill…</p>
            <p className="text-sm text-slate-500">The PDF will download in a moment.</p>
          </>
        )}
        {state === "done" && (
          <>
            <CheckCircle2 className="mx-auto text-emerald-600" size={32} />
            <p className="mt-3 font-semibold text-slate-800">Bill downloaded</p>
            <p className="text-sm text-slate-500">Check your downloads folder.</p>
          </>
        )}
        {state === "error" && (
          <>
            <AlertCircle className="mx-auto text-rose-600" size={32} />
            <p className="mt-3 font-semibold text-slate-800">Couldn&apos;t create the PDF</p>
            <p className="text-sm text-slate-500">Try again, or open the bill and use Print → Save as PDF.</p>
          </>
        )}
        <div className="mt-5 flex justify-center gap-2">
          {state !== "working" && (
            <button
              onClick={run}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <Download size={16} /> Download again
            </button>
          )}
          <a
            href={`/bill/${params.id}`}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back to bill
          </a>
        </div>
      </div>
    </div>
  );
}
