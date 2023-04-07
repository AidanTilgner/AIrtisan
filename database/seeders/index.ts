import { seedAdmins } from "./admin";

export const seedDatabase = async () => {
  await seedAdmins();
};
