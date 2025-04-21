import { config } from "dotenv";
import express, { Request, Response } from "express";
import { errorMiddleware } from "./middlewares/error.js";
import chatRoutes from "./routes/chat.js";

config({
  path: "./.env",
});

// Ensure CORS is configured to allow frontend communication

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

app.use("/api/v1/ai", chatRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the backend! Where we make the internet tick!");
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
