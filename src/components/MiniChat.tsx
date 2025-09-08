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
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "assistant", content: "¡Hola, soy Ujapito! Tu asistente de Postgrado UJAP. ¿En qué puedo ayudarte?" },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [extraContext, setExtraContext] = useState("")   // 👈 Nuevo estado
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Cargar contexto.txt
  useEffect(() => {
    fetch("/contexto.txt")
      .then((res) => res.text())
      .then((data) => setExtraContext(data))
      .catch((err) => console.error("Error cargando contexto.txt:", err))
  }, [])

  const callGeminiAPI = async (userMessage: string, conversationHistory: Message[]) => {
    const API_KEY = import.meta.env.VITE_GOOGLE_GENERATIVE_AI_API_KEY
    if (!API_KEY) throw new Error("API key no configurada")

    const systemPrompt = `Eres un asistente virtual llamado Ujapito especializado en la Dirección de Postgrado de la Universidad José Antonio Páez (UJAP).

${extraContext}

Tu función es ayudar a estudiantes, profesionales y personas interesadas con información sobre:

PROGRAMAS ACADÉMICOS:
- Doctorados: Ciencias de la Educación, Orientación
- Maestrías: Gerencia de la Comunicación Organizacional, Gerencia y Tecnología de la Información, Educación para el Desarrollo Sustentable
- Especializaciones: Administración de Empresas, Automatización Industrial, Derecho Administrativo, Derecho Procesal Civil, Docencia en Educación Superior, Gerencia de Control de Calidad e Inspección de Obras, Gestión Aduanera y Tributaria, Gestión y Control de las Finanzas Públicas, Telecomunicaciones

INFORMACIÓN DE CONTACTO:
- Email: coordinacion.postgrado@ujap.edu.ve
- Teléfono: +582418710903
- UJAP General: +582418714240 ext. 1260
- Ubicación: Municipio San Diego, Calle Nº 3. Urb. Yuma II, Valencia, Edo. Carabobo.
- Instagram: @ujap_oficial

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
- Promueve la excelencia, innovación e internacionalización

DOCUMENTOS Y REQUISITOS:
- Dos (2) fotografias tamaño carnet.
- Copia de la cédula de identidad ampliada al 150%.
- Fondo Negro certificado del titulo de pregrado.
- Notas certificadas de las calificaciones obtenidas en los estudios de pregrado.
- Curriculum Vitae con documentos probatorios para la aplicacion del Baremo.
- Comprobante de pago del arancel de admision.
- En el doctorado adicionalmente debera consignar: fondo negro del titulo de magister certificado, dos referencias academicas, propuesta del tema de Tesis Doctoral y presentar una entrevista.

Esos Documentos deben ser consignados en la oficina de Control de Estudios en el respectivo sobre de inscripcion (se adquiere en el centro de copiado).

MODALIDADES DE PAGO:
Cuentas Autorizadas para los pagos:
Cuentas corrientes a nombre de: Sociedad Civil Universidad José Antonio Páez, RIF: J-30400858-9.

Banco Nacional de Credito 0191-0085-50-2185041363
Banco Banesco 0134-0025-34-0251066811
Banco Provincial 0108-0082-08-0100003985
Banco de Venezuela 0102-0114-48-0001031353
Banco Nacional de Crédito(Dolares) 0191-0127-43-2300010599
Banco Nacional de Crédito(Euros) 0191-0127-44-2400000188

FORMATO DE RESPUESTA:
- Responde siempre en texto claro y ordenado.
- No uses asteriscos (*), guiones (-) ni símbolos innecesarios.
- Si necesitas listas, usa numeración simple (1., 2., 3.) o saltos de línea.
- Separa las secciones con títulos en mayúsculas.
- No uses Markdown ni código.
- Si no sabes la respuesta, di "Lo siento, no tengo esa información."
- Mantén un tono profesional, amable y servicial.
- Los nombres de las autoridades y coordinadores los debes decir respectivamente cuando menciones las Maestrias, Especializaciones y Doctorados.`

    const contents = [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
      {
        role: "model",
        parts: [{ text: "Entendido. Te ayudo con información sobre postgrado UJAP." }],
      },
    ]

    // Agregar historial reciente (últimos 6 mensajes para el mini chat)
    const recentHistory = conversationHistory.slice(-6)
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
            maxOutputTokens: 512, // Respuestas más cortas para mini chat
          },
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`Error ${response.status}`)
    }

    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Lo siento, no pude generar una respuesta."
  }

  const cleanResponse = (text: string) => {
    return text
      .replace(/\*/g, "") // Quita todos los asteriscos
      .replace(/^- /gm, "") // Quita guiones al inicio de líneas
      .replace(/\n{3,}/g, "\n\n") // Reduce saltos de línea excesivos
      .trim()
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
      const response = await callGeminiAPI(currentInput, messages)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: cleanResponse(response),
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
            <span>UJAPITO</span>
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
          {messages.map((message) => (
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
