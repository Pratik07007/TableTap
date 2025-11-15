import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import authRouter from "./routes/authRouter";
dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || 8080;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/auth", authRouter);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
