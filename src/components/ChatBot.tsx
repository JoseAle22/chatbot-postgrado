"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import ProgramButtons from "./ProgramButtons"
import { LearningSystem } from "@/lib/learning-system"
import { AIService } from "@/lib/ai-service"

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
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13M0 13.5h24v7.5H0z"
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
  isStreaming?: boolean
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
  const streamingMessageRef = useRef<string>("")
  const textBufferRef = useRef<string>("")
  const displayedTextRef = useRef<string>("")
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const currentMessageIdRef = useRef<string>("")

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
      const userId = "anonymous"
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

  const handleProgramSelectTitle = (title: string) => {
    const question = `Quiero más información detallada del programa: ${title}.`
    void processUserMessage(question)
  }

  const detectProgramIntent = (message: string): boolean => {
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
      "que maestrías hay",
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
      "lista de doctorados",
    ]
    const lowerMessage = message.toLowerCase()
    return explicitPhrases.some((phrase) => lowerMessage.includes(phrase))
  }

  const isProgramQuery = (message: string): boolean => {
    const text = (message || "").toLowerCase()
    const tokens = ["programa", "programas", "maestria", "maestría", "doctorado", "especializacion", "especialización"]
    return tokens.some((t) => text.includes(t))
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

  const processUserMessage = async (messageText: string) => {
    textBufferRef.current = ""
    displayedTextRef.current = ""
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current)
      streamIntervalRef.current = null
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
    }

    const updatedMessagesWithUser = [...messages, userMessage]
    setMessages(updatedMessagesWithUser)
    setIsLoading(true)

    try {
      if (detectProgramIntent(messageText)) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Perfecto. ¿Te interesa información sobre programas clínicos o no clínicos?",
          showButtons: "program-type",
        }
        setMessages((prev) => [...prev, assistantMessage])
        setChatState("program-selection")
        setIsLoading(false)
        return
      }

      let knowledgeResults = await LearningSystem.searchKnowledge(
        messageText,
        isProgramQuery(messageText) ? "programs" : undefined,
      )
      if (knowledgeResults.length === 0 && isProgramQuery(messageText)) {
        knowledgeResults = await LearningSystem.searchKnowledge(messageText)
      }

      const assistantMessageId = (Date.now() + 1).toString()
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        isStreaming: true,
      }
      let messageAdded = false

      let finalPrompt = messageText
      if (knowledgeResults.length > 0) {
        // Usar solo el PRIMER resultado (mejor coincidencia)
        const bestResult = knowledgeResults[0]
        finalPrompt = `Responde la siguiente pregunta basándote en la información disponible. Sé conciso y directo.

Información disponible:
P: ${bestResult.question}
R: ${bestResult.answer}

Pregunta del usuario: "${messageText}"`
      }

      const { fullContent, metadata } = await AIService.generateResponseStream(
        finalPrompt,
        updatedMessagesWithUser,
        (chunk: string) => {
          if (!messageAdded) {
            setMessages((prev) => [...prev, assistantMessage])
            messageAdded = true
            setIsLoading(false)
            startLetterByLetterDisplay(assistantMessageId)
          }

          textBufferRef.current += chunk
        },
      )

      const waitForDisplayComplete = () => {
        return new Promise<void>((resolve) => {
          const checkInterval = setInterval(() => {
            if (displayedTextRef.current.length === textBufferRef.current.length) {
              clearInterval(checkInterval)
              resolve()
            }
          }, 50)
        })
      }

      await waitForDisplayComplete()

      // Save to learning system
      if (conversationId) {
        await LearningSystem.saveMessage(conversationId, "user", messageText, metadata.intent)
        await LearningSystem.saveMessage(
          conversationId,
          "assistant",
          fullContent,
          metadata.intent,
          metadata.confidence,
          metadata.responseTime,
        )
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                confidence: metadata.confidence,
                isStreaming: false,
              }
            : msg,
        ),
      )

      setApiStatus("working")
    } catch (error) {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current)
        streamIntervalRef.current = null
      }
      console.error("Error in processUserMessage:", error)
      setApiStatus("error")
      const errorResponseMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Lo siento, ha ocurrido un error inesperado al procesar tu solicitud.",
        error: true,
      }
      setMessages((prev) => [...prev, errorResponseMessage])
    } finally {
      setIsLoading(false)
      streamingMessageRef.current = ""
    }
  }

  const startLetterByLetterDisplay = (messageId: string) => {
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current)
    }

    currentMessageIdRef.current = messageId
    displayedTextRef.current = ""

    streamIntervalRef.current = setInterval(() => {
      const buffer = textBufferRef.current
      const displayed = displayedTextRef.current

      if (displayed.length < buffer.length) {
        const nextChar = buffer[displayed.length]
        displayedTextRef.current += nextChar

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? {
                  ...msg,
                  content: displayedTextRef.current,
                }
              : msg,
          ),
        )
      } else if (displayed.length === buffer.length && buffer.length > 0) {
        if (streamIntervalRef.current) {
          clearInterval(streamIntervalRef.current)
          streamIntervalRef.current = null
        }
      }
    }, 30)
  }

  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    const currentInput = input
    setInput("")
    await processUserMessage(currentInput)
  }

  const containerClass = isModal
    ? "h-full md:h-auto flex items-center justify-center p-0 md:p-0"
    : "min-h-screen-safe bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4 md:p-6 rounded-2xl backdrop-blur-sm"

  return (
    <div className={containerClass}>
      <div className="w-full h-full md:w-full md:max-w-4xl md:h-[80vh] flex flex-col shadow-2xl border-0 md:border border-gray-200/50 bg-white md:rounded-2xl">
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white border-b-0 rounded-t-none md:rounded-t-2xl p-4 md:p-6 relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 to-orange-600/20 backdrop-blur-3xl"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fillRule=evenodd%3E%3Cg fill=%23ffffff fillOpacity=0.05%3E%3Ccircle cx=30 cy=30 r=2/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>

          <div className="flex items-center justify-between relative z-10">
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
                    <div className="prose prose-sm md:prose-base max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0 prose-strong:font-semibold prose-headings:mt-3 prose-headings:mb-2 prose-h4:text-[1rem] prose-h5:text-[0.95rem]">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                    </div>
                  </div>

                  {message.role === "assistant" && !message.error && !message.showButtons && !message.isStreaming && (
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
                        onClick={() => processUserMessage("¿Cuáles son los documentos necesarios para la inscripción?")}
                        className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white justify-start"
                        size="sm"
                      >
                        📄 Documentos para inscripción
                      </Button>
                      <Button
                        onClick={() => processUserMessage("¿Cuáles son las cuentas bancarias para los pagos?")}
                        className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white justify-start"
                        size="sm"
                      >
                        💳 Cuentas bancarias
                      </Button>
                      <Button
                        onClick={() => processUserMessage("¿Cuáles son los correos de contacto?")}
                        className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white justify-start"
                        size="sm"
                      >
                        📧 Correos de contacto
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
                        onProgramSelectTitle={handleProgramSelectTitle}
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
