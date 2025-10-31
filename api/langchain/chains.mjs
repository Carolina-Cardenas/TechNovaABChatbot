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

const llm = new ChatOllama({
  baseUrl: "http://localhost:11434",
  model: "llama2:7b",
  temperature: 0.4,
});

function combineDocuments(docs) {
  if (!Array.isArray(docs)) return "";
  return docs.map((d) => d.pageContent || d.content || "").join("\n\n");
}

const standaloneQuestionChain = RunnableSequence.from([
  standaloneQuestionTemplate,
  llm,
  new StringOutputParser(),
]);

const retrieveDocumentsChain = new RunnableLambda({
  func: async (data) => {
    const retriever = await createRetriever();
    const question = data?.standaloneQuestion || data;
    const docs = await retriever._getRelevantDocuments(question);
    const combinedContext = combineDocuments(docs);
    return combinedContext;
  },
});

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

  return new RunnableLambda({
    func: async ({ context, question }) => {
      const fullContext = historyContext + context;
      const response = await answerChain.invoke({
        context: fullContext,
        question,
      });
      return response;
    },
  });
}

export const qaChain = RunnableSequence.from([
  {
    standaloneQuestion: standaloneQuestionChain,
    originalQuestion: new RunnablePassthrough(),
  },
  {
    context: retrieveDocumentsChain,
    question: ({ originalQuestion }) =>
      typeof originalQuestion === "string"
        ? originalQuestion
        : originalQuestion?.question ?? "",
  },
  answerChain,
]);
