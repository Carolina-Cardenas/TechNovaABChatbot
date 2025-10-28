import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { ChatOpenAI } from "@langchain/openai";
import { RunnableSequence } from "@langchain/core/runnables";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";

/**
 * Hook personalizado para enviar preguntas al modelo de IA.
 * Integra Supabase + LangChain + OpenAI para ofrecer respuestas contextuales.
 */

export const useAskQuestion = () => {
  const [loading, setLoading] = useState(false);

  // Configuración segura: tus claves deben estar en variables de entorno
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const openAIApiKey = import.meta.env.VITE_OPENAI_API_KEY;

  // Crear cliente Supabase
  const client = createClient(supabaseUrl, supabaseKey);

  // Crear embeddings para búsquedas semánticas
  const embeddings = new OpenAIEmbeddings({
    apiKey: openAIApiKey,
  });

  // Conectar a la tabla/vector store en Supabase
  const vectorStore = new SupabaseVectorStore(embeddings, {
    client,
    tableName: "documents",
    queryName: "match_documents",
  });

  /**
   * Envía una pregunta al modelo y devuelve la respuesta.
   * @param {string} question - Texto que escribe el usuario
   * @returns {Promise<string>} - Respuesta generada por el modelo
   */
  const askQuestion = async (question) => {
    setLoading(true);

    try {
      // 1. Buscar contexto relevante en Supabase
      const relevantDocs = await vectorStore.similaritySearch(question, 3);

      const context = relevantDocs
        .map((doc) => doc.pageContent)
        .join("\n----------------\n");

      // 2. Crear el prompt para LangChain
      const prompt = ChatPromptTemplate.fromTemplate(`
Du är en vänlig kundtjänstrepresentant för TechNova AB.
Använd den här kontexten för att svara så exakt som möjligt:
{context}

Fråga: {question}
Svar (på svenska, informativt och kortfattat):
      `);

      // 3. Crear el modelo conversacional
      const model = new ChatOpenAI({
        apiKey: openAIApiKey,
        modelName: "gpt-4o-mini",
        temperature: 0.4,
      });

      // 4. Definir el flujo de ejecución
      const chain = RunnableSequence.from([
        {
          context: async (input) => context,
          question: (input) => input.question,
        },
        prompt,
        model,
      ]);

      // 5. Ejecutar el flujo
      const response = await chain.invoke({ question });
      return response?.content || "Jag kunde tyvärr inte hitta något svar.";
    } catch (error) {
      console.error("Error en useAskQuestion:", error);
      return "Ett fel uppstod när jag försökte hämta svaret.";
    } finally {
      setLoading(false);
    }
  };

  return { askQuestion, loading };
};
