import express from "express";
import { createRetriever } from "../langchain/setupRetriever.mjs";
import { createQAChain } from "../langchain/chains.mjs";
import { logInteraction } from "../utils/logger.mjs";
import { handleError } from "../utils/errorHandler.mjs";

const router = express.Router();
var contextHistory = [];

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

    console.log("Documentos recuperados:", relevantDocs.length);
    if (relevantDocs.length === 0) {
      console.warn(" No se encontraron documentos en Supabase.");
    }

    const context = relevantDocs.map((d) => d.pageContent).join("\n---\n");

    const qaChain = createQAChain(contextHistory);
    const response = await qaChain.invoke({ context, question });
    const answer =
      typeof response === "string"
        ? response
        : response?.content || "Jag kunde inte hitta ett svar.";

    contextHistory.push(`Fråga: ${question}\nSvar: ${answer}`);
    logInteraction(question, answer);

    res.json({ answer });
  } catch (error) {
    console.error(" Error completo en /api/chat:");
    console.error(error);
    res.status(500).json({
      error: error.message,
      stack: error.stack,
    });
  }
});
export default router;
