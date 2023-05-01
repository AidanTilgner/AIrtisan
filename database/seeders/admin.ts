import {
  addAdminToOrganization,
  createAdmin,
  getAdminByUsername,
} from "../functions/admin";
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
    const [username, display_name, organization = null] = admin.split(":");
    if (!username || !display_name) {
      console.info(`Admin ${admin} is not valid. Skipping.`);
      continue;
    }

    const existingAdmin = await getAdminByUsername(username);

    if (existingAdmin) {
      console.info(`Admin ${username} already exists. Skipping.`);
      continue;
    }

    const generatedPassword = generateRandomPassword();

    const result = await createAdmin({
      username,
      display_name,
      password: generatedPassword,
      role: "superadmin",
    });

    if (!result) {
      console.error(`Admin ${username} could not be created.`);
      continue;
    }

    if (result) {
      console.info(`Admin ${username} created.`);
      adminsCreated[username] = generatedPassword;
    } else {
      console.error(`Admin ${username} could not be created.`);
    }
    if (organization) {
      const parsedOrganization = Number(organization);
      if (!parsedOrganization) {
        console.error(`Organization ${organization} is not valid.`);
      }
      const added = await addAdminToOrganization(result.id, parsedOrganization);

      if (!added) {
        console.error(`Admin ${username} could not be added to organization.`);
      } else {
        console.info(`Admin ${username} added to organization.`);
      }
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
