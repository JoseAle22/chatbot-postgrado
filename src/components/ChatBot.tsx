"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User, Loader2, AlertCircle, X, ArrowLeft } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  error?: boolean
}

interface ChatBotProps {
  isModal?: boolean
  onClose?: () => void
}

export default function ChatBot({ isModal = false, onClose }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "¡Hola! Soy tu asistente virtual de la Dirección de Postgrado UJAP. Puedo ayudarte con información sobre nuestros programas de Doctorado, Maestrías y Especializaciones, requisitos de admisión, contactos y más. ¿En qué puedo ayudarte hoy?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState<"unknown" | "working" | "error">("unknown")
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const callGeminiAPI = async (userMessage: string, conversationHistory: Message[]) => {
    const API_KEY = import.meta.env.VITE_GOOGLE_GENERATIVE_AI_API_KEY

    if (!API_KEY) {
      throw new Error("API key no configurada. Agrega VITE_GOOGLE_GENERATIVE_AI_API_KEY a tu archivo .env.local")
    }

    const systemPrompt = `Eres un asistente virtual especializado en la Dirección de Postgrado de la Universidad José Antonio Páez (UJAP). 

Tu función es ayudar a estudiantes, profesionales y personas interesadas con información sobre:

PROGRAMAS ACADÉMICOS:
- Doctorados: Ciencias de la Educación, Orientación
- Maestrías: Gerencia de la Comunicación Organizacional, Gerencia y Tecnología de la Información, Educación para el Desarrollo Sustentable
- Especializaciones: Administración de Empresas, Automatización Industrial, Derecho Administrativo, Derecho Procesal Civil, Docencia en Educación Superior, Gerencia de Control de Calidad e Inspección de Obras, Gestión Aduanera y Tributaria, Gestión y Control de las Finanzas Públicas, Telecomunicaciones

INFORMACIÓN DE CONTACTO:
- Email: coordinacion.postgrado@ujap.edu.ve
- Teléfono: +582418710903
- UJAP General: +582418714240 ext. 1260
- Ubicación: Municipio San Diego, Calle Nº 3. Urb. Yuma II, Valencia, Edo. Carabobo

AUTORIDADES:
- Directora General: Dra. Haydee Páez (también Coordinadora del Doctorado en Ciencias de la Educación)
- Dra. Omaira Lessire de González: Coordinadora del Doctorado en Orientación
- Dra. Thania Oberto: Coordinadora de Maestría en Gerencia de la Comunicación Organizacional y varias especializaciones
- MSc. Wilmer Sanz: Coordinador de Especialización en Automatización Industrial
- MSc. Susan León: Coordinadora de Maestría en Gerencia y Tecnología de la Información y Especialización en Docencia
- MSc. Ledys Herrera: Coordinadora de Especialización en Derecho Procesal Civil
- Esp. Federico Estaba: Coordinador de Especialización en Gestión y Control de las Finanzas Públicas
- Esp. Adriana Materán: Coordinadora de Especialización en Odontopediatría

INFORMACIÓN INSTITUCIONAL:
- La UJAP es una universidad privada ubicada en Valencia, Estado Carabobo, Venezuela
- Ofrece formación de alto nivel con enfoque interdisciplinario, multidisciplinario y transdisciplinario
- Cuenta con infraestructura moderna, biblioteca, laboratorios, plataformas virtuales
- Promueve la excelencia, innovación e internacionalización`

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
    const recentHistory = conversationHistory.slice(-10)
    for (const msg of recentHistory) {
      if (msg.role === "user") {
        contents.push({
          role: "user",
          parts: [{ text: msg.content }],
        })
      } else if (msg.role === "assistant" && !msg.error) {
        contents.push({
          role: "model",
          parts: [{ text: msg.content }],
        })
      }
    }

    // Agregar el mensaje actual
    contents.push({
      role: "user",
      parts: [{ text: userMessage }],
    })

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
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
            maxOutputTokens: 1024,
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
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Lo siento, no pude generar una respuesta."
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
      console.log("Enviando mensaje a Gemini:", currentInput)

      const response = await callGeminiAPI(currentInput, messages)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
      }

      setMessages((prev) => [...prev, assistantMessage])
      setApiStatus("working")
    } catch (error) {
      console.error("Error completo:", error)
      setApiStatus("error")

      // Determinar el tipo de error y mostrar mensaje apropiado
      let errorMessage = "Lo siento, ha ocurrido un error inesperado."

      if (error instanceof Error) {
        if (error.message.includes("API key")) {
          errorMessage =
            "⚠️ **Configuración requerida**: La API key de Google Gemini no está configurada correctamente.\n\n📋 **Pasos para configurar:**\n1. Crea un archivo `.env.local` en la raíz del proyecto\n2. Agrega: `VITE_GOOGLE_GENERATIVE_AI_API_KEY=tu_api_key`\n3. Obtén tu API key en: https://makersuite.google.com/app/apikey\n4. Reinicia el servidor con `npm run dev`"
        } else if (error.message.includes("403") || error.message.includes("401")) {
          errorMessage =
            "🔑 **Error de autenticación**: La API key no es válida o ha expirado.\n\n✅ **Soluciones:**\n- Verifica que la API key sea correcta\n- Genera una nueva API key en Google AI Studio\n- Asegúrate de que la API esté habilitada"
        } else if (error.message.includes("429")) {
          errorMessage =
            "⏱️ **Límite alcanzado**: Se ha excedido el límite de la API.\n\n⏰ **Intenta:**\n- Esperar unos minutos antes de volver a intentar\n- Verificar tu cuota en Google AI Studio"
        } else if (error.message.includes("400")) {
          errorMessage =
            "📝 **Error en la solicitud**: Hay un problema con el formato de la consulta.\n\n🔄 **Intenta:**\n- Reformular tu pregunta\n- Usar un mensaje más corto"
        } else {
          errorMessage = `❌ **Error**: ${error.message}\n\n📞 **Contacto directo:**\n📧 coordinacion.postgrado@ujap.edu.ve\n📞 +582418710903`
        }
      }

      const errorResponseMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: errorMessage,
        error: true,
      }
      setMessages((prev) => [...prev, errorResponseMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoBack = () => {
    if (isModal && onClose) {
      onClose()
    } else {
      window.location.href = "/"
    }
  }

  const testConnection = async () => {
    setIsLoading(true)
    try {
      await callGeminiAPI("test", [])
      setApiStatus("working")

      const testMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content:
          "✅ **Conexión exitosa**: La API de Gemini está funcionando correctamente. ¡Ya puedes hacer tus preguntas sobre los programas de postgrado UJAP!",
      }
      setMessages((prev) => [...prev, testMessage])
    } catch (error) {
      setApiStatus("error")
      console.error("Test de conexión falló:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Si es modal, usar estructura diferente para móvil vs desktop
  if (isModal) {
    return (
      <div className="h-full w-full flex flex-col bg-white md:rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-3 md:p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Bot className="h-5 w-5 md:h-6 md:w-6 text-white flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-sm md:text-lg font-semibold">Chatbot UJAP</div>
                <div className="text-xs opacity-90 hidden sm:block">Postgrado</div>
              </div>

              {/* Status indicators */}
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Powered by Gemini</span>
                {apiStatus === "error" && <AlertCircle className="h-4 w-4 text-red-200" />}
                {apiStatus === "working" && <div className="h-2 w-2 bg-green-300 rounded-full" />}
              </div>
            </div>

            <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
              {apiStatus !== "working" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 text-xs px-2 py-1 h-auto hidden sm:flex"
                  onClick={testConnection}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                  <span className="hidden md:inline">Probar</span>
                  <span className="md:hidden">Test</span>
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 px-2 py-1 h-auto"
                onClick={handleGoBack}
              >
                <X className="h-4 w-4" />
                <span className="ml-1 hidden sm:inline">Cerrar</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-hidden">
          <div
            ref={scrollAreaRef}
            className="h-full overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#fbbf24 #fef3c7",
            }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 md:gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-6 w-6 md:h-8 md:w-8 mt-1 flex-shrink-0">
                    <AvatarFallback
                      className={`${message.error ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}
                    >
                      {message.error ? (
                        <AlertCircle className="h-3 w-3 md:h-4 md:w-4" />
                      ) : (
                        <Bot className="h-3 w-3 md:h-4 md:w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`max-w-[85%] md:max-w-[80%] rounded-lg px-3 py-2 md:px-4 md:py-2 ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white"
                      : message.error
                        ? "bg-red-50 text-red-900 border border-red-200"
                        : "bg-gray-50 text-gray-900 border border-gray-200 shadow-sm"
                  }`}
                >
                  <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>

                {message.role === "user" && (
                  <Avatar className="h-6 w-6 md:h-8 md:w-8 mt-1 flex-shrink-0">
                    <AvatarFallback className="bg-gray-100 text-gray-600">
                      <User className="h-3 w-3 md:h-4 md:w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 md:gap-3 justify-start">
                <Avatar className="h-6 w-6 md:h-8 md:w-8 mt-1 flex-shrink-0">
                  <AvatarFallback className="bg-amber-100 text-amber-600">
                    <Bot className="h-3 w-3 md:h-4 md:w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 md:px-4 md:py-2 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
                    <span className="text-sm">Escribiendo...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input area */}
        <div className="border-t bg-white p-3 md:p-4 flex-shrink-0">
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregúntame sobre programas UJAP..."
              className="flex-1 border-gray-300 focus:border-amber-400 text-sm h-10 md:h-11"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 h-10 md:h-11 px-4"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  // Versión no modal (página completa)
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl border-amber-200 bg-white">
        <CardHeader className="bg-gradient-to-r from-amber-600 to-orange-600 text-white border-b backdrop-blur-sm rounded-t-lg">
          <CardTitle className="flex items-center justify-between text-xl">
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-white" />
              Chatbot UJAP - Postgrado
              <div className="flex items-center gap-2">
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Powered by Gemini</span>
                {apiStatus === "error" && <AlertCircle className="h-4 w-4 text-red-200" />}
                {apiStatus === "working" && <div className="h-2 w-2 bg-green-300 rounded-full" />}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {apiStatus !== "working" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 text-xs"
                  onClick={testConnection}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                  Probar conexión
                </Button>
              )}
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={handleGoBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 p-0 overflow-hidden">
          <div
            ref={scrollAreaRef}
            className="h-full overflow-y-auto p-4 space-y-4"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#fbbf24 #fef3c7",
            }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                    <AvatarFallback
                      className={`${message.error ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}
                    >
                      {message.error ? <AlertCircle className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white"
                      : message.error
                        ? "bg-red-50 text-red-900 border border-red-200"
                        : "bg-white text-gray-900 border border-amber-200"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                </div>

                {message.role === "user" && (
                  <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                    <AvatarFallback className="bg-gray-100 text-gray-600">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                  <AvatarFallback className="bg-amber-100 text-amber-600">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white border border-amber-200 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Escribiendo...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="border-t bg-white/50 backdrop-blur-sm p-4 rounded-b-lg flex-shrink-0">
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregúntame sobre programas, admisiones, contactos..."
              className="flex-1 border-amber-200 focus:border-amber-400"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
