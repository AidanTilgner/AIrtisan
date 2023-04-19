import {
  createOrganization,
  getOrganizationByName,
} from "../functions/organization";
import { config } from "dotenv";

config();

const { DEFAULT_ORGANIZATION_NAME, DEFAULT_ORGANIZATION_DESCRIPTION } =
  process.env;

export const seedOrganization = async () => {
  if (!DEFAULT_ORGANIZATION_NAME || !DEFAULT_ORGANIZATION_DESCRIPTION) {
    console.info("No organization to seed.");
    return;
  }

  const existingOrganization = await getOrganizationByName(
    DEFAULT_ORGANIZATION_NAME
  );

  if (existingOrganization) {
    console.info(
      `Organization ${DEFAULT_ORGANIZATION_NAME} already exists. Skipping.`
    );
    return;
  }

  const result = await createOrganization({
    name: DEFAULT_ORGANIZATION_NAME,
    description: DEFAULT_ORGANIZATION_DESCRIPTION,
  });

  if (result) {
    console.info(`Organization ${DEFAULT_ORGANIZATION_NAME} created.`);
  } else {
    console.info(
      `Organization ${DEFAULT_ORGANIZATION_NAME} could not be created.`
    );
  }
};
