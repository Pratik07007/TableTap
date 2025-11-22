import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import authRouter from "./routes/authRouter";
import { resturantRouter } from "./routes/resturantRouter";
import menuItemRouter from "./routes/menuItemRouter";
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || 8080;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser());

app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/resturant", resturantRouter);
app.use("/api/menu-items", menuItemRouter);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
