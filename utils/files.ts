import { unlinkSync } from "fs";

export const deleteFile = (path: string) => {
  try {
    unlinkSync(path);
  } catch (error) {
    console.error(error);
  }
};
