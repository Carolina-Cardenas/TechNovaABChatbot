import { faqPrompt } from "./promptTemplates.mjs";
import { retriever } from "../service/setupRetriever.mjs";
import { Ollama } from "@langchain/community/llms/ollama";
import { RunnableSequence } from "@langchain/core/runnables";

const model = new Ollama({ model: "llama3.1:8b" });

/**
 * Cadena QA: busca contexto y genera respuesta contextualizada.
 */
const chain = RunnableSequence.from([
  {
    input: (input) => retriever.getRelevantDocuments(input),
    transform: (docs) => ({
      context: docs.map((d) => d.pageContent).join("\n\n"),
    }),
  },
  faqPrompt,
  model,
]);

export async function qaChain(question) {
  const result = await chain.invoke({ question });
  return { answer: result };
}
