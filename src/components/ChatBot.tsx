"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import ProgramButtons from "./ProgramButtons"
import { LearningSystem } from "@/lib/learning-system"
import { AIService } from "@/lib/ai-service"

// SVG Icon Components
const Send = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m5 12 7-7 7 7M12 5v14" />
  </svg>
)

const Bot = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
)

const User = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
)

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
)

const AlertCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
    />
  </svg>
)

const Stethoscope = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.29 1.51 4.04 3 5.5l6 6 6-6z"
    />
  </svg>
)

const BookOpen = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 16.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    />
  </svg>
)

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  error?: boolean
  showButtons?: "initial" | "program-type" | "programs-clinicos" | "programs-no-clinicos"
  feedback?: "positive" | "negative"
  confidence?: number
}

interface Program {
  id: string
  name: string
  type: "doctorado" | "maestria" | "especializacion"
  coordinator: string
  description: string
  requirements: string[]
  duration: string
  modality: string
  icon: string
  image?: string
}

interface ChatBotProps {
  isModal?: boolean
  onClose?: () => void
}

export default function ChatBot({ isModal = false }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState<"unknown" | "working" | "error">("unknown")
  const [, setChatState] = useState<"initial" | "program-selection" | "conversation">("initial")
  const [conversationId, setConversationId] = useState<string>("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const initialMessage: Message = {
      id: "welcome",
      role: "assistant",
      content:
        "¡Hola! Soy UJAPITO, tu asistente virtual de la Dirección de Postgrado UJAP. ¿En qué puedo ayudarte hoy?",
      showButtons: "initial",
    }
    setMessages([initialMessage])

    initializeConversation()
  }, [])

  const initializeConversation = async () => {
    try {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const userId = "anonymous" // Puedes cambiar esto por el ID real si tienes autenticación
  const newConversationId = await LearningSystem.saveConversation(sessionId, userId)
      setConversationId(newConversationId)
    } catch (error) {
      console.error("Error initializing conversation:", error)
    }
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])


  const handleInitialResponse = (response: "yes" | "programs" | "other") => {
    let userMessage: Message
    let assistantMessage: Message

    if (response === "yes" || response === "programs") {
      userMessage = {
        id: Date.now().toString(),
        role: "user",
        content: response === "yes" ? "Sí, puedes ayudarme" : "Quiero información sobre programas",
      }

      assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Perfecto. ¿Te interesa información sobre programas clínicos o no clínicos?",
        showButtons: "program-type",
      }
      setChatState("program-selection")
    } else {
      userMessage = {
        id: Date.now().toString(),
        role: "user",
        content: "Tengo otra consulta",
      }

      assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "¡Por supuesto! Puedes escribir tu pregunta y te ayudaré con cualquier información sobre la Dirección de Postgrado UJAP.",
      }
      setChatState("conversation")
    }

    setMessages((prev) => [...prev, userMessage, assistantMessage])
  }

  const handleProgramTypeSelection = (type: "clinicos" | "no-clinicos") => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: `Programas ${type}`,
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: `Aquí tienes nuestros programas ${type}. Puedes expandir cada uno para ver información detallada:`,
      showButtons: type === "clinicos" ? "programs-clinicos" : "programs-no-clinicos",
    }

    setMessages((prev) => [...prev, userMessage, assistantMessage])
    setChatState("conversation")
  }

  const handleProgramSelect = (program: Program) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: `Más información sobre ${program.name}`,
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: `Excelente elección. El ${program.name} es coordinado por ${program.coordinator}. 

INFORMACIÓN DETALLADA:
${program.description}

DURACIÓN: ${program.duration}
MODALIDAD: ${program.modality}

REQUISITOS PRINCIPALES:
${program.requirements.map((req, index) => `${index + 1}. ${req}`).join("\n")}

DOCUMENTOS NECESARIOS:
1. Dos (2) fotografías tamaño carnet
2. Copia de cédula ampliada al 150%
3. Fondo Negro certificado del título de pregrado
4. Notas certificadas de pregrado
5. Curriculum Vitae con documentos probatorios
6. Comprobante de pago del arancel

CONTACTO DIRECTO:
📧 coordinacion.postgrado@ujap.edu.ve
📞 +58 241 871 0903

¿Te gustaría conocer más detalles sobre algún aspecto específico del programa?`,
    }

    setMessages((prev) => [...prev, userMessage, assistantMessage])
  }

  const callGeminiAPI = async (userMessage: string, conversationHistory: Message[]) => {
    try {
      // Use the enhanced AI service
      const response = await AIService.generateResponse(userMessage, conversationHistory)

      // Save messages to learning system
      if (conversationId) {
        await LearningSystem.saveMessage(conversationId, "user", userMessage, response.intent)
        await LearningSystem.saveMessage(
          conversationId,
          "assistant",
          response.content,
          response.intent,
          response.confidence,
          response.responseTime,
        )
      }

      return response.content
    } catch (error) {
      console.error("Error in AI service:", error)

      // Fallback to original Gemini implementation
      const API_KEY = import.meta.env.VITE_GOOGLE_GENERATIVE_AI_API_KEY
      if (!API_KEY)
        throw new Error("API key no configurada. Agrega VITE_GOOGLE_GENERATIVE_AI_API_KEY a tu archivo .env.local")

      const systemPrompt = `Eres un asistente virtual llamado Ujapito especializado en la Dirección de Postgrado de la Universidad José Antonio Páez (UJAP).`

      // Preparar el historial de conversación
      const contents = [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [{ text: "Entendido. Soy tu asistente especializado en la Dirección de Postgrado UJAP." }],
        },
      ]

      // Agregar historial de conversación (últimos 10 mensajes para no exceder límites)
      // Seleccionar los 20 mensajes más relevantes (preguntas largas, respuestas largas, o que contengan palabras clave)
      const KEYWORDS = ["programa", "maestría", "doctorado", "especialización", "requisito", "documento", "coordinador", "autoridad", "inscripción", "arancel", "pago", "modalidad"];
  const isRelevant = (msg: Message) => {
        const text = msg.content?.toLowerCase() || "";
        return text.length > 60 || KEYWORDS.some(k => text.includes(k));
      };
      // Filtra los relevantes y si hay menos de 20, completa con los últimos
      let relevantHistory = conversationHistory.filter(isRelevant);
      if (relevantHistory.length < 20) {
        const missing = 20 - relevantHistory.length;
        const lastMessages = conversationHistory.slice(-missing);
        // Evita duplicados
        relevantHistory = [...relevantHistory, ...lastMessages.filter(m => !relevantHistory.includes(m))];
      }
      // Solo los últimos 20 relevantes
      const recentHistory = relevantHistory.slice(-20);
      for (const msg of recentHistory) {
        if (msg.role === "user") {
          contents.push({
            role: "user",
            parts: [{ text: msg.content }],
          });
        } else if (msg.role === "assistant" && !msg.error) {
          contents.push({
            role: "model",
            parts: [{ text: msg.content }],
          });
        }
      }

      // Agregar el mensaje actual
      contents.push({
        role: "user",
        parts: [{ text: userMessage }],
      })

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 4096,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
            ],
          }),
        },
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Error ${response.status}: ${errorData.error?.message || response.statusText}`)
      }

      const data = await response.json()
      const geminiResponse =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "Lo siento, no pude generar una respuesta."
      const safeGeminiResponse = geminiResponse.slice(0, 9900)
      // Save fallback response to learning system
      if (conversationId) {
        await LearningSystem.saveMessage(conversationId, "user", userMessage.slice(0, 9900))
        await LearningSystem.saveMessage(conversationId, "assistant", safeGeminiResponse)
      }
      return safeGeminiResponse
    }
  }

  const cleanResponse = (text: string) => {
    return AIService.cleanResponse(text)
  }

  const detectProgramIntent = (message: string): boolean => {
    // Frases explícitas para mostrar botones de programas
    const explicitPhrases = [
      "información de programas",
      "informacion de programas",
      "quiero información de programas",
      "quiero informacion de programas",
      "cuáles son los programas",
      "cuales son los programas",
      "qué especializaciones hay",
      "que especializaciones hay",
      "qué maestrías hay",
      "que maestrias hay",
      "qué doctorados hay",
      "que doctorados hay",
      "oferta académica",
      "oferta academica",
      "programas disponibles",
      "programas de postgrado",
      "programas de posgrado",
      "programas clínicos",
      "programas no clínicos",
      "programas clinicos",
      "programas no clinicos",
      "ver programas",
      "mostrar programas",
      "lista de programas",
      "lista de especializaciones",
      "lista de maestrías",
      "lista de doctorados"
    ];
    const lowerMessage = message.toLowerCase();
    return explicitPhrases.some((phrase) => lowerMessage.includes(phrase));
  }

  const handleFeedback = async (messageId: string, feedback: "positive" | "negative") => {
    try {
      setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, feedback } : msg)))

      if (conversationId) {
        await LearningSystem.saveFeedback(
          conversationId,
          feedback,
          feedback === "positive" ? 5 : 1,
          feedback === "positive" ? "Usuario encontró la respuesta útil" : "Usuario no encontró la respuesta útil",
          messageId,
        )
      }
    } catch (error) {
      console.error("Error saving feedback:", error)
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

    // 1. Añade SOLO el mensaje del usuario a la UI y prepara el historial
    const updatedMessagesWithUser = [...messages, userMessage]
    setMessages(updatedMessagesWithUser)

    const currentInput = input
    setInput("")
    setIsLoading(true)

    try {
      // 2. Detección de intención de programa (no necesita llamada a IA)
      if (detectProgramIntent(currentInput)) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Perfecto. ¿Te interesa información sobre programas clínicos o no clínicos?",
          showButtons: "program-type",
        }
        setMessages(prev => [...prev, assistantMessage])
        setChatState("program-selection")
        setIsLoading(false)
        return
      }

      // 3. Búsqueda en BD y llamada a IA (si es necesario)
      const knowledgeResults = await LearningSystem.searchKnowledge(currentInput)
      let response = ""

      if (knowledgeResults.length > 0) {
        const allAnswers = knowledgeResults.map(k => k.answer).join("\n\n")
        const prompt = `Redacta la siguiente información de forma clara, profesional y personalizada para el usuario. Responde como UJAPITO, asistente de postgrado. Información encontrada:\n${allAnswers}\nPregunta original: "${currentInput}". Si hay varias respuestas, intégralas en una sola respuesta completa.`
        // Usa el historial que ya incluye el mensaje del usuario
        response = await callGeminiAPI(prompt, updatedMessagesWithUser)
      } else {
        console.log("No se encontró conocimiento. Enviando a IA:", currentInput)
        // Usa el historial que ya incluye el mensaje del usuario
        response = await callGeminiAPI(currentInput, updatedMessagesWithUser)
      }

      // 4. AHORA añade el mensaje del asistente a la UI
      const safeContent = cleanResponse(response).slice(0, 9900)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: safeContent,
        confidence: knowledgeResults.length > 0 ? 1.0 : 0.5,
      }
      setMessages(prev => [...prev, assistantMessage])
      setApiStatus("working")

    } catch (error) {
      console.error("Error completo en handleSubmit:", error)
      setApiStatus("error")
      const errorResponseMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Lo siento, ha ocurrido un error inesperado al procesar tu solicitud.",
        error: true,
      }
      setMessages(prev => [...prev, errorResponseMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const containerClass = isModal
    ? "h-full md:h-auto flex items-center justify-center p-0 md:p-0"
    : "min-h-screen-safe bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4 md:p-6 rounded-2xl backdrop-blur-sm"

  return (
    <div className={containerClass}>
      <div className="w-full h-full md:w-full md:max-w-4xl md:h-[80vh] flex flex-col shadow-2xl border-0 md:border border-gray-200/50 bg-white md:rounded-2xl">
        {/* Header - Professional Design */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white border-b-0 rounded-t-none md:rounded-t-2xl p-4 md:p-6 relative overflow-hidden flex-shrink-0">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 to-orange-600/20 backdrop-blur-3xl"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fillRule=evenodd%3E%3Cg fill=%23ffffff fillOpacity=0.05%3E%3Ccircle cx=30 cy=30 r=2/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>

          <div className="flex items-center justify-between relative z-10">
            {/* Left side - Title and status */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="relative">
                <Avatar className="h-10 w-10 md:h-12 md:w-12 bg-white/20 backdrop-blur-sm border-2 border-white/30">
                  <AvatarFallback className="bg-transparent text-white">
                    <Bot className="h-5 w-5 md:h-6 md:w-6" />
                  </AvatarFallback>
                </Avatar>
                {apiStatus === "working" && (
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-lg md:text-xl font-bold tracking-tight">UJAPITO</div>
                <div className="text-sm md:text-base opacity-90 font-medium">Dirección de Postgrado</div>
              </div>
            </div>

            {/* Right side - Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-gradient-to-b from-gray-50/50 to-white">
          <div
            ref={scrollAreaRef}
            className="h-full overflow-y-auto overflow-x-hidden p-4 md:p-6 space-y-4 md:space-y-6 scroll-smooth"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#f59e0b #f3f4f6",
            }}
          >
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex gap-3 md:gap-4 animate-in slide-in-from-bottom-2 fade-in duration-500 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8 md:h-10 md:w-10 mt-1 flex-shrink-0 shadow-lg border-2 border-white">
                    <AvatarFallback
                      className={`${message.error ? "bg-gradient-to-br from-red-100 to-red-200 text-red-700" : "bg-gradient-to-br from-amber-100 to-orange-200 text-amber-700"}`}
                    >
                      {message.error ? (
                        <AlertCircle className="h-4 w-4 md:h-5 md:w-5" />
                      ) : (
                        <Bot className="h-4 w-4 md:h-5 md:w-5" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className="max-w-[85%] md:max-w-[75%] flex flex-col gap-3">
                  <div
                    className={`rounded-2xl px-4 py-3 md:px-5 md:py-4 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white ml-auto"
                        : message.error
                          ? "bg-gradient-to-br from-red-50 to-red-100 text-red-900 border border-red-200/50"
                          : "bg-white text-gray-800 border border-gray-200/50 shadow-md"
                    }`}
                  >
                    <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words font-medium">
                      {message.content}
                    </p>
                  </div>

                  {message.role === "assistant" && !message.error && !message.showButtons && (
                    <div className="flex gap-2 justify-start">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFeedback(message.id, "positive")}
                        className={`h-8 px-3 text-xs ${
                          message.feedback === "positive"
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        👍 Útil
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFeedback(message.id, "negative")}
                        className={`h-8 px-3 text-xs ${
                          message.feedback === "negative"
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        👎 No útil
                      </Button>
                    </div>
                  )}

                  {message.showButtons === "initial" && (
                    <div className="flex flex-col gap-2 max-w-sm">
                      <Button
                        onClick={() => handleInitialResponse("programs")}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white justify-start"
                        size="sm"
                      >
                        🎓 Información sobre programas
                      </Button>
                      <Button
                        onClick={() => handleInitialResponse("other")}
                        className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white justify-start"
                        size="sm"
                      >
                        💬 Tengo otra consulta
                      </Button>
                    </div>
                  )}

                  {message.showButtons === "program-type" && (
                    <div className="flex flex-col gap-2 max-w-sm">
                      <Button
                        onClick={() => handleProgramTypeSelection("clinicos")}
                        className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white justify-start"
                        size="sm"
                      >
                        <Stethoscope className="h-4 w-4 mr-2" />
                        Programas Clínicos
                      </Button>
                      <Button
                        onClick={() => handleProgramTypeSelection("no-clinicos")}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white justify-start"
                        size="sm"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Programas No Clínicos
                      </Button>
                    </div>
                  )}

                  {(message.showButtons === "programs-clinicos" || message.showButtons === "programs-no-clinicos") && (
                    <div className="w-full">
                      <ProgramButtons
                        programType={message.showButtons === "programs-clinicos" ? "clinicos" : "no-clinicos"}
                        onProgramSelect={handleProgramSelect}
                      />
                    </div>
                  )}
                </div>

                {message.role === "user" && (
                  <Avatar className="h-8 w-8 md:h-10 md:w-10 mt-1 flex-shrink-0 shadow-lg border-2 border-white">
                    <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700">
                      <User className="h-4 w-4 md:h-5 md:w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 md:gap-4 justify-start animate-in slide-in-from-bottom-2 fade-in duration-300">
                <Avatar className="h-8 w-8 md:h-10 md:w-10 mt-1 flex-shrink-0 shadow-lg border-2 border-white">
                  <AvatarFallback className="bg-gradient-to-br from-amber-100 to-orange-200 text-amber-700">
                    <Bot className="h-4 w-4 md:h-5 md:w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white border border-gray-200/50 rounded-2xl px-4 py-3 md:px-5 md:py-4 shadow-lg">
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-amber-500 rounded-full animate-bounce"></div>
                      <div
                        className="h-2 w-2 bg-amber-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="h-2 w-2 bg-amber-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">Escribiendo...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200/50 bg-white/95 backdrop-blur-sm p-4 md:p-6 flex-shrink-0">
          <form onSubmit={handleSubmit} className="flex w-full gap-3">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  apiStatus === "error"
                    ? "Configura la API key primero..."
                    : "Escribe tu pregunta sobre postgrado UJAP..."
                }
                className="w-full border-gray-300 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl h-12 md:h-14 px-4 md:px-5 text-sm md:text-base bg-white shadow-sm transition-all duration-200 focus:shadow-md pr-12"
                disabled={isLoading}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
              {input && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-400 h-12 md:h-14 px-6 md:px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:hover:scale-100 font-medium"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Send className="h-5 w-5 mr-0 md:mr-2" />
                  <span className="hidden md:inline">Enviar</span>
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
