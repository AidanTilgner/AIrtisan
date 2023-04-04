import Express from "express";
import { config } from "dotenv";
import NLURouter from "./routes/nlu";
import ChatRouter from "./routes/chat";
import TrainingRouter from "./routes/training";
import { train } from "./nlu/index";
import { logIP } from "./middleware/analysis";
import { checkAPIKey } from "./middleware/auth";
import path from "path";
import "reflect-metadata";
import { initializeDatabase } from "./database";

config();
train();
initializeDatabase();

const app = Express();

app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));

app.use(Express.static(path.join(__dirname, "public", "default")));
if (process.env.NODE_ENV === "development") {
  console.log("Training mode enabled");
  app.use("/train", Express.static(path.join(__dirname, "public", "training")));
}

app.use(logIP);
app.use(checkAPIKey);

app.get("/", (req, res) => {
  res.send({
    message: "Use the /nlu or /chat endpoints to interact",
  });
});

app.use("/nlu", NLURouter);
app.use("/chat", ChatRouter);
app.use("/training", TrainingRouter);

app.listen(process.env.PORT || 3000, () => {
  console.info(`Server is running on port ${process.env.PORT}`);
});
