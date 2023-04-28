import { seedOrganization } from "./organization";
import { seedBots } from "./bot";
import { seedAdmins } from "./admin";

export const seedDatabase = async () => {
  await seedAdmins();
  await seedOrganization();
  await seedBots();
};
