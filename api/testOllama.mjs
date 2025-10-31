import { ChatOllama } from "@langchain/ollama";

const llm = new ChatOllama({
  baseUrl: "http://localhost:11434",
  model: "llama3.1:latest",
  temperature: 0.4,
});

const res = await llm.invoke("Hola, ¿cómo estás?");
console.log(res);
