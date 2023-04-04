import { DataSource } from "typeorm";
import { Conversation } from "./models/conversation";
import { Chat } from "./models/chat";

export const entities = {
  Conversation,
  Chat,
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
  return dataSource;
};
