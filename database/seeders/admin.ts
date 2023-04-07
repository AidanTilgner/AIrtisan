import { createAdmin, getAdminByUsername } from "../functions/admin";
import { config } from "dotenv";
import { generateRandomPassword } from "../../utils/crypto";
import { writeFileSync, readFileSync } from "fs";
import { format } from "prettier";

config();

const { ADMINS } = process.env;
const adminsArray = ADMINS?.split(",");

export const seedAdmins = async () => {
  if (!adminsArray) {
    console.info("No admins to seed.");
    return;
  }

  const adminsCreated: {
    [key: string]: string;
  } = {};

  for (const admin of adminsArray) {
    const username = admin;
    const existingAdmin = await getAdminByUsername(username);

    if (existingAdmin) {
      console.info(`Admin ${username} already exists. Skipping.`);
      continue;
    }

    const generatedPassword = generateRandomPassword();

    const result = await createAdmin({
      username,
      password: generatedPassword,
      role: "superadmin",
    });

    if (result) {
      console.log(`Admin ${username} created.`);
      adminsCreated[username] = generatedPassword;
    } else {
      console.log(`Admin ${username} could not be created.`);
    }
  }

  const currentSecrets = readFileSync("./.secrets.json", "utf-8").toString();
  const parsedSecrets = JSON.parse(currentSecrets);

  const newSecrets = {
    ...parsedSecrets,
    ...adminsCreated,
  };

  writeFileSync(
    "./.secrets.json",
    format(JSON.stringify({ ...newSecrets }, null, 2), {
      parser: "json",
    })
  );
};
