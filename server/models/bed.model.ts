import { Document, model, Model, Schema, Types } from "mongoose";
import { BedTypes } from "../utils/BedTypes";

export interface IBed extends Document {
  bed: string;
  type: string;
  isOccupied: boolean;
  occupiedDate: Date;
  customer?: Types.ObjectId;
}

const schema = new Schema<IBed, Model<IBed>>(
  {
    bed: { type: String, required: [true, "Bed is Required"], enum: BedTypes },
    type: { type: String, required: true, enum: ["AC", "REGULAR"] },
    isOccupied: { type: Boolean, required: true, default: false },
    occupiedDate: { type: Date },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
    },
  },
  { collection: "Beds", timestamps: true }
);

const BedModel = model("Bed", schema);

export default BedModel;
