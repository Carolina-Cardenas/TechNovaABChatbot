import "./App.css";
import { useRef, useState } from "react";
import { useAskQuestion } from "./hooks/useAskQuestion";
import Message from "./components/Message";
import Loading from "./components/Loading";



function App() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hej! Jag är TechNova kundtjänstbot. Vad vill du veta om våra produkter, leveranser eller garantier?",
    },

  ]),
  
  // Desplaza el scroll al último mensaje automáticamente
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }