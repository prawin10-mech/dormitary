"use client";

import React, { useCallback, useRef, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useGlobalContext } from "@/lib/useGlobalContext";
import toast, { Toaster } from "react-hot-toast";
import { Camera, Loader2, ScanLine, Check, X, UserRound } from "lucide-react";
import { runOcr, parseAadhaar, type AadhaarFields } from "@/lib/aadhaar";

interface IFormInput {
  name?: string;
  number: string;
  email?: string;
  age?: number;
  photo: FileList;
  aadharFront: FileList;
  aadharBack: FileList;
  bed: string;
  period?: string;
  purpose?: string;
  paymentType?: string;
}

type ImgKey = "photo" | "aadharFront" | "aadharBack";

const inputClass =
  "w-full px-4 py-3 border border-slate-300 rounded-xl text-base bg-white transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";
const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

function fileListFrom(file: File): FileList {
  const dt = new DataTransfer();
  dt.items.add(file);
  return dt.files;
}

const Form = () => {
  const { allocateBed, getBeds, beds, getCustomerDetails } = useGlobalContext();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm<IFormInput>({ defaultValues: { period: "Day", paymentType: "Not Paid" } });

  const [previews, setPreviews] = useState<Record<ImgKey, string | null>>({
    photo: null,
    aadharFront: null,
    aadharBack: null,
  });
  const [ocrState, setOcrState] = useState<{
    status: "idle" | "reading" | "done" | "error";
    progress: number;
    fields: AadhaarFields | null;
  }>({ status: "idle", progress: 0, fields: null });

  const setImage = useCallback(
    (key: ImgKey, file: File) => {
      setValue(key, fileListFrom(file), { shouldValidate: true });
      const url = URL.createObjectURL(file);
      setPreviews((p) => ({ ...p, [key]: url }));
    },
    [setValue]
  );

  // --- Aadhaar OCR -> autofill ------------------------------------------------
  const scanAadhaar = useCallback(
    async (file: File) => {
      setOcrState({ status: "reading", progress: 0, fields: null });
      try {
        const text = await runOcr(file, (pct) =>
          setOcrState((s) => ({ ...s, progress: pct }))
        );
        const fields = parseAadhaar(text);
        setOcrState({ status: "done", progress: 100, fields });

        if (fields.name) setValue("name", fields.name, { shouldValidate: true });
        if (typeof fields.age === "number")
          setValue("age", fields.age, { shouldValidate: true });

        const found = [
          fields.name && "name",
          typeof fields.age === "number" && "age",
        ].filter(Boolean);
        toast.success(
          found.length
            ? `Autofilled ${found.join(" & ")} from Aadhaar`
            : "Scan complete — please fill details manually"
        );
      } catch {
        setOcrState({ status: "error", progress: 0, fields: null });
        toast.error("Couldn't read the Aadhaar. Enter details manually.");
      }
    },
    [setValue]
  );

  const onImgInput = (key: ImgKey) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(key, file);
    if (key === "aadharFront") scanAadhaar(file);
  };

  // --- Phone lookup (pre-fill returning guest) -------------------------------
  const handleNumberChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const number = e.target.value;
    if (number.length !== 10) return;
    try {
      const { customer } = await getCustomerDetails(number);
      if (!customer) return;
      setValue("name", customer.name || "");
      setValue("email", customer.email || "");
      setValue("age", customer.age || 0);
      setValue("period", customer.period || "Day");
      setValue("paymentType", customer.paymentType || "Not Paid");
      setValue("purpose", customer.purpose || "");

      const prevBed = customer.bed?.bed;
      const current = beds.find((b: any) => b.bed === prevBed);
      if (current && current.isOccupied) {
        const free = beds.find((b: any) => !b.isOccupied);
        if (free) {
          setValue("bed", free.bed);
          toast(`Bed ${prevBed} is occupied — selected free bed ${free.bed}`);
        }
      } else if (prevBed) {
        setValue("bed", prevBed);
      }
      toast.success("Returning guest — details pre-filled");
    } catch {
      /* ignore lookup failures */
    }
  };

  const onSubmit: SubmitHandler<IFormInput> = async (values) => {
    if (!values.number) return toast.error("Phone number is required");
    if (!values.bed) return toast.error("Please select a bed");
    if (!values.photo?.length) return toast.error("Guest photo is required");
    if (!values.aadharFront?.length) return toast.error("Aadhaar front is required");
    if (!values.aadharBack?.length) return toast.error("Aadhaar back is required");

    try {
      const { blob, filename } = await toast.promise(
        allocateBed({
          name: values.name || "",
          email: values.email || "",
          number: values.number,
          age: values.age || 0,
          photo: values.photo,
          aadharFront: values.aadharFront,
          aadharBack: values.aadharBack,
          bed: values.bed,
          period: values.period || "Day",
          purpose: values.purpose || "",
          paymentType: values.paymentType || "Not Paid",
        }),
        {
          loading: "Allocating bed…",
          success: "Bed allocated 🔥",
          error: (err) => `${err.toString()}`,
        }
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      getBeds();
      setPreviews({ photo: null, aadharFront: null, aadharBack: null });
      setOcrState({ status: "idle", progress: 0, fields: null });
      reset({ period: "Day", paymentType: "Not Paid" });
    } catch {
      /* toast already surfaced the error */
    }
  };

  const availableCount = beds.filter((b: any) => !b.isOccupied).length;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 1. Aadhaar scan */}
      <section>
        <SectionTitle icon={<ScanLine size={18} />} title="Scan Aadhaar *" hint="Front side auto-fills the form" />
        <div className="grid grid-cols-2 gap-3">
          <CaptureTile label="Aadhaar front" preview={previews.aadharFront} onPick={onImgInput("aadharFront")} busy={ocrState.status === "reading"} required />
          <CaptureTile label="Aadhaar back" preview={previews.aadharBack} onPick={onImgInput("aadharBack")} required />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Guest photo and both Aadhaar sides are required to allocate a bed.
        </p>

        {ocrState.status === "reading" && (
          <div className="mt-3 flex items-center gap-2 text-sm text-indigo-600">
            <Loader2 size={16} className="animate-spin" />
            Reading Aadhaar… {ocrState.progress}%
          </div>
        )}
        {ocrState.status === "done" && ocrState.fields && (
          <DetectedPanel fields={ocrState.fields} />
        )}
      </section>

      {/* 2. Guest photo */}
      <section>
        <SectionTitle icon={<UserRound size={18} />} title="Guest photo *" />
        <CaptureTile label="Take / upload photo" preview={previews.photo} onPick={onImgInput("photo")} wide required />
      </section>

      {/* 3. Guest details */}
      <section>
        <SectionTitle title="Guest details" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Phone number *</label>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="10-digit mobile number"
              {...register("number")}
              onChange={handleNumberChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Name</label>
            <input type="text" placeholder="Full name" {...register("name")} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Age</label>
            <input type="number" placeholder="Age" {...register("age")} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Email</label>
            <input type="email" placeholder="email@example.com" {...register("email")} className={inputClass} />
          </div>
        </div>
      </section>

      {/* 4. Stay details */}
      <section>
        <SectionTitle title="Stay details" hint={`${availableCount} beds free`} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Bed *</label>
            <select {...register("bed")} className={inputClass} defaultValue="">
              <option value="" disabled>Select a bed</option>
              {beds.map((bed: any) => (
                <option key={bed._id} value={bed.bed} disabled={bed.isOccupied}>
                  Bed {bed.bed}{bed.isOccupied ? " — occupied" : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Purpose</label>
            <input type="text" placeholder="Purpose of stay" {...register("purpose")} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Period</label>
            <select {...register("period")} className={inputClass}>
              <option value="Day">Day</option>
              <option value="Month">Month</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Payment</label>
            <select {...register("paymentType")} className={inputClass}>
              <option value="Not Paid">Not Paid</option>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
        </div>
      </section>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold px-4 py-3.5 rounded-xl text-base transition shadow-sm"
      >
        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
        {isSubmitting ? "Allocating…" : "Allocate bed & print invoice"}
      </button>

      <Toaster position="top-center" />
    </form>
  );
};

function SectionTitle({ icon, title, hint }: { icon?: React.ReactNode; title: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800 uppercase tracking-wide">
        {icon}{title}
      </h3>
      {hint && <span className="text-xs text-slate-500">{hint}</span>}
    </div>
  );
}

function CaptureTile({
  label,
  preview,
  onPick,
  busy,
  wide,
  required,
}: {
  label: string;
  preview: string | null;
  onPick: (e: React.ChangeEvent<HTMLInputElement>) => void;
  busy?: boolean;
  wide?: boolean;
  required?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <button
      type="button"
      onClick={() => ref.current?.click()}
      aria-label={required ? `${label} (required)` : label}
      className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/40 transition overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
        wide ? "h-40 w-full max-w-xs" : "h-32 w-full"
      }`}
    >
      {preview ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={label} className="absolute inset-0 h-full w-full object-cover" />
          {busy && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Loader2 className="animate-spin text-white" />
            </div>
          )}
        </>
      ) : (
        <>
          <Camera className="text-slate-400" />
          <span className="text-xs text-slate-500 px-2 text-center">
            {label}
            {required && <span className="text-rose-500"> *</span>}
          </span>
        </>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onPick}
        className="hidden"
      />
    </button>
  );
}

function DetectedPanel({ fields }: { fields: AadhaarFields }) {
  const chips = [
    fields.name && { label: "Name", value: fields.name },
    typeof fields.age === "number" && { label: "Age", value: String(fields.age) },
    fields.gender && { label: "Gender", value: fields.gender },
    fields.dob && { label: "DOB", value: fields.dob },
    fields.aadhaarLast4 && { label: "Aadhaar", value: `•••• •••• ${fields.aadhaarLast4}` },
  ].filter(Boolean) as { label: string; value: string }[];

  if (!chips.length)
    return (
      <p className="mt-3 flex items-center gap-1.5 text-xs text-amber-600">
        <X size={14} /> Nothing detected — please enter details manually.
      </p>
    );

  return (
    <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
      <p className="text-xs font-medium text-indigo-700 mb-2 flex items-center gap-1.5">
        <Check size={14} /> Detected from Aadhaar — review & edit below
      </p>
      <div className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <span key={c.label} className="text-xs bg-white border border-indigo-200 rounded-full px-2.5 py-1 text-slate-700">
            <span className="text-slate-400">{c.label}:</span> {c.value}
          </span>
        ))}
      </div>
    </div>
  );
}

export default Form;
