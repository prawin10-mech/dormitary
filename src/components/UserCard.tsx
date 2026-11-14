"use client";

import React, { useState, WheelEvent, MouseEvent } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import toast from "react-hot-toast";
import { useGlobalContext } from "@/lib/useGlobalContext";
import { billUrl, waBillLink } from "@/lib/bill";
import {
  Phone,
  Mail,
  MessageCircle,
  FileText,
  Calendar,
  CalendarClock,
  Clock,
  CreditCard,
  Tag,
  Hash,
  BedDouble,
  LogOut,
  CheckCircle2,
  UserRound,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

dayjs.extend(relativeTime);

export interface IUserCard {
  bed: {
    _id: string;
    bed: string;
    type: string;
    isOccupied: boolean;
    occupiedDate: Date;
    createdAt?: Date;
    customer?: {
      _id?: string;
      name?: string;
      number?: string;
      age?: number;
      email?: string;
      photo?: string;
      aadharFront?: string;
      aadharBack?: string;
      period?: string;
      purpose?: string;
      paymentType?: string;
      checkout?: Date;
    };
  };
  children: React.ReactNode;
}

export default function UserCard({ bed, children }: IUserCard) {
  const [previewImageIndex, setPreviewImageIndex] = useState<number | null>(
    null
  );
  const { checkOutBed, getBeds } = useGlobalContext();

  // Labelled documents for the gallery (drops any missing image).
  const docImages = [
    { src: bed?.customer?.photo, label: "Photo" },
    { src: bed?.customer?.aadharFront, label: "Aadhaar Front" },
    { src: bed?.customer?.aadharBack, label: "Aadhaar Back" },
  ].filter((d) => Boolean(d.src)) as { src: string; label: string }[];

  const handleImageClick = (index: number) => setPreviewImageIndex(index);
  const handleClosePreview = () => {
    setPreviewImageIndex(null);
    resetTransform();
  };
  const handleNextImage = () => {
    if (previewImageIndex !== null) {
      resetTransform();
      setPreviewImageIndex((p) => (p! + 1) % docImages.length);
    }
  };
  const handlePrevImage = () => {
    if (previewImageIndex !== null) {
      resetTransform();
      setPreviewImageIndex(
        (p) => (p! - 1 + docImages.length) % docImages.length
      );
    }
  };

  const handleCheckout = async () => {
    toast
      .promise(checkOutBed(bed._id), {
        loading: "Checking out the bed. Please wait...",
        success: () => `Bed successfully checked out!`,
        error: (err) => `${err.toString()}`,
      })
      .then(() => getBeds())
      .catch((err) => console.log(err));
  };

  // Zoom + drag state for the preview.
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  const resetTransform = () => {
    setZoomLevel(1);
    setTranslate({ x: 0, y: 0 });
  };

  const handleWheelZoom = (e: WheelEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setZoomLevel((prev) =>
      e.deltaY < 0 ? Math.min(prev + 0.15, 5) : Math.max(prev - 0.15, 0.5)
    );
  };
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - translate.x, y: e.clientY - translate.y });
  };
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.stopPropagation();
    setTranslate({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUpOrLeave = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(false);
  };

  if (!bed) {
    return (
      <div className="text-center text-slate-500">
        Information is incomplete.
      </div>
    );
  }

  // --- Derived status / dates -------------------------------------------------
  const customer = bed.customer;
  const isMonth = customer?.period === "Month";
  const checkInDate = bed.occupiedDate ? dayjs(bed.occupiedDate) : null;
  const checkOutDate = checkInDate
    ? checkInDate.add(1, isMonth ? "month" : "day")
    : null;
  const expired =
    bed.isOccupied && checkOutDate ? checkOutDate.isBefore(dayjs()) : false;
  const remaining =
    bed.isOccupied && checkOutDate && !expired
      ? checkOutDate.fromNow(true)
      : null;

  const status = !bed.isOccupied
    ? { label: "Available", cls: "bg-emerald-100 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" }
    : expired
    ? { label: "Expired", cls: "bg-rose-100 text-rose-700 ring-rose-200", dot: "bg-rose-500" }
    : { label: "Occupied", cls: "bg-indigo-100 text-indigo-700 ring-indigo-200", dot: "bg-indigo-500" };

  const payment = customer?.paymentType || "Not Paid";
  const paymentCls =
    payment === "Not Paid"
      ? "text-rose-600"
      : "text-emerald-600";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer">{children}</div>
      </DialogTrigger>

      <DialogContent className="flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-1.5rem)] max-w-lg flex-col gap-0 overflow-hidden rounded-2xl p-0">
        {/* Header */}
        <DialogHeader className="flex-shrink-0 space-y-0 border-b border-slate-100 bg-slate-50/80 px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex items-center justify-between gap-3 pr-7">
            <DialogTitle className="flex items-center gap-2.5 text-left text-lg font-bold text-slate-800">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm sm:h-10 sm:w-10 sm:rounded-xl">
                <BedDouble size={18} />
              </span>
              <span>
                Bed {bed.bed}
                <span className="ml-1.5 rounded-md bg-slate-200 px-1.5 py-0.5 align-middle text-[11px] font-semibold text-slate-600">
                  {bed.type}
                </span>
              </span>
            </DialogTitle>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${status.cls}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {bed.isOccupied && customer ? (
            <div className="space-y-4">
              {/* Guest hero */}
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow-md">
                  {customer.photo ? (
                    <Image
                      src={customer.photo}
                      alt={customer.name || "Guest"}
                      fill
                      className="cursor-pointer object-cover"
                      onClick={() => {
                        const i = docImages.findIndex((d) => d.label === "Photo");
                        if (i >= 0) handleImageClick(i);
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                      <UserRound size={28} />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold text-slate-800 sm:text-lg">
                    {customer.name || "Unknown guest"}
                  </h3>
                  {customer.number ? (
                    <a
                      href={`tel:${customer.number}`}
                      className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:underline"
                    >
                      <Phone size={14} /> {customer.number}
                    </a>
                  ) : (
                    <p className="text-sm text-slate-400">No phone on file</p>
                  )}
                </div>
              </div>

              {/* Time remaining banner */}
              <div
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                  expired
                    ? "bg-rose-50 text-rose-700"
                    : "bg-indigo-50 text-indigo-700"
                }`}
              >
                <Clock size={16} />
                {expired ? (
                  <span>Stay expired — ready for checkout</span>
                ) : (
                  <span>
                    Checks out {remaining ? `in ${remaining}` : "soon"}
                  </span>
                )}
              </div>

              {/* Info grid: compact label/value cells, readable on phones */}
              <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 text-sm">
                <InfoItem icon={<Hash size={13} />} label="Age" value={customer.age ? String(customer.age) : "—"} />
                <InfoItem icon={<Calendar size={13} />} label="Period" value={customer.period || "Day"} />
                <InfoItem
                  icon={<CreditCard size={13} />}
                  label="Payment"
                  value={payment}
                  valueClass={paymentCls}
                />
                <InfoItem icon={<Tag size={13} />} label="Purpose" value={customer.purpose || "—"} />
                <InfoItem
                  icon={<Calendar size={13} />}
                  label="Check in"
                  value={checkInDate ? checkInDate.format("DD MMM, hh:mm A") : "—"}
                />
                <InfoItem
                  icon={<CalendarClock size={13} />}
                  label="Check out"
                  value={checkOutDate ? checkOutDate.format("DD MMM, hh:mm A") : "—"}
                />
                {customer.email && (
                  <InfoItem icon={<Mail size={13} />} label="Email" value={customer.email} wide />
                )}
              </dl>

              {/* Documents */}
              {docImages.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Documents
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {docImages.map((doc, index) => (
                      <button
                        key={doc.label}
                        type="button"
                        onClick={() => handleImageClick(index)}
                        className="group overflow-hidden rounded-xl border border-slate-200 text-left transition hover:border-indigo-300 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      >
                        <div className="relative aspect-[4/3] w-full bg-slate-50">
                          <Image
                            src={doc.src}
                            alt={doc.label}
                            fill
                            className="object-cover transition group-hover:scale-105"
                          />
                        </div>
                        <span className="block truncate px-2 py-1 text-[11px] font-medium text-slate-500">
                          {doc.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty / available state */
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                <CheckCircle2 size={34} />
              </span>
              <div>
                <p className="text-base font-semibold text-slate-800">
                  Bed {bed.bed} is available
                </p>
                <p className="mt-0.5 text-sm text-slate-500">
                  No guest is currently checked in to this {bed.type} bed.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {bed.isOccupied && (
          <DialogFooter className="grid flex-shrink-0 grid-cols-2 gap-2 border-t border-slate-100 bg-slate-50/80 px-4 py-3 sm:flex sm:flex-row sm:justify-end sm:space-x-0 sm:px-5">
            {customer?._id && (
              <>
                <a
                  href={waBillLink(
                    customer.number || "",
                    customer.name || "Guest",
                    billUrl(customer._id)
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1ebe5b] sm:w-auto sm:px-4"
                >
                  <MessageCircle size={16} /> Send bill
                </a>
                <a
                  href={billUrl(customer._id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto sm:px-4"
                >
                  <FileText size={16} /> View bill
                </a>
              </>
            )}
            <button
              onClick={handleCheckout}
              className="col-span-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 sm:w-auto"
            >
              <LogOut size={16} /> Check out
            </button>
          </DialogFooter>
        )}
      </DialogContent>

      {/* Image preview (zoom + pan) */}
      {previewImageIndex !== null && docImages[previewImageIndex] && (
        <Dialog open onOpenChange={(o) => !o && handleClosePreview()}>
          <DialogContent className="flex w-[calc(100vw-2rem)] max-w-lg flex-col items-center gap-4 rounded-2xl p-4">
            <div className="flex w-full items-center justify-start pr-7">
              <span className="text-sm font-semibold text-slate-700">
                {docImages[previewImageIndex].label}
              </span>
            </div>

            <div
              className="relative h-72 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-900/5 sm:h-80"
              onClick={(e) => e.stopPropagation()}
              onWheel={handleWheelZoom}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              style={{
                cursor:
                  zoomLevel > 1 ? (isDragging ? "grabbing" : "grab") : "default",
              }}
            >
              <div
                className="absolute left-0 top-0 h-full w-full"
                style={{
                  transform: `translate(${translate.x}px, ${translate.y}px) scale(${zoomLevel})`,
                  transformOrigin: "0 0",
                }}
              >
                <Image
                  src={docImages[previewImageIndex].src}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-black/55 px-2 py-0.5 text-[11px] font-medium text-white">
                Scroll to zoom · drag to pan
              </span>
            </div>

            {docImages.length > 1 && (
              <div className="flex w-full items-center justify-between">
                <button
                  onClick={handlePrevImage}
                  className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                <span className="text-xs text-slate-400">
                  {previewImageIndex + 1} / {docImages.length}
                </span>
                <button
                  onClick={handleNextImage}
                  className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}

function InfoItem({
  icon,
  label,
  value,
  valueClass = "text-slate-800",
  wide = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
  wide?: boolean;
}) {
  return (
    <div
      className={`min-w-0 bg-white px-3 py-2 ${wide ? "col-span-2" : ""}`}
    >
      <dt className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </dt>
      <dd className={`mt-0.5 break-words text-sm font-semibold leading-snug ${valueClass}`}>
        {value}
      </dd>
    </div>
  );
}
