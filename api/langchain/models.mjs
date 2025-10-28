import { ChatOllama } from "@langchain/community/chat_models/ollama";

export const llm = new ChatOllama({
  model: "llama3.1:8b",
  temperature: 0.4,
});
