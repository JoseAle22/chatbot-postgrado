"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User, Loader2 } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arriv
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput("")
    setIsLoading(true)

    try {
      // Usar un proxy CORS gratuito para desarrollo
      const response = await fetch(
        "https://api.allorigins.win/raw?url=" + encodeURIComponent("https://api.openai.com/v1/chat/completions"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: "https://api.openai.com/v1/chat/completions",
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: "gpt-3.5-turbo",
              messages: [
                {
                  role: "system",
                  content: "Eres un asistente útil y amigable. Responde de manera clara y concisa en español.",
                },
                ...messages.map((msg) => ({ role: msg.role, content: msg.content })),
                { role: "user", content: currentInput },
              ],
              max_tokens: 500,
              temperature: 0.7,
            }),
          }),
        },
      )

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.choices[0].message.content,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error:", error)

      // Simulación de respuesta para desarrollo
      const simulatedResponses = [
        "¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?",
        "Entiendo tu pregunta. Déjame ayudarte con eso.",
        "Esa es una excelente pregunta. Te explico:",
        "Por supuesto, puedo ayudarte con eso.",
        "Gracias por tu mensaje. Aquí tienes mi respuesta:",
      ]

      const simulatedMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          simulatedResponses[Math.floor(Math.random() * simulatedResponses.length)] +
          " (Nota: Esta es una respuesta simulada para desarrollo. Configura tu API key de OpenAI para respuestas reales.)",
      }
      setMessages((prev) => [...prev, simulatedMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="ujap-gradient flex items-center justify-center min-h-screen p-4">
      <Card className="ujap-card w-full max-w-4xl h-[80vh] flex flex-col">
        <CardHeader className="ujap-header border-b backdrop-blur-sm">
          <CardTitle className="flex items-center gap-2 text-xl text-white">
            <Bot className="h-6 w-6 text-white" />
            Chatbot UJAP - Postgrado
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                  <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">¡Hola! Soy tu asistente virtual</p>
                  <p className="text-sm">Escribe un mensaje para comenzar la conversación</p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user" 
                      ? "user-message-ujap ml-auto" 
                      : "bot-message-ujap"
                  }`}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === "user" ? "bg-blue-600 text-white ml-auto" : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>

                  {message.role === "user" && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-gray-100 text-gray-600">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Escribiendo...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="border-t bg-white/50 backdrop-blur-sm p-4">
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              className="flex-1 ujap-input"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()} 
              className="ujap-button-primary"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
