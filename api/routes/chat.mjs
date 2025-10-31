import express from "express";
import { createRetriever } from "../langchain/setupRetriever.mjs";
import { createQAChain } from "../langchain/chains.mjs";
import { logInteraction } from "../utils/logger.mjs";
import { handleError } from "../utils/errorHandler.mjs";

const router = express.Router();
var contextHistory = [];

router.post("/", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: "Fråga saknas." });

    const retriever = await createRetriever();
    console.log("Retriever type:", retriever.constructor.name);
    console.log(
     "Retriever methods:"
      Object.getOwnPropertyNames(Object.getPrototypeOf(retriever))
    );

    const relevantDocs = await retriever._getRelevantDocuments(question);

    if (relevantDocs.length === 0) {
    }

    let context = relevantDocs.map((d) => d.pageContent).join("\n---\n");
    const MAX_CONTEXT_LENGTH = 2000;
    if (context.length > MAX_CONTEXT_LENGTH) {
      context =
        context.slice(0, MAX_CONTEXT_LENGTH) + "\n...(context truncated)...";
    }

    const qaChain = createQAChain(contextHistory);
    console.log(qaChain);
    let response;
    try {
      response = await qaChain.invoke({ context, question });
    } catch (error) {
      response = "Modellen svarade inte. Försök igen senare.";
    }

    const answer =
      typeof response === "string"
        ? response
        : response?.content || "Jag kunde inte hitta ett svar.";

    contextHistory.push(`Fråga: ${question}\nSvar: ${answer}`);
    logInteraction(question, answer);

    res.json({ answer });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack,
    });
  }
});
export default router;
