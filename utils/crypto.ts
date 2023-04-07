import { hashSync, compareSync } from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
import { randomBytes } from "crypto";

config();

export const hashPassword = (password: string) => {
  return hashSync(password, 10);
};

export const comparePassword = (password: string, hash: string) => {
  return compareSync(password, hash);
};

const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;

export const generateAccessToken = (id: number) => {
  return jwt.sign({ id }, ACCESS_TOKEN_SECRET!, { expiresIn: "1d" });
};

export const generateRefreshToken = (id: number) => {
  return jwt.sign({ id }, REFRESH_TOKEN_SECRET!, { expiresIn: "7d" });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET!);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET!);
};

export const generateRandomPassword = (length: number = 8) => {
  return randomBytes(length).toString("hex");
};
