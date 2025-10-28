import { chain } from "../langchain/chains.mjs";

/**
 * Controlador principal del chatbot.
 * Recibe la pregunta del cliente y devuelve la respuesta del modelo.
 */
export async function handleAskQuestion(req, res) {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: "Question missing" });

    // invoke the LangChain runnable
    const response = await chain.invoke({ question });

    // chain.invoke may return parser object; normalize to string
    const answer =
      response?.content ?? (typeof response === "string" ? response : null);

    return res.json({ answer });
  } catch (error) {
    console.error("Error processing question:", error);
    return res.status(500).json({ error: "Fel vid bearbetning av frågan." });
  }
}
