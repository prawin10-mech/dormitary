import React, { useState } from "react";
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

  if (!bed) {
    return (
      <div className="text-center text-gray-500">
        Information is incomplete.
      </div>
    );
  }

  const images = [bed.photo, bed.aadharFront, bed.aadharBack].filter(Boolean);

  const handleImageClick = (index: number) => {
    setPreviewImageIndex(index);
  };

  const handleClosePreview = () => {
    setPreviewImageIndex(null);
  };

  const handleNextImage = () => {
    if (previewImageIndex !== null) {
      setPreviewImageIndex((prevIndex) => (prevIndex! + 1) % images.length);
    }
  };

  const handlePrevImage = () => {
    if (previewImageIndex !== null) {
      setPreviewImageIndex(
        (prevIndex) => (prevIndex! - 1 + images.length) % images.length
      );
    }
  };

  return (
    <Dialog>
      <DialogTrigger>
        <div className="cursor-pointer hover:bg-gray-100 p-2 rounded-md">
          {children}
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader className="bg-gray-100 p-4 rounded-t-md">
          <DialogTitle className="text-xl font-semibold">
            Bed Information
          </DialogTitle>
          <DialogDescription className="text-gray-700 mt-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium text-gray-600">Bed Name:</div>
                <div className="text-gray-600">{bed.bed.bed}</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="font-medium text-gray-600">Type:</div>
                <div className="text-gray-600">{bed.bed.type}</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="font-medium text-gray-600">Period:</div>
                <div className="text-gray-600">{bed.period}</div>
              </div>
              <div className="font-medium text-gray-600">Customer Details:</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-gray-600">Name:</div>
                  <div className="text-gray-600">{bed.name || "N/A"}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="font-medium text-gray-600">Phone:</div>
                  <div className="text-gray-600">{bed.number || "N/A"}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="font-medium text-gray-600">Age:</div>
                  <div className="text-gray-600">{bed.age || "N/A"}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="font-medium text-gray-600">Email:</div>
                  <div className="text-gray-600">{bed.email || "N/A"}</div>
                </div>

                <div className="flex gap-4">
                  {bed.photo && (
                    <div className="mt-2">
                      <Image
                        src={bed.photo}
                        alt={bed.name || "Customer Photo"}
                        width={100}
                        height={100}
                        className="cursor-pointer"
                        onClick={() => {
                          handleImageClick(0);
                        }}
                      />
                    </div>
                  )}

                  {bed.aadharFront && (
                    <div className="mt-2">
                      <Image
                        src={bed.aadharFront}
                        alt={bed.name || "Customer Aadhar Front"}
                        width={300}
                        height={200}
                        className="rounded-lg cursor-pointer"
                        onClick={() => {
                          handleImageClick(1);
                        }}
                      />
                    </div>
                  )}

                  {bed.aadharBack && (
                    <div className="mt-2">
                      <Image
                        src={bed.aadharBack}
                        alt={bed.name || "Customer Aadhar Back"}
                        width={300}
                        height={200}
                        className="rounded-lg cursor-pointer"
                        onClick={() => {
                          handleImageClick(2);
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="font-medium text-gray-600">Purpose:</div>
                  <div className="text-gray-600">{bed.purpose || "N/A"}</div>
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>

      {previewImageIndex !== null && (
        <Dialog open={true}>
          <DialogContent
            className="w-full flex flex-col items-center"
            onClick={handleClosePreview}
          >
            {images[previewImageIndex] && (
              <Image
                src={images[previewImageIndex]}
                alt="Preview"
                width={200}
                height={100}
                className="w-full h-auto rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            )}
            <div className="mt-4 flex justify-between w-full">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
                className="py-2 px-4 bg-gray-700 text-white rounded-lg"
              >
                Previous
              </button>
              <button
                onClick={(e) => {
                  handleClosePreview();
                }}
                className="py-2 px-4 bg-gray-700 text-white rounded-lg"
              >
                Close
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                className="py-2 px-4 bg-gray-700 text-white rounded-lg"
              >
                Next
              </button>
            </div>
            {/* <button
              onClick={handleClosePreview}
              className="mt-4 py-2 px-4 bg-gray-700 text-white rounded-lg"
            >
              Close Preview
            </button> */}
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}
