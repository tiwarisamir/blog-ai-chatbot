import express from "express";
import { chatWithAi, ingestUrl } from "../controllers/chat.js";

const app = express.Router();

app.post("/ingest", ingestUrl);
app.post("/chat", chatWithAi);

export default app;
