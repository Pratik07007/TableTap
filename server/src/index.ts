import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || 8080;

app.get("/", (req, res) => {
  res.json({ message: "Hello World!" });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
