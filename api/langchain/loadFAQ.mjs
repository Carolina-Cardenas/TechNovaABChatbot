import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { OpenAIEmbeddings } from "@langchain/openai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import dotenv from "dotenv";

dotenv.config();

const filePath = path.resolve("./data/FAQ.txt");

// 1. Leer el archivo local
const text = fs.readFileSync(filePath, "utf8");

// 2. Dividirlo en fragmentos pequeños
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 800,
  chunkOverlap: 100,
});
const docs = await splitter.createDocuments([text]);

// 3. Conectar con Supabase
const client = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// 4. Crear embeddings y guardarlos
const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
});

const vectorStore = new SupabaseVectorStore(embeddings, {
  client,
  tableName: "documents",
});

await vectorStore.addDocuments(docs);

console.log(" FAQ & Policy dokument har lagts till i databasen!");
process.exit(0);
