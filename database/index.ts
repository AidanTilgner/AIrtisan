import { DataSource } from "typeorm";
import "reflect-metadata";
import { Conversation } from "./models/conversation";
import { Chat } from "./models/chat";
import { Admin } from "./models/admin";
import { Token } from "./models/token";
import { ApiKey } from "./models/apiKey";
import { seedDatabase } from "./seeders";

export const entities = {
  Conversation,
  Chat,
  Admin,
  Token,
  ApiKey,
};

export const dataSource = new DataSource({
  type: "sqlite",
  database: "datastore/database.sqlite",
  synchronize: true,
  entities: Object.values(entities),
});

export const initializeDatabase = async () => {
  await dataSource.initialize();
  console.info("Database initialized");
  await seedDatabase();
  console.info("Database seeded");
  return dataSource;
};
