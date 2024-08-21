import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import UserCard from "@/components/UserCard";
import duration from "dayjs/plugin/duration";

dayjs.extend(relativeTime);
dayjs.extend(duration);

interface IBeds {
  name: string;
  occupied: boolean;
  endsIn: Date;
  type?: string;
  bed: {
    _id: string;
    bed: string;
    type: string;
    isOccupied: boolean;
    occupiedDate: Date;
    customer: {
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
}

const Bed: React.FC<IBeds> = ({ name, occupied, endsIn, type, bed }) => {
  const endTime = dayjs(endsIn).add(1, "day");
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    const updateTimeRemaining = () => {
      const now = dayjs();
      const end = dayjs(endTime);
      let duration;

      // Determine the duration based on the period type
      if (bed?.customer?.period === "Month") {
        const endDate = now.add(1, "month");
        duration = dayjs.duration(endDate.diff(now, "months"), "months");
      } else if (bed?.customer?.period === "Day") {
        duration = dayjs.duration(end.diff(now, "days"), "days");
      } else {
        duration = dayjs.duration(end.diff(now));
      }

      if (duration.asMilliseconds() <= 0) {
        setTimeRemaining("Expired");
      } else {
        setTimeRemaining(duration.humanize(true));
      }
    };

    const intervalId = setInterval(updateTimeRemaining, 1000);

    // Initial call to set the time immediately
    updateTimeRemaining();

    return () => clearInterval(intervalId);
  }, [endTime, bed]);

  return (
    <div className="p-1 md:p-3 lg:p-1 mx-auto bg-white shadow-md rounded-lg">
      <UserCard bed={bed}>
        <div
          className={`p-1 md:p-3 lg:p-1 text-center w-24 ${
            occupied
              ? "bg-blue-200 text-blue-800"
              : "bg-green-200 text-green-800"
          } rounded-lg h-32 flex items-center justify-center`}
        >
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">
              {name} {type && <span className="text-sm">({type})</span>}
            </h3>
            <p className="text-sm">
              {occupied ? `Ends in: ${timeRemaining}` : "Available"}
            </p>
          </div>
        </div>
      </UserCard>
    </div>
  );
};

export default Bed;
