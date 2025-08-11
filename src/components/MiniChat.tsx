"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User, Loader2, Maximize2, X } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  error?: boolean
}

interface MiniChatProps {
  onExpand: () => void
  onClose: () => void
}

export default function MiniChat({ onExpand, onClose }: MiniChatProps) {
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Define your API key here or use an environment variable for security
  const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
  
    const callGeminiAPI = async (contents: any): Promise<string> => {
      setIsLoading(true)
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                { role: "user", parts: [{ text: contents }] }
              ],
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 512,
              },
            }),
          },
        )
        if (!response.ok) {
          throw new Error(`Error ${response.status}`)
        }
        const data = await response.json()
        // Extract the assistant's reply from the API response
        const reply =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "No se pudo obtener respuesta."
        return reply
      } catch (error) {
        // Handle error...
        return "Error temporal. Intenta expandir el chat para más opciones o contacta: +582418710903"
      } finally {
        setIsLoading(false)
      }
    }

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
      const response = await callGeminiAPI(currentInput)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error:", error)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Error temporal. Intenta expandir el chat para más opciones o contacta: +582418710903",
        error: true,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-72 sm:w-80 h-80 sm:h-96 flex flex-col shadow-2xl border-amber-200 animate-in slide-in-from-bottom-4 duration-300 bg-white">
      <CardHeader className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-2 sm:p-3 rounded-t-lg">
        <CardTitle className="flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-1 sm:gap-2">
            <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Asistente UJAP</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-white hover:bg-white/20"
              onClick={onExpand}
            >
              <Maximize2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-white hover:bg-white/20"
              onClick={onClose}
            >
              <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <div
          ref={scrollAreaRef}
          className="h-full overflow-y-auto p-2 sm:p-3 space-y-2 sm:space-y-3 scrollbar-thin scrollbar-thumb-amber-300 scrollbar-track-amber-100"
        >
          {messages.map((message: Message): React.ReactNode => (
            <div
              key={message.id}
              className={`flex gap-1 sm:gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <Avatar className="h-5 w-5 sm:h-6 sm:w-6 mt-1 flex-shrink-0">
                  <AvatarFallback className="bg-amber-100 text-amber-600 text-xs">
                    <Bot className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={`max-w-[80%] sm:max-w-[75%] rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white"
                    : message.error
                      ? "bg-red-50 text-red-900 border border-red-200"
                      : "bg-white text-gray-900 border border-amber-200"
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
              </div>

              {message.role === "user" && (
                <Avatar className="h-5 w-5 sm:h-6 sm:w-6 mt-1 flex-shrink-0">
                  <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                    <User className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-1 sm:gap-2 justify-start">
              <Avatar className="h-5 w-5 sm:h-6 sm:w-6 mt-1 flex-shrink-0">
                <AvatarFallback className="bg-amber-100 text-amber-600 text-xs">
                  <Bot className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-white border border-amber-200 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 animate-spin" />
                  <span className="text-xs">Escribiendo...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t bg-white p-2 sm:p-3">
        <form onSubmit={handleSubmit} className="flex w-full gap-1.5 sm:gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu pregunta..."
            className="flex-1 text-xs h-7 sm:h-8 border-amber-200 focus:border-amber-400"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            size="sm"
            className="h-7 w-7 sm:h-8 sm:w-8 p-0 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
          >
            {isLoading ? (
              <Loader2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 animate-spin" />
            ) : (
              <Send className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
