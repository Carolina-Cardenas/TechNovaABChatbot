import {
  RunnableSequence,
  RunnablePassthrough,
  RunnableLambda,
} from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatOllama } from "@langchain/ollama";
import { createRetriever } from "../langchain/setupRetriever.mjs";
import {
  standaloneQuestionTemplate,
  customerServicePrompt,
} from "./promptTemplates.mjs";

/**
 * Construye la cadena de razonamiento del chatbot:
 * 1. Reformula la pregunta del usuario (standalone question)
 * 2. Recupera documentos relevantes del vector store
 * 3. Genera una respuesta final contextual
 */

/**
 * Instancia del modelo Llama3 vía Ollama
 * Se recomienda mantener el modelo aquí directamente
 * para simplicidad en entornos educativos.
 */
const llm = new ChatOllama({
  model: "llama3.1:8b",
  temperature: 0.4,
});

/**
 * Combina múltiples documentos en un solo string
 * @param {Array} docs - Lista de documentos del retriever
 * @returns {string} texto combinado
 */
function combineDocuments(docs) {
  if (!Array.isArray(docs)) return "";
  return docs.map((d) => d.pageContent || d.content || "").join("\n\n");
}
/**
 * Cadena 1: Reformulación de la pregunta
 */
const standaloneQuestionChain = RunnableSequence.from([
  standaloneQuestionTemplate,
  llm,
  new StringOutputParser(),
]);

/**
 * Cadena 2: Recuperación de documentos relevantes
 */
const retrieveDocumentsChain = RunnableLambda.from([
  async (data) => {
    console.log("[chains] retrieveDocumentsChain input:", data);
    const retriever = await createRetriever();
    const docs = await retriever.similaritySearch(
      (data && data.standaloneQuestion) || data,
      3
    );
    console.log(
      "[chains] retrieved docs count:",
      Array.isArray(docs) ? docs.length : 0
    );
    return combineDocuments(docs);
  },
]);

/**
 * Cadena 3: Generación de la respuesta final
 */
const answerChain = RunnableSequence.from([
  customerServicePrompt,
  llm,
  new StringOutputParser(),
]);

export function createQAChain(contextHistory = []) {
  const historyContext =
    contextHistory.length > 0
      ? `${contextHistory.slice(-3).join("\n---\n")}\n`
      : "";

  return RunnableLambda.from([
    async ({ context, question }) => {
      const fullContext = historyContext + context;
      const response = await answerChain.invoke({
        context: fullContext,
        question,
      });
      return response;
    },
  ]);
}

/**
 * Cadena principal (QA Chain)
 * Estructura:
 * Paso 1: Reformula pregunta
 * Paso 2: Recupera contexto
 * Paso 3: Genera respuesta final
 */
export const qaChain = RunnableSequence.from([
  {
    standaloneQuestion: standaloneQuestionChain,
    originalQuestion: new RunnablePassthrough(),
  },
  {
    context: retrieveDocumentsChain,
    question: ({ originalQuestion }) => {
      if (!originalQuestion) return "";
      if (typeof originalQuestion === "string") return originalQuestion;
      return originalQuestion.question ?? "";
    },
  },
  answerChain,
]);
