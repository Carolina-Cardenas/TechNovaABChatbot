import { useState } from "react";

/**
 * Hook personalizado para enviar preguntas al backend.
 * Comunica React con el servidor Express (LangChain + Ollama).
 */
export const useAskQuestion = () => {
  const [loading, setLoading] = useState(false);

  /**
   * Envía una pregunta al backend y devuelve la respuesta.
   * @param {string} question - Texto que escribe el usuario
   * @returns {Promise<string>} - Respuesta generada por el modelo
   */
  const askQuestion = async (question) => {
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error("Fel vid hämtning av svar från servern.");
      }

      const data = await response.json();
      return data?.answer ?? "Jag kunde tyvärr inte hitta något svar.";
    } catch (error) {
      console.error("Error i useAskQuestion:", error);
      return "Ett fel uppstod när jag försökte hämta svaret.";
    } finally {
      setLoading(false);
    }
  };

  return { askQuestion, loading };
};
