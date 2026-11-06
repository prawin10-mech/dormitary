"use client";
import React, { useState, WheelEvent, MouseEvent } from "react";
import dayjs from "dayjs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { HistoryRecord } from "@/types";

export interface IUserCard {
  bed: HistoryRecord;
  children: React.ReactNode;
}

export default function UserBedDetailsCard({ bed, children }: IUserCard) {
  const [previewImageIndex, setPreviewImageIndex] = useState<number | null>(
    null
  );

  // Zoom and Drag States
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [translate, setTranslate] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  if (!bed) {
    return (
      <div className="text-center text-slate-500">
        Information is incomplete.
      </div>
    );
  }

  // Collect all images
  const images = [bed.photo, bed.aadharFront, bed.aadharBack].filter(Boolean);

  // -----------------------
  // Thumbnail / Modal Logic
  // -----------------------
  const handleImageClick = (index: number) => {
    setPreviewImageIndex(index);
  };

  const handleClosePreview = () => {
    setPreviewImageIndex(null);
    resetTransform(); // Reset zoom & drag
  };

  const handleNextImage = () => {
    if (previewImageIndex !== null) {
      setPreviewImageIndex((prev) => (prev! + 1) % images.length);
      resetTransform(); // Reset transform when switching images
    }
  };

  const handlePrevImage = () => {
    if (previewImageIndex !== null) {
      setPreviewImageIndex(
        (prev) => (prev! - 1 + images.length) % images.length
      );
      resetTransform(); // Reset transform when switching images
    }
  };

  // -------------
  // Zoom Controls
  // -------------

  const resetTransform = () => {
    setZoomLevel(1);
    setTranslate({ x: 0, y: 0 });
  };

  // -----------------
  // Mouse Wheel Zoom
  // -----------------
  const handleWheelZoom = (e: WheelEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (e.deltaY < 0) {
      // Wheel Up => Zoom In
      setZoomLevel((prev) => Math.min(prev + 0.1, 5));
    } else {
      // Wheel Down => Zoom Out
      setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
    }
  };

  // -----------
  // Drag Logic
  // -----------
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    // Only allow dragging if zoomLevel > 1
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    // Store the initial cursor position relative to the current translate
    setDragStart({
      x: e.clientX - translate.x,
      y: e.clientY - translate.y,
    });
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.stopPropagation();
    // Calculate how far the mouse has moved from the original drag start
    setTranslate({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUpOrLeave = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(false);
  };

  // ------------------------
  // Main Return (JSX Layout)
  // ------------------------
  return (
    <Dialog>
      <DialogTrigger>
        <div className="cursor-pointer hover:bg-slate-100 p-2 rounded-md">
          {children}
        </div>
      </DialogTrigger>

      {/*
        Main Modal:
        - Make it responsive for all screens
        - Allow horizontal scroll for the images only
        - Make sure content remains visible
      */}
      <DialogContent className="w-full max-w-xl sm:max-w-2xl px-4 py-6">
        <DialogHeader className="border-b border-slate-200 pb-3">
          <DialogTitle className="text-xl font-semibold text-slate-800">
            Bed Information
          </DialogTitle>
        </DialogHeader>

        {/*
          We add a wrapper with a vertical scroll if content gets too tall
          e.g., max-h-[80vh] so it doesn't exceed the viewport height
        */}
        <div className="max-h-[80vh] overflow-y-auto mt-4 space-y-4 pr-2">
          {/* Bed Details */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-500">Bed Name:</span>
              <span className="text-slate-800">{bed.bed.bed}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-500">Type:</span>
              <span className="text-slate-800">{bed.bed.type}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-500">Period:</span>
              <span className="text-slate-800">{bed.period || "N/A"}</span>
            </div>
          </div>

          {/* Customer Details */}
          <div>
            <span className="block font-medium text-slate-500 mb-2">
              Customer Details:
            </span>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-500">Name:</span>
                <span className="text-slate-800">{bed.name || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-500">Phone:</span>
                <span className="text-slate-800">{bed.number || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-500">Age:</span>
                <span className="text-slate-800">{bed.age || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-500">Email:</span>
                <span className="text-slate-800">{bed.email || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-500">Check In:</span>
                <span className="text-slate-800">
                  {bed.bed.occupiedDate
                    ? dayjs(bed.bed.occupiedDate).format("DD MMM YYYY hh:mm A")
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-500">Check Out:</span>
                <span className="text-slate-800">
                  {bed.checkout
                    ? dayjs(bed.checkout).format("DD MMM YYYY hh:mm A")
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Images Section - Horizontal Scroll */}
          {images.length > 0 && (
            <div>
              <span className="block font-medium text-slate-500 mb-2">
                Images:
              </span>
              <div className="w-full overflow-x-auto flex gap-4">
                {images.map((imgSrc, index) => (
                  <div
                    key={index}
                    className="relative w-40 h-40 flex-shrink-0 border border-slate-200 rounded-lg overflow-hidden"
                  >
                    {imgSrc && (
                      <Image
                        src={imgSrc}
                        alt={`Image ${index + 1}`}
                        fill
                        className="object-cover cursor-pointer"
                        onClick={() => handleImageClick(index)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Purpose */}
          <div>
            <div className="flex items-center justify-between mt-4">
              <span className="font-medium text-slate-500">Purpose:</span>
              <span className="text-slate-800">{bed.purpose || "N/A"}</span>
            </div>
          </div>
        </div>
      </DialogContent>

      {/*
        Preview Modal:
        - Zoom with mouse wheel
        - Drag to pan the image
      */}
      {previewImageIndex !== null && (
        <Dialog open>
          <DialogContent
            className="w-full max-w-md sm:max-w-lg mx-auto flex flex-col items-center space-y-4 p-4"
            onClick={handleClosePreview}
          >
            {/*
              Zoomable + Draggable Container
              - Remove "overflow-auto" or "overflow-scroll" so we can do the drag ourselves
              - We'll do overflow-hidden to hide any extra image area
            */}
            <div
              className="relative w-72 h-72 sm:w-80 sm:h-80 overflow-hidden rounded-lg border border-slate-200"
              // Prevent click on background from closing modal
              onClick={(e) => e.stopPropagation()}
              // Mouse wheel for zoom
              onWheel={handleWheelZoom}
              // Mouse events for drag
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              style={{
                cursor:
                  zoomLevel > 1
                    ? isDragging
                      ? "grabbing"
                      : "grab"
                    : "default",
              }}
            >
              {images[previewImageIndex] && (
                <div
                  className="absolute top-0 left-0"
                  style={{
                    transform: `
                      translate(${translate.x}px, ${translate.y}px)
                      scale(${zoomLevel})
                    `,
                    transformOrigin: "0 0", // top-left origin for simpler drag math
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <Image
                    src={images[previewImageIndex]}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                </div>
              )}
            </div>

            {/* Navigation Buttons (Previous, Close, Next) */}
            <div
              className="flex w-full justify-evenly"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
                className="py-2 px-4 bg-slate-700 text-white rounded-xl transition hover:bg-slate-800"
              >
                Previous
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClosePreview();
                }}
                className="py-2 px-4 bg-rose-600 text-white rounded-xl transition hover:bg-rose-700"
              >
                Close
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                className="py-2 px-4 bg-slate-700 text-white rounded-xl transition hover:bg-slate-800"
              >
                Next
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}
