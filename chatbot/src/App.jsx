import "./App.css";
import { useRef, useState } from "react";
import { useAskQuestion } from "./hooks/useAskQuestion";
import Message from "./Components/Message";
import Loading from "./Components/Loading";

function App() {
  const [messages, setMessages] = useState([]); // historial del chat
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();

  const { askQuestion } = useAskQuestion();

  const handleSend = async () => {
    const question = inputRef.current.value.trim();
    if (!question) return;

    setMessages((prev) => [...prev, { sender: "user", text: question }]);
    setLoading(true);

    try {
      // Llamada al backend /api/chat
      const answer = await askQuestion(question);
      setMessages((prev) => [...prev, { sender: "bot", text: answer }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Tyvärr, jag kunde inte hämta något svar just nu.",
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current.value = "";
    }
  };

  return (
    <div className="chat-container">
      <h1 className="title">TechNova AB Kundtjänstbot</h1>

      <div className="chat-box">
        {messages.map((msg, index) => (
          <Message key={index} sender={msg.sender} text={msg.text} />
        ))}
        {loading && <Loading />}
      </div>

      <div className="input-container">
        <input
          type="text"
          ref={inputRef}
          placeholder="Skriv din fråga här..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Skicka</button>
      </div>
    </div>
  );
}

export default App;
