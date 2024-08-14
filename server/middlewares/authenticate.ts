import { NextFunction, Request, Response } from "express";
import { JsonWebTokenError, verify } from "jsonwebtoken";
import { CustomAdminRequest } from "../functions/CustomRequest";

export default async function authentication(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const secretKey = process.env.SECRET_KEY as string;
    const authorization = req.headers.authorization;

    if (!authorization) return res.sendStatus(401);

    const token = authorization.split(" ")[1];

    const admin = verify(token, secretKey) as CustomAdminRequest;

    // req.userId = userId;
    (req as CustomAdminRequest).adminId = admin.adminId;
    (req as CustomAdminRequest).role = admin.role;
    next();
  } catch (error) {
    // console.log(error);
    if (error instanceof JsonWebTokenError) {
      if (error.message === "jwt expired") {
        return res.status(401).json({ code: "jwt expired" });
      }
      if (error.message === "jwt malformed")
        return res.status(401).json({ code: "jwt malformed" });

      return res.status(401).json({ code: "other-error" });
    }
    // console.log(error);
    return res.status(500).json({ code: "server-error" });
  }
}
