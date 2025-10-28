import "./App.css";
import { useRef, useState } from "react";
import { useAskQuestion } from "./hooks/useAskQuestion";
import Message from "./components/Message";
import Loading from "./components/Loading";

/**
 * Componente principal del chatbot de TechNova AB.
 * - Usa LangChain (vía useAskQuestion) para consultar respuestas.
 * - Muestra mensajes del usuario y del bot.
 * - Implementa scroll automático hacia el último mensaje.
 */

function App() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hej! Jag är TechNova kundtjänstbot. Vad vill du veta om våra produkter, leveranser eller garantier?",
    },
  ]);

  const [input, setInput] = useState("");
  const { askQuestion, loading } = useAskQuestion();
  const messagesEndRef = useRef(null);

  // Desplaza el scroll al último mensaje automáticamente
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Se ejecuta cuando el usuario envía una pregunta
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await askQuestion(input);
      const botMessage = { sender: "bot", text: response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        sender: "bot",
        text: "Tyvärr uppstod ett fel när jag försökte hämta svaret.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      scrollToBottom();
    }
  };

  return (
    <div className="app-container">
      <h1 className="title">TechNova AB Kundtjänstbot</h1>

      <div className="chat-box">
        {messages.map((msg, index) => (
          <Message key={index} sender={msg.sender} text={msg.text} />
        ))}
        {loading && <Loading />}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Skriv din fråga här..."
        />
        <button type="submit" disabled={loading}>
          Skicka
        </button>
      </form>
    </div>
  );
}

export default App;
