"use client"

import { useState } from "react"
import ChatBot from "./components/ChatBot"
import HomePage from "./components/HomePage"

function App() {
  const [currentPage, setCurrentPage] = useState<"home" | "chatbot">("home")

  if (currentPage === "chatbot") {
    return <ChatBot />
  }

  return <HomePage onNavigateToChatbot={() => setCurrentPage("chatbot")} />
}

export default App
