import { model, models, Model, Schema, Types, Document } from "mongoose";
// Side-effect import: guarantees the referenced "Bed" model is registered so
// `.populate("bed")` works regardless of route import order.
import "./bed";

export interface ICustomer extends Document {
  name?: string;
  email?: string;
  number: string;
  age?: number;
  photo: string;
  aadharFront: string;
  aadharBack: string;
  bed: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  checkOutAt?: Date;
  period?: "Day" | "Month";
  purpose?: string;
  paymentType?: "UPI" | "Cash" | "Not Paid";
}

const schema = new Schema<ICustomer>(
  {
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    number: { type: String, required: [true, "Phone Number is Required"] },
    age: { type: Number },
    photo: { type: String, required: [true, "Photo is Required"] },
    aadharFront: { type: String, required: [true, "Aadhar Front is Required"] },
    aadharBack: { type: String, required: [true, "Aadhar Back is Required"] },
    purpose: { type: String },
    checkOutAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    paymentType: {
      type: String,
      enum: ["UPI", "Cash", "Not Paid"],
    },
    period: {
      type: String,
      enum: ["Day", "Month"],
      default: "Day",
    },
    bed: {
      type: Schema.Types.ObjectId,
      required: [true, "Bed is Required"],
      ref: "Bed",
    },
  },
  { collection: "Customers", timestamps: true }
);

const CustomerModel =
  (models.Customer as Model<ICustomer>) || model<ICustomer>("Customer", schema);

export default CustomerModel;
