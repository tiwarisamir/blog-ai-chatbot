import ErrorHandler from "./errorHandler.js";
import { extractText, getDocumentProxy } from "unpdf";

export const formatAiTextToMarkdown = (input: string): string => {
  let formatted = input.replace(
    /(https?:\/\/[^\s]+)/g,
    (url) => `[${url}](${url})`
  );

  formatted = formatted.replace(/^\s*\*\s+/gm, "- ");

  formatted = formatted.replace(/\n{3,}/g, "\n\n");

  return formatted.trim();
};

export const pdfToPageChunks = async (pdfBuffer: Buffer): Promise<string[]> => {
  try {
    const pdf = await getDocumentProxy(new Uint8Array(pdfBuffer));

    const { text } = await extractText(pdf, { mergePages: false });

    if (Array.isArray(text)) {
      return text;
    } else {
      return [text];
    }
  } catch (error) {
    throw new ErrorHandler("Failed to parse PDF", 500);
  }
};
