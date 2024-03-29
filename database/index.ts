import { DataSource } from "typeorm";
import "reflect-metadata";
import { Conversation } from "./models/conversation";
import { Chat } from "./models/chat";
import { Admin } from "./models/admin";
import { Token } from "./models/token";
import { ApiKey } from "./models/apiKey";
import { Bot } from "./models/bot";
import { Organization } from "./models/organization";
import { OrganizationInvitation } from "./models/invitation";
import { Feedback } from "./models/feedback";
import { Template } from "./models/template";
import { seedDatabase } from "./seeders";

export const entities = {
  Conversation,
  Chat,
  Admin,
  Token,
  ApiKey,
  Bot,
  Organization,
  OrganizationInvitation,
  Feedback,
  Template,
};

export const dataSource = new DataSource({
  type: "sqlite",
  database: "datastore/database.sqlite",
  synchronize: false,
  entities: Object.values(entities),
  migrations: ["database/migrations/*.ts"],
  migrationsTableName: "migrations",
});

export const initializeDatabase = async () => {
  await dataSource.initialize();
  console.info("Database initialized");
  await seedDatabase();
  console.info("Database seeded");
  return dataSource;
};
