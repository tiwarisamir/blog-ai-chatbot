import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import axios, { AxiosResponse } from "axios";
import * as cheerio from "cheerio";
import { AI_API_KEY } from "./config.js";
import ErrorHandler from "./errorHandler.js";
import { formatAiTextToMarkdown } from "./helper.js";
import { insertInDB, retrieveByEmbedding } from "./qdrantDB.js";
import { ScrapeResult } from "../types/types.js";

export const ai = new GoogleGenAI({
  apiKey: AI_API_KEY!,
});

export async function scrape(url: string): Promise<ScrapeResult> {
  try {
    const response: AxiosResponse<string> = await axios.get<string>(url);
    const $ = cheerio.load(response.data);

    const head = $("head").html() ?? "";
    const sections: string[] = [];

    $("section").each((_, el) => {
      const html = $(el).html();
      if (html) sections.push(html);
    });

    return { head, sections };
  } catch (error) {
    throw new ErrorHandler("Failed to scrape the URL", 400);
  }
}

export const generateVectorEmbedding = async (
  text: string
): Promise<number[]> => {
  try {
    const response = await ai.models.embedContent({
      model: "gemini-embedding-exp-03-07",
      contents: text,
    });

    const embeddings = response.embeddings ?? [];

    if (!embeddings || embeddings.length === 0 || !embeddings[0]?.values) {
      throw new ErrorHandler("Failed to generate embedding", 400);
    }

    const res = embeddings ? embeddings[0]?.values : [];

    return res;
  } catch (error) {
    throw new ErrorHandler("Failed to generate vector embedding", 400);
  }
};

export const ingest = async (url: string): Promise<void> => {
  try {
    const { head, sections } = await scrape(url);

    if (!sections || !head) {
      throw new ErrorHandler("Failed to ingest the url", 400);
    }

    for (const section of sections) {
      const embedding = await generateVectorEmbedding(section);
      await insertInDB(embedding, url, section, head);
    }
  } catch (error) {
    throw new ErrorHandler("Failed to ingest URL", 400);
  }
};

export const chat = async (question: string = ""): Promise<string> => {
  try {
    const questionEmbedding = await generateVectorEmbedding(question);
    const contextBodies: string[] = await retrieveByEmbedding(
      questionEmbedding
    );

    const prompt = `
      Context:
      ${contextBodies.join("\n\n")}
        User Question: ${question}
        Answer:
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction: `
            You are a helpful assistant for a website that answers user questions based on provided context. The context will be given in HTML format.
      Always answer clearly, politely, and in a human-like tone — as if you're assisting a real person in conversation.
      Only use information present in the provided context. If the context does not answer the user's question, politely inform them that the information isn't available. Do not guess, assume, or make up any information.
      When referring to links, look for URLs inside <a> tags in the context.
      If the link is relative (starting with /), automatically prepend https://www.samirt.com.np to form a full valid link.
      If the link is already a full URL (starting with http), use it as-is.
      You may provide the link if it seems helpful, or if the user specifically asks for a source.
      Keep your responses concise, but complete enough to be genuinely helpful and informative.
      Always maintain a friendly, respectful, and professional tone when replying.
            `,
      },
    });

    return formatAiTextToMarkdown(response.text ?? "");
  } catch (error) {
    throw new ErrorHandler("Failed to generate response", 400);
  }
};
