import { Document, model, Model, Schema, Types } from "mongoose";

export interface ICustomer extends Document {
  name?: string;
  email?: string;
  number: string; // *
  age?: number;
  photo: string; // *
  aadharFront: string; // *
  aadharBack: string; // *
  bed: Types.ObjectId; // *
  createdAt?: Date;
  updatedAt?: Date;
  checkOutAt?: Date;
  period?: string;
  purpose?: string;
  paymentType?: string;
}

const schema = new Schema<ICustomer, Model<ICustomer>>(
  {
    name: { type: String },
    email: { type: String },
    number: { type: String, required: [true, "Phone Number is Required"] },
    age: { type: Number },
    photo: { type: String, required: [true, "Photo is Required"] },
    aadharFront: { type: String, required: [true, "Aadhar Front is Required"] },
    aadharBack: { type: String, required: [true, "Aadhar Back is Required"] },
    purpose: { type: String },
    checkOutAt: { 
      type: Date, 
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) 
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

const customerModel = model("Customer", schema);

export default customerModel;
