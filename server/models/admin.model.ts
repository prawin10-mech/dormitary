import { model, Model, Schema } from "mongoose";

export interface IAdmin {
  name: string;
  email: string;
  password: string;
  profileImage?: string;
  role: string;
}

const schema = new Schema<IAdmin, Model<IAdmin>>(
  {
    name: { type: String, required: [true, "Name is Required"] },
    email: { type: String, required: [true, "Email is Required"] },
    password: { type: String, required: [true, "Password is Required"] },
    role: {
      type: String,
      required: [true, "Role is Required"],
      enum: ["ADMIN", "USER", "AGENT"],
    },
    profileImage: { type: String },
  },
  { collection: "Admins", timestamps: true }
);

const AdminModel = model("Admin", schema);

export default AdminModel;
