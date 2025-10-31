import { createClient } from "@supabase/supabase-js";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OllamaEmbeddings } from "@langchain/ollama";

import dotenv from "dotenv";
dotenv.config();

export const createRetriever = async () => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    throw new Error("Supabase environment variables are missing");
  }

  console.log(" Conectando a Supabase:", process.env.SUPABASE_URL);

  const client = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
  console.log(1);
  try {
    const { data, error } = await client
      .from("documents")
      .select("id, content")
      .limit(1);

    console.log(data);
    if (error) {
      console.error(" Error calling Supabase:", error.message);
    } else {
      console.log("Supabase responds correctly. Example of document:", data);
    }
  } catch (err) {
    console.error(" General error connecting with Supabase:", err.message);
  }

  const embeddings = new OllamaEmbeddings({
    model: "nomic-embed-text",
    baseUrl: process.env.OLLAMA_HOST || "http://localhost:11434",
  });

  const vectorStore = new SupabaseVectorStore(embeddings, {
    client,
    tableName: "documents",
    queryName: "match_documents",
  });

  const retriever = vectorStore.asRetriever();

  return vectorStore.asRetriever();
};

if (import.meta.url === `file://${process.argv[1]}`) {
  createRetriever()
    .then(() => {
      console.log("Test connected to db.");
    })
    .catch((err) => {
      console.error(" Error when executing createRetriever:", err.message);
    });
}
