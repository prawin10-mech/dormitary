import { model, models, Model, Schema, Types, Document } from "mongoose";
import { BedTypes } from "../bedTypes";
// Side-effect import: guarantees the referenced "Customer" model is registered
// so `.populate("customer")` works regardless of route import order.
import "./customer";

export interface IBed extends Document {
  bed: string;
  type: "AC" | "REGULAR";
  isOccupied: boolean;
  occupiedDate?: Date;
  customer?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<IBed>(
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

const BedModel = (models.Bed as Model<IBed>) || model<IBed>("Bed", schema);

export default BedModel;
