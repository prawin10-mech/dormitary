"use client";

import Header from "@/components/Header";
import dayjs from "dayjs";
import UserBedDetailsCard from "@/components/UserBedDetailsCard";
import { useGlobalContext } from "@/lib/useGlobalContext";
import React, { useState } from "react";

interface Booking {
  id: string;
  date: string;
  service: string;
  status: string;
}

export default function Page() {
  const { bookings, getUserBookings } = useGlobalContext();
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const fetchBookings = async () => {
    setError(""); // Clear any previous error messages
    setLoading(true); // Start loading
    try {
      if (!phoneNumber.match(/^\d{10}$/)) {
        setError("Please enter a valid 10-digit phone number.");
        setLoading(false);
        return;
      }
      await getUserBookings({ number: phoneNumber.toString() });
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="">
      <div className="w-full bg-white shadow-lg rounded-lg mb-4 md:mb-0">
        <Header />
      </div>
      <div className="p-6 font-sans">
        <h1 className="text-2xl font-bold mb-4">Booking Details</h1>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="p-2 border rounded w-64 mr-2 text-lg"
          />
          <button
            onClick={fetchBookings}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {loading ? "Loading..." : "Fetch Bookings"}
          </button>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        {bookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table-auto w-full border-collapse border border-gray-300 mt-4">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    S. No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bed No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check In
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check Out
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking, index) => (
                  <tr key={booking._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm cursor-pointer font-medium text-gray-900">
                      <UserBedDetailsCard bed={booking}>
                        {booking.name}
                      </UserBedDetailsCard>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking?.bed?.bed || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.createdAt
                        ? dayjs(booking.createdAt).format("DD MMM YYYY hh:mm A")
                        : "N/A"}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.createdAt
                        ? dayjs(booking.createdAt)
                            .add(1, "day")
                            .format("DD MMM YYYY hh:mm A")
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No bookings found.</p>
        )}
      </div>
    </div>
  );
}
