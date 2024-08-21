import React from "react";
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

interface IUserCard {
  bed: {
    _id: string;
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
      aadharFront?: string;
      aadharBack?: string;
      period?: string;
    };
  };
  children: React.ReactNode;
}

export default function UserCard({ bed, children }: IUserCard) {
  const { checkOutBed, getBeds } = useGlobalContext();
  if (!bed) {
    return (
      <div className="text-center text-gray-500">
        Information is incomplete.
      </div>
    );
  }

  const handleCheckout = async () => {
    toast
      .promise(
        checkOutBed(bed._id),
        {
          loading: "Checking bed Please wait",
          success: () => `Bed Checked out`,
          error: (err) => `${err.toString()}`,
        },
        {
          style: {
            minWidth: "250px",
          },
          success: {
            duration: 5000,
            icon: "🔥",
          },
          error: {
            duration: 5000,
            icon: "🛑",
          },
        }
      )
      .then(({ blob, filename }) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        getBeds();
      })
      .catch((err) => {
        console.log(err);
      });
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
                <div className="text-gray-600">{bed.bed}</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="font-medium text-gray-600">Type:</div>
                <div className="text-gray-600">{bed.type}</div>
              </div>

              {bed.customer && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-gray-600">Period:</div>
                    <div className="text-gray-600">{bed.customer.period}</div>
                  </div>
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

                      {bed.customer?.aadharFront && (
                        <div className="mt-2">
                          <Image
                            src={bed.customer?.aadharFront}
                            alt={bed.customer?.name || "Customer Aadhar Front"}
                            width={300}
                            height={200}
                            className="rounded-lg"
                          />
                        </div>
                      )}

                      {bed.customer?.aadharBack && (
                        <div className="mt-2">
                          <Image
                            src={bed.customer?.aadharBack}
                            alt={bed.customer?.name || "Customer Aadhar Back"}
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
        <DialogFooter>
          {bed.isOccupied && <button onClick={handleCheckout}>Checkout</button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
