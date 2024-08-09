import jwt from "jsonwebtoken";

interface IJwtData {
  adminId: string;
  role: string;
}

export const generateJwtToken = async (data: IJwtData) => {
  const secretKey = process.env.SECRET_KEY as string;

  const token = jwt.sign(data, secretKey, { expiresIn: "1h" });

  return token;
};
