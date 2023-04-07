import Express from "express";
import { config } from "dotenv";
import NLURouter from "./routes/nlu";
import ChatRouter from "./routes/chat";
import TrainingRouter from "./routes/training";
import AuthRouter from "./routes/auth";
import { train } from "./nlu/index";
import { logIP } from "./middleware/analysis";
import {
  checkAPIKey,
  checkIsAdmin,
  checkIsAdminAndShowLoginIfNot,
} from "./middleware/auth";
import path from "path";
import "reflect-metadata";
import { initializeDatabase } from "./database";
import { initGPT } from "./utils/gpt4all";

config();
train();
initializeDatabase();
initGPT(false);

const app = Express();

app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));

app.use(logIP);

app.use("/nlu", NLURouter);
app.use("/chat", ChatRouter);
app.use("/training", TrainingRouter);
app.use("/auth", AuthRouter);

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "auth", "login.html"));
});

if (process.env.ALLOW_TRAINING_UI === "true") {
  console.info("Training mode enabled");
  app.get("/build/bundle.js", (req, res) => {
    res.sendFile(
      path.join(__dirname, "public", "training", "build", "bundle.js")
    );
  });
  app.use("/", Express.static(path.join(__dirname, "public", "training")));
  app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "training", "index.html"));
  });
}

app.listen(process.env.PORT || 3000, () => {
  console.info(`Server is running on port ${process.env.PORT}`);
});
