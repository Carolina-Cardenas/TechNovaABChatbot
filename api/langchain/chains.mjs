// api/langchain/chainFactory.mjs
import { RunnableSequence, RunnableMap } from "@langchain/core/runnables";
import { customerServicePrompt } from "./promptTemplate.mjs";
import { createChatModel } from "./model.mjs";

/**
 * Construye la cadena principal de LangChain para TechNova AB.
 * Incluye control de flujo y persistencia temporal del contexto.
 */
export const createQAChain = (contextHistory = []) => {
  const model = createChatModel();

  // Subflujo: mezcla contexto previo y nuevo contexto de documentos
  const contextualizer = RunnableMap.fromRecord({
    fullContext: async (input) =>
      [...contextHistory, input.context].join("\n---\n"),
    question: (input) => input.question,
  });

  // Secuencia completa
  const chain = RunnableSequence.from([
    contextualizer,
    customerServicePrompt,
    model,
  ]);

  return chain;
};
