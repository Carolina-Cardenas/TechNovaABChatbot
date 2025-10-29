import express from "express";
import { createRetriever } from "../langchain/setupRetriever.mjs";
import { createQAChain } from "../langchain/chains.mjs";
import { logInteraction } from "../utils/logger.mjs";
import { handleError } from "../utils/errorHandler.mjs";

const router = express.Router();

// Historial temporal en memoria
let contextHistory = [];

/**
 * POST /api/chat
 * Cuerpo esperado: { question: string }
 */
router.post("/", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: "Fråga saknas." });

    const retriever = await createRetriever();
    const relevantDocs = await retriever.similaritySearch(question, 3);
    const context = relevantDocs.map((d) => d.pageContent).join("\n---\n");

    const qaChain = createQAChain(contextHistory);
    const response = await qaChain.invoke({ context, question });

    const answer = response?.content || "Jag kunde inte hitta ett svar.";
    contextHistory.push(`Fråga: ${question}\nSvar: ${answer}`);

    logInteraction(question, answer);

    res.json({ answer });
  } catch (error) {
    handleError(res, error, "Ett fel uppstod vid bearbetning av frågan.");
  }
});

export default router;
