export default function Message({ sender, text }) {
  const isUser = sender === "user";

  return (
    <div className={`message ${isUser ? "user-message" : "bot-message"}`}>
      <div className="bubble">{text}</div>
    </div>
  );
}
