import React from "react";

interface IBed {
  name: string;
  occupied: boolean;
}

const Bed: React.FC<IBed> = ({ name, occupied }) => {
  return (
    <div>
      <div
        className={`p-4 ${
          occupied ? "bg-blue-200" : "bg-green-200"
        } rounded-lg shadow h-30`}
      >
        {name}
      </div>
    </div>
  );
};

export default Bed;
