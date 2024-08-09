import { Document, model, Model, Schema, Types } from "mongoose";

export interface ICustomer extends Document {
  name: string;
  email?: string;
  number: string;
  age: number;
  photo?: string;
  aadhar: string;
  bed: Types.ObjectId;
}

const schema = new Schema<ICustomer, Model<ICustomer>>(
  {
    name: { type: String, required: [true, "Name is Required"] },
    email: { type: String }, // Optional field
    number: { type: String, required: [true, "Phone Number is Required"] },
    age: { type: Number, required: [true, "Age is Required"] },
    photo: { type: String }, // Optional field
    aadhar: { type: String, required: [true, "Aadhar is Required"] },
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
