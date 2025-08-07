"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User, Loader2, AlertCircle, X, ArrowLeft, Sparkles } from "lucide-react"

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
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Handle virtual keyboard on mobile
  useEffect(() => {
    if (typeof window === "undefined") return

    const handleResize = () => {
      // Solo en móviles
      if (window.innerWidth >= 768) return

      const viewport = window.visualViewport
      if (viewport) {
        const keyboardHeight = window.innerHeight - viewport.height
        setKeyboardHeight(keyboardHeight > 0 ? keyboardHeight : 0)
      }
    }

    const handleFocus = () => {
      // Pequeño delay para que el teclado aparezca
      setTimeout(() => {
        if (inputRef.current && window.innerWidth < 768) {
          inputRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }, 300)
    }

    // Visual Viewport API (mejor soporte)
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize)
    } else {
      // Fallback para navegadores sin Visual Viewport API
      window.addEventListener("resize", handleResize)
    }

    // Escuchar cuando el input recibe focus
    const inputElement = inputRef.current
    if (inputElement) {
      inputElement.addEventListener("focus", handleFocus)
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize)
      } else {
        window.removeEventListener("resize", handleResize)
      }
      if (inputElement) {
        inputElement.removeEventListener("focus", handleFocus)
      }
    }
  }, [])

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

  // Responsive container classes
  const containerClass = isModal
    ? "h-full md:h-auto flex items-center justify-center p-0 md:p-0"
    : "min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4"

  return (
    <div className={containerClass}>
      <div
        className="w-full h-full md:w-full md:max-w-4xl md:h-[80vh] flex flex-col shadow-2xl border-0 md:border border-gray-200/50 bg-white md:rounded-2xl backdrop-blur-sm"
        style={{
          // En móvil, ajustar la altura cuando aparece el teclado
          height: isModal && keyboardHeight > 0 ? `calc(100vh - ${keyboardHeight}px)` : undefined,
        }}
      >
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
                <div className="text-lg md:text-xl font-bold tracking-tight">Asistente UJAP</div>
                <div className="text-sm md:text-base opacity-90 font-medium">Dirección de Postgrado</div>
              </div>

              {/* Status indicators - Hidden on mobile */}
              <div className="hidden lg:flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/30">
                  <Sparkles className="h-3 w-3 text-yellow-200" />
                  <span className="text-xs font-medium">Powered by Gemini</span>
                </div>
                {apiStatus === "error" && (
                  <div className="flex items-center gap-1 bg-red-500/20 backdrop-blur-sm px-2 py-1 rounded-full border border-red-300/30">
                    <AlertCircle className="h-3 w-3 text-red-200" />
                    <span className="text-xs">Error</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Test connection button */}
              {apiStatus !== "working" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1.5 h-auto hidden md:flex transition-all duration-200 hover:scale-105"
                  onClick={testConnection}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-2" />
                  ) : (
                    <AlertCircle className="h-3 w-3 mr-2" />
                  )}
                  <span className="text-xs font-medium">Probar</span>
                </Button>
              )}

              {/* Close/Back button */}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 backdrop-blur-sm border border-white/30 rounded-full h-9 w-9 p-0 transition-all duration-200 hover:scale-105"
                onClick={handleGoBack}
              >
                {isModal ? <X className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Messages area - Enhanced Design */}
        <div
          className="flex-1 overflow-hidden bg-gradient-to-b from-gray-50/50 to-white"
          style={{
            // Ajustar padding bottom en móvil cuando hay teclado
            paddingBottom: keyboardHeight > 0 ? "0px" : undefined,
          }}
        >
          <div
            ref={scrollAreaRef}
            className="h-full overflow-y-auto overflow-x-hidden p-4 md:p-6 space-y-4 md:space-y-6 scroll-smooth"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#f59e0b #f3f4f6",
              // En móvil con teclado, reducir el padding bottom para dar más espacio
              paddingBottom: keyboardHeight > 0 ? "8px" : undefined,
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
                      className={`${
                        message.error
                          ? "bg-gradient-to-br from-red-100 to-red-200 text-red-700"
                          : "bg-gradient-to-br from-amber-100 to-orange-200 text-amber-700"
                      }`}
                    >
                      {message.error ? (
                        <AlertCircle className="h-4 w-4 md:h-5 md:w-5" />
                      ) : (
                        <Bot className="h-4 w-4 md:h-5 md:w-5" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 md:px-5 md:py-4 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl ${
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

        {/* Input area - Fixed position on mobile with keyboard */}
        <div
          className="border-t border-gray-200/50 bg-white/95 backdrop-blur-sm p-4 md:p-6 rounded-b-none md:rounded-b-2xl flex-shrink-0"
          style={{
            // En móvil, posición fija cuando hay teclado
            position: keyboardHeight > 0 ? "fixed" : "relative",
            bottom: keyboardHeight > 0 ? "0" : "auto",
            left: keyboardHeight > 0 ? "0" : "auto",
            right: keyboardHeight > 0 ? "0" : "auto",
            zIndex: keyboardHeight > 0 ? 1000 : "auto",
            // Sombra superior cuando está fijo
            boxShadow: keyboardHeight > 0 ? "0 -4px 20px rgba(0,0,0,0.1)" : "none",
          }}
        >
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
