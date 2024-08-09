import { Request, Response } from "express";
import bcrypt from "bcrypt";
import AdminModel from "../models/admin.model";
import { generateJwtToken } from "../functions/generateJwtToken";
import { CustomAdminRequest } from "../functions/CustomRequest";

export const getAdminDetails = async (req: Request, res: Response) => {
  try {
    const adminId = (req as CustomAdminRequest).adminId;
    const admin = await AdminModel.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.json({ message: "Admin fetched Successfully", admin });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong", error });
  }
};

export const AdminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const admin = await AdminModel.findOne({ email });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = await generateJwtToken({
      adminId: admin._id.toString(),
      role: admin.role,
    });

    return res.json({ message: "Admin Logged in Successfully", admin, token });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong", error });
  }
};

export const AdminSignup = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const admin = await AdminModel.findOne({ email });

    if (admin) {
      return res
        .status(404)
        .json({ message: "Admin with this email already found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new AdminModel({ ...req.body, password: hashedPassword });

    await newAdmin.save();

    return res.json({ message: "Admin created Successfully", admin: newAdmin });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong", error });
  }
};
