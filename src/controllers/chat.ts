import { NextFunction, Request, Response } from "express";
import { chat, ingest } from "../utils/chat.js";
import ErrorHandler from "../utils/errorHandler.js";

export const ingestUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { url } = req.body;
    if (!url) next(new ErrorHandler("URL is required", 400));

    await ingest(url);

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
    if (!question) next(new ErrorHandler("Question is required", 400));
    const answer = await chat(question);

    res.status(200).json({ success: true, answer });
  } catch (error) {
    next(error);
  }
};
