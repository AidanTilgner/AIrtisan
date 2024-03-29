import Express from "express";
import { config } from "dotenv";
import ApiRouter from "./routes/api";
import DataRouter from "./routes/data";
import path from "path";
import "reflect-metadata";
import { initializeDatabase } from "./database";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { initSocketIO } from "./utils/socketio";
import { startupBots } from "./nlu";
import { logPerformance } from "./middleware/analysis";

config();
initializeDatabase().then(() => {
  startupBots();
});

const app = Express();

const server = http.createServer(app);
const io = new Server(server);

const connection = initSocketIO(io);

app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  },
);

app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));

app.use(logPerformance);

app.get("/documentation", (req, res) => {
  res.redirect("https://docs.airtisan.app");
});

app.use("/api", ApiRouter);
app.use("/data", DataRouter);

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "auth", "login.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "auth", "signup.html"));
});

app.get("/favicon", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "favicon.svg"));
});

if (process.env.NODE_ENV === "development") {
  app.post("/esbuild-rebuilt", () => {
    connection.emit("esbuild-rebuilt");
  });
}

// app.use(
//   "/documentation",
//   Express.static(path.join(__dirname, "public", "documentation"))
// );

app.get("/help/support", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "help", "support.html"));
});

app.use("/help", Express.static(path.join(__dirname, "public", "help")));

app.get("/build/bundle.js", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "training", "build", "bundle.js"));
});
app.get("/build/bundle.js.map", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "training", "build", "bundle.js.map"));
});
app.get("/build/bundle.css", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "training", "build", "bundle.css"));
});

app.use("/", Express.static(path.join(__dirname, "public", "training")));
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "training", "index.html"));
});

server.listen(process.env.PORT || 3000, () => {
  console.info(`Server is running on port ${process.env.PORT}`);
});
