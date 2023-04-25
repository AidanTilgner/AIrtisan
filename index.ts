import Express from "express";
import { config } from "dotenv";
import ApiRouter from "./routes/api";
import path from "path";
import "reflect-metadata";
import { initializeDatabase } from "./database";
import { initGPT } from "./utils/gpt4all";
import cors from "cors";

config();
initializeDatabase();
initGPT(false);

const app = Express();

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS as string;

app.use(
  cors({
    origin: ALLOWED_ORIGINS.split(","),
    credentials: true,
  }),
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", ALLOWED_ORIGINS);
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  }
);

app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));

app.use("/api", ApiRouter);

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "auth", "login.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "auth", "signup.html"));
});

app.get("/favicon", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "favicon.svg"));
});

if (process.env.ALLOW_TRAINING_UI === "true") {
  console.info("Training mode enabled");
  app.use(
    "/documentation",
    Express.static(path.join(__dirname, "public", "documentation"))
  );

  app.get("/build/bundle.js", (req, res) => {
    res.sendFile(
      path.join(__dirname, "public", "training", "build", "bundle.js")
    );
  });
  app.get("/build/bundle.js.map", (req, res) => {
    res.sendFile(
      path.join(__dirname, "public", "training", "build", "bundle.js.map")
    );
  });
  app.get("/build/bundle.css", (req, res) => {
    res.sendFile(
      path.join(__dirname, "public", "training", "build", "bundle.css")
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
