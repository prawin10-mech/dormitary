import { Request } from "express";

export interface CustomAdminRequest extends Request {
  adminId: string;
  role: string;
}
