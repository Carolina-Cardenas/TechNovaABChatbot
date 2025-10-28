import { useState } from "react";

export default function ChatInput({ onSend }) {
  const [input, setInput] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  }

  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Skriv din fråga..."
      />
      <button type="submit">Skicka</button>
    </form>
  );
}
