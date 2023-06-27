import { hashSync, compareSync } from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
import { randomBytes } from "crypto";
import { v4 as uuid4 } from "uuid";

config();

export const hashPassword = (password: string) => {
  return hashSync(password, 10);
};

export const comparePassword = (password: string, hash: string) => {
  return compareSync(password, hash);
};

const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;

export const generateAccessToken = (id: number) => {
  if (!ACCESS_TOKEN_SECRET)
    throw new Error("ACCESS_TOKEN_SECRET not set in .env file.");
  return jwt.sign({ id }, ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
};

export const generateRefreshToken = (id: number) => {
  if (!REFRESH_TOKEN_SECRET)
    throw new Error("REFRESH_TOKEN_SECRET not set in .env file.");
  return jwt.sign({ id }, REFRESH_TOKEN_SECRET, { expiresIn: "30d" });
};

export const verifyAccessToken = async (token: string) => {
  try {
    if (!ACCESS_TOKEN_SECRET)
      throw new Error("ACCESS_TOKEN_SECRET not set in .env file.");
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
  } catch (err) {
    console.error(err);
    return false;
  }
};

export const verifyRefreshToken = async (token: string) => {
  try {
    if (!REFRESH_TOKEN_SECRET)
      throw new Error("REFRESH_TOKEN_SECRET not set in .env file.");
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
  } catch (err) {
    console.error(err);
    return false;
  }
};

export const generateRandomPassword = (length = 8) => {
  return randomBytes(length).toString("hex");
};

export const generateRandomApiKey = (length = 32) => {
  const key = randomBytes(length).toString("hex");
  const formatted = `sk-${key}`;
  return formatted;
};

export const getRandomString = (length = 8) => {
  return randomBytes(length).toString("hex");
};

export const getRandomID = () => {
  return uuid4();
};
