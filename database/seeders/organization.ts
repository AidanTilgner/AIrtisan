import { getAdminByUsername } from "../functions/admin";
import {
  createOrganization,
  getOrganizationByName,
} from "../functions/organization";
import { config } from "dotenv";

config();

const { ORGANIZATIONS } = process.env;

export const seedOrganization = async () => {
  if (!ORGANIZATIONS) {
    console.info("No organization to seed.");
    return;
  }

  const orgs = ORGANIZATIONS.split(",");

  orgs.forEach(async (o) => {
    const [name, description, owner_username] = o.split(":");

    const existingOrganization = await getOrganizationByName(name);

    if (existingOrganization) {
      console.info(`Organization ${name} already exists. Skipping.`);
      return;
    }

    const admin = await getAdminByUsername(owner_username);

    if (!admin) {
      console.info(`Admin ${owner_username} does not exist. Skipping.`);
      return;
    }

    const result = await createOrganization({
      name,
      description,
      owner_id: admin.id,
    });

    if (result) {
      console.info(`Organization ${name} created.`);
    } else {
      console.info(`Organization ${name} could not be created.`);
    }
  });
};
