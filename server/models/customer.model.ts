import { Document, model, Model, Schema, Types } from "mongoose";

export interface ICustomer extends Document {
  name: string;
  email?: string;
  number: string;
  age: number;
  photo: string;
  aadharFront: string;
  aadharBack: string;
  bed: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  checkOutAt?: Date;
  period: string;
}

const schema = new Schema<ICustomer, Model<ICustomer>>(
  {
    name: { type: String, required: [true, "Name is Required"] },
    email: { type: String },
    number: { type: String, required: [true, "Phone Number is Required"] },
    age: { type: Number, required: [true, "Age is Required"] },
    photo: { type: String, required: [true, "Photo is Required"] },
    aadharFront: { type: String, required: [true, "Aadhar Front is Required"] },
    aadharBack: { type: String, required: [true, "Aadhar Back is Required"] },
    checkOutAt: { type: Date },
    period: {
      type: String,
      required: [true, "Period is Required"],
      enum: ["Day", "Month"],
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
