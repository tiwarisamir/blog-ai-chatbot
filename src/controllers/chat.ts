import { NextFunction, Request, Response } from "express";
import { chat, generateVectorEmbedding, ingest } from "../utils/chat.js";
import ErrorHandler from "../utils/errorHandler.js";
import { pdfToPageChunks } from "../utils/helper.js";
import { insertInDB } from "../utils/qdrantDB.js";

export const ingestUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { url } = req.body;
    if (!url) return next(new ErrorHandler("URL is required", 400));

    await ingest(url);

    res.status(200).json({ success: true, message: "Ingestion successful!" });
  } catch (error) {
    next(error);
  }
};
export const ingestPdf = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) return next(new ErrorHandler("Pdf is required", 400));

    const pageBuffer = req.file.buffer;

    const chunks = await pdfToPageChunks(pageBuffer);

    for (const chunk of chunks) {
      const embedding = await generateVectorEmbedding(chunk);

      await insertInDB(embedding, "cv.pdf", chunk, "");
    }

    res.status(200).json({ success: true, message: "Ingestion successful!" });
  } catch (error) {
    next(error);
  }
};

export const chatWithAi = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { question } = req.body;
    if (!question) return next(new ErrorHandler("Question is required", 400));
    const answer = await chat(question);

    res.status(200).json({ success: true, answer });
  } catch (error) {
    next(error);
  }
};
