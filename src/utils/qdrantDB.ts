import { QdrantClient } from "@qdrant/js-client-rest";
import { v4 as uuidv4 } from "uuid";
import ErrorHandler from "./errorHandler.js";
import { QDRANT_KEY, QDRANT_URL } from "./config.js";

const qdrantClient = new QdrantClient({
  url: QDRANT_URL,
  apiKey: QDRANT_KEY,
  checkCompatibility: false,
});

const WEB_COLLECTION_NAME = "my_portfolio_web";
const VECTOR_SIZE = 3072;

export const insertInDB = async (
  embedding: number[],
  url: string,
  body: string = "",
  head: string = ""
): Promise<void> => {
  try {
    const { exists } = await qdrantClient.collectionExists(WEB_COLLECTION_NAME);
    if (!exists) {
      await qdrantClient.createCollection(WEB_COLLECTION_NAME, {
        vectors: {
          size: VECTOR_SIZE,
          distance: "Cosine",
        },
      });
    }

    await qdrantClient.upsert(WEB_COLLECTION_NAME, {
      wait: true,
      points: [
        {
          id: uuidv4(),
          vector: embedding,
          payload: { url, head, body },
        },
      ],
    });
  } catch (error) {
    throw new ErrorHandler("Failed to insert data into database", 500);
  }
};

export const retrieveByEmbedding = async (
  queryEmbedding: number[],
  k: number = 3
): Promise<string[]> => {
  try {
    const searchResult = await qdrantClient.search(WEB_COLLECTION_NAME, {
      vector: queryEmbedding,
      limit: k,
    });

    return searchResult.map((hit) => (hit.payload?.body as string) ?? "");
  } catch (error) {
    throw new ErrorHandler("Failed to retrieve data from database", 500);
  }
};
