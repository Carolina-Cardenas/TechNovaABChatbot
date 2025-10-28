/**
 * Construye la cadena de razonamiento del chatbot:
 * 1. Reformula la pregunta del usuario (standalone question)
 * 2. Recupera documentos relevantes del vector store
 * 3. Genera una respuesta final contextual
 */

import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatOllama } from "@langchain/community/chat_models/ollama";

import { createRetriever } from "../service/setupRetriever.mjs";
import {
  standaloneQuestionTemplate,
  answerTemplate,
} from "./promptTemplates.mjs";

/**
 * Instancia del modelo Llama3 vía Ollama
 * Se recomienda mantener el modelo aquí directamente
 * para simplicidad en entornos educativos.
 */
const llm = new ChatOllama({
  model: "llama3.1:8b",
  temperature: 0.3,
});

/**
 * Combina múltiples documentos en un solo string
 * @param {Array} docs - Lista de documentos del retriever
 * @returns {string} texto combinado
 */
function combineDocuments(docs) {
  return docs.map((doc) => doc.pageContent).join("\n\n");
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
const retrieveDocumentsChain = RunnableSequence.from([
  async (data) => {
    const retriever = await createRetriever();
    const docs = await retriever.similaritySearch(data.standaloneQuestion, 3);
    return combineDocuments(docs);
  },
]);

/**
 * Cadena 3: Generación de la respuesta final
 */
const answerChain = RunnableSequence.from([
  answerTemplate,
  llm,
  new StringOutputParser(),
]);

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
    question: ({ originalQuestion }) => originalQuestion.question,
  },
  answerChain,
]);
