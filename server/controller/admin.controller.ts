import { Request, Response } from "express";
import bcrypt from "bcrypt";
import AdminModel from "../models/admin.model";
import { generateJwtToken } from "../functions/generateJwtToken";
import { CustomAdminRequest } from "../functions/CustomRequest";
import { sendNotificationToToken } from "../utils/sendNotification";

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

export const AddTokenToAdmin = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    const email = (req as CustomAdminRequest).adminId;
    const admin = await AdminModel.findOne({ email });

    if (admin) {
      admin.fcmToken = token;
      await admin.save();
      return res
        .status(404)
        .json({ message: "Admin with this email already found" });
    }

    return res.json({ message: "Token Added Successfully", admin });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong", error });
  }
};

export const sendNotification = async (req: Request, res: Response) => {
  try {
    sendNotificationToToken(
      "fqn_Y14E3SbpAS-v7tSmHY:APA91bHHQJCn1VVKSwKV_NBWVbWcek5O8fgyfFVTQ03cN4rEluu3iDP8PcMWH8zoZRNt4H2OF6cHaXOyEirkoLQA_U7KkjuONyIMk5JmW9w3jrQ1bLwznwQ"
    );

    return res.json({ message: "send" });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong", error });
  }
};
