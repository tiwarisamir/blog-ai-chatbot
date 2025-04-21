import express from "express";
import { chatWithAi, ingestPdf, ingestUrl } from "../controllers/chat.js";
import { uploadMiddleware } from "../middlewares/uploadMiddleware.js";

const app = express.Router();

app.post("/ingest", ingestUrl);
app.post("/ingest/pdf", uploadMiddleware.single("pdf"), ingestPdf);
app.post("/chat", chatWithAi);

export default app;
