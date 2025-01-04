"use client";

import React, { useState } from "react";
import dayjs from "dayjs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import toast from "react-hot-toast";
import { useGlobalContext } from "@/lib/useGlobalContext";

export interface IUserCard {
  bed: {
    _id: string;
    bed: string;
    type: string;
    isOccupied: boolean;
    occupiedDate: Date;
    createdAt?: Date;
    customer?: {
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

  // Collect images into an array, ignoring any undefined/null
  const images = [
    bed?.customer?.photo,
    bed?.customer?.aadharFront,
    bed?.customer?.aadharBack,
  ].filter(Boolean);

  // Keep your context logic for checking out a bed
  const { checkOutBed, getBeds } = useGlobalContext();

  // Opens the preview modal at the given image index
  const handleImageClick = (index: number) => {
    setPreviewImageIndex(index);
  };

  // Closes the preview modal
  const handleClosePreview = () => {
    setPreviewImageIndex(null);
  };

  // Navigate to next image
  const handleNextImage = () => {
    if (previewImageIndex !== null) {
      setPreviewImageIndex((prevIndex) => (prevIndex! + 1) % images.length);
    }
  };

  // Navigate to previous image
  const handlePrevImage = () => {
    if (previewImageIndex !== null) {
      setPreviewImageIndex(
        (prevIndex) => (prevIndex! - 1 + images.length) % images.length
      );
    }
  };

  // Check-out logic
  const handleCheckout = async () => {
    toast
      .promise(checkOutBed(bed._id), {
        loading: "Checking out the bed. Please wait...",
        success: () => `Bed successfully checked out!`,
        error: (err) => `${err.toString()}`,
      })
      .then(() => {
        getBeds();
      })
      .catch((err) => console.log(err));
  };

  // If bed data is missing, display an error
  if (!bed) {
    return (
      <div className="text-center text-gray-500">
        Information is incomplete.
      </div>
    );
  }

  return (
    <>
      {/* Dialog Trigger */}
      <Dialog>
        <DialogTrigger asChild>
          <div className="cursor-pointer hover:bg-gray-100 p-2 rounded-md">
            {children}
          </div>
        </DialogTrigger>

        {/* Main Modal: Bed & Customer Info */}
        <DialogContent className="max-w-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Bed Information
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Detailed information about the selected bed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Bed Details */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Bed Name:</span>
                <span>{bed.bed}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Type:</span>
                <span>{bed.type}</span>
              </div>

              {bed.isOccupied && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-600">Check In:</span>
                    <span className="text-gray-700">
                      {bed.occupiedDate
                        ? dayjs(bed.occupiedDate).format("DD MMM YYYY hh:mm A")
                        : "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-600">
                      Check Out:
                    </span>
                    <span className="text-gray-700">
                      {bed.customer && bed.customer.checkout
                        ? dayjs(bed.customer.checkout).format(
                            "DD MMM YYYY hh:mm A"
                          )
                        : bed.occupiedDate
                        ? dayjs(bed.occupiedDate)
                            .add(1, "day")
                            .format("DD MMM YYYY hh:mm A")
                        : "N/A"}
                    </span>
                  </div>
                </>
              )}

              {/* Add period or other bed details here if desired */}
            </div>

            {/* Customer Details */}
            {bed.customer && (
              <>
                <div className="text-gray-700 font-bold">Customer Details:</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-sm font-medium text-gray-700">
                      Name:
                    </span>
                    <span className="block">{bed.customer.name || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">
                      Phone:
                    </span>
                    <span className="block">
                      {bed.customer.number || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">
                      Age:
                    </span>
                    <span className="block">{bed.customer.age || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">
                      Email:
                    </span>
                    <span className="block">{bed.customer.email || "N/A"}</span>
                  </div>
                </div>

                {/* Images Section */}
                <div className="font-medium text-gray-700 mt-4">Images:</div>
                <div className="overflow-x-auto flex gap-4 mt-2">
                  {images.map((src, index) => (
                    <div
                      key={index}
                      className="relative w-32 h-32 flex-shrink-0 border border-gray-300 rounded-lg overflow-hidden"
                    >
                      <Image
                        src={src!}
                        alt={`Image ${index + 1}`}
                        fill
                        className="object-cover cursor-pointer"
                        onClick={() => handleImageClick(index)}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Footer: Check Out button */}
          <DialogFooter>
            {bed.isOccupied && (
              <button
                onClick={handleCheckout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Check Out
              </button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      {previewImageIndex !== null && (
        <Dialog open onOpenChange={handleClosePreview}>
          <DialogContent className="flex flex-col items-center space-y-4 max-w-md mx-auto p-4">
            {/* Larger Container for the Preview Image */}
            <div className="relative w-72 h-72">
              <Image
                src={images[previewImageIndex]!}
                alt="Preview"
                fill
                className="object-contain rounded-lg"
              />
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handlePrevImage}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
              >
                Previous
              </button>
              <button
                onClick={handleClosePreview}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Close
              </button>
              <button
                onClick={handleNextImage}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
              >
                Next
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
