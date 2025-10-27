import { qaChain } from "../langchain/chains.mjs";

/**
 * Controlador principal del chatbot.
 * Recibe la pregunta del cliente y devuelve la respuesta del modelo.
 */
export async function handleAskQuestion(req, res) {
  try {
    const { question } = req.body;
    const answer = await qaChain(question);
    res.json(answer);
  } catch (error) {
    console.error("Error al procesar pregunta:", error);
    res.status(500).json({ error: "Fel vid bearbetning av frågan." });
  }
}
