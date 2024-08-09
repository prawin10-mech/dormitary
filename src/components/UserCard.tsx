import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";

interface IUserCard {
  bed: {
    bed: string;
    type: string;
    isOccupied: boolean;
    occupiedDate: Date;
    customer?: {
      name?: string;
      number?: string;
      age?: number;
      email?: string;
      photo?: string;
      aadhar?: string;
    };
  };
  children: React.ReactNode;
}

export default function UserCard({ bed, children }: IUserCard) {
  if (!bed) {
    return (
      <div className="text-center text-gray-500">
        Information is incomplete.
      </div>
    );
  }

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
                <div className="text-gray-600">{bed.bed}</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="font-medium text-gray-600">Type:</div>
                <div className="text-gray-600">{bed.type}</div>
              </div>

              {bed.customer && (
                <>
                  <div className="font-medium text-gray-600">
                    Customer Details:
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-600">Name:</div>
                      <div className="text-gray-600">
                        {bed.customer?.name || "N/A"}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-600">Phone:</div>
                      <div className="text-gray-600">
                        {bed.customer?.number || "N/A"}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-600">Age:</div>
                      <div className="text-gray-600">
                        {bed.customer?.age || "N/A"}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-600">Email:</div>
                      <div className="text-gray-600">
                        {bed.customer?.email || "N/A"}
                      </div>
                    </div>

                    <div className="flex gpa-4">
                      {bed.customer?.photo && (
                        <div className="mt-2">
                          <Image
                            src={bed.customer?.photo}
                            alt={bed.customer?.name || "Customer Photo"}
                            width={100}
                            height={100}
                          />
                        </div>
                      )}

                      {bed.customer?.aadhar && (
                        <div className="mt-2">
                          <Image
                            src={bed.customer?.aadhar}
                            alt={bed.customer?.name || "Customer Aadhar"}
                            width={300}
                            height={200}
                            className="rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
