import { model, models, Model, Schema } from "mongoose";

export interface IAdmin {
  _id: string;
  name: string;
  email: string;
  password: string;
  profileImage?: string;
  role: "ADMIN" | "USER" | "AGENT";
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<IAdmin>(
  {
    name: { type: String, required: [true, "Name is Required"] },
    email: {
      type: String,
      required: [true, "Email is Required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
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

// Reuse an already-compiled model across hot reloads / repeated imports.
const AdminModel =
  (models.Admin as Model<IAdmin>) || model<IAdmin>("Admin", schema);

export default AdminModel;
