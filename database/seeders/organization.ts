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
    const [name, description] = o.split(":");

    const existingOrganization = await getOrganizationByName(name);

    if (existingOrganization) {
      console.info(`Organization ${name} already exists. Skipping.`);
      return;
    }

    const result = await createOrganization({
      name,
      description,
    });

    if (result) {
      console.info(`Organization ${name} created.`);
    } else {
      console.info(`Organization ${name} could not be created.`);
    }
  });
};
