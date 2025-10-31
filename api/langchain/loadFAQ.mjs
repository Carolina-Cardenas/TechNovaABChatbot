import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { OllamaEmbeddings } from "@langchain/ollama";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

dotenv.config();

async function run() {
  const filePath = path.resolve("./data/FAQ.txt");
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  // 1. Leer el archivo local
  const text = fs.readFileSync(filePath, "utf8");

  // 2. Dividirlo en fragmentos pequeños
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 800,
    chunkOverlap: 120,
  });
  const docs = await splitter.createDocuments([text]);
  console.log(process.env.SUPABASE_URL);
  // 3. Conectar con Supabase
  const client = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  // 4. Crear embeddings y guardarlos
  const embeddings = new OllamaEmbeddings({
    model: "nomic-embed-text",
    baseUrl: process.env.OLLAMA_HOST || "http://localhost:11434",
  });

  const vectorStore = new SupabaseVectorStore(embeddings, {
    client,
    tableName: "documents",
  });

  await vectorStore.addDocuments(docs);

  console.log(" FAQ & Policy dokument har lagts till i databasen!");
}

run().catch((e) => {
  console.error("Fel vid inläsning av FAQ & Policy dokument:", e);
  process.exit(1);
});
