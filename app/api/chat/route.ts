import { google } from "@ai-sdk/google"
import { streamText } from "ai"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // Verificar que tenemos la API key
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error("GOOGLE_GENERATIVE_AI_API_KEY no está configurada")
      return new Response(JSON.stringify({ error: "API key no configurada" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    console.log("Iniciando llamada a Gemini con", messages.length, "mensajes")

    const result = await streamText({
      model: google("gemini-1.5-flash"),
      system: `Eres un asistente virtual especializado en la Dirección de Postgrado de la Universidad José Antonio Páez (UJAP). 

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
- Directora General: Dra. Haydee Páez
- Coordinadores especializados por programa

Responde de manera amigable, profesional y en español. Mantén las respuestas concisas pero informativas.`,
      messages,
      temperature: 0.7,
      maxTokens: 1000,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error en API route:", error)
    return new Response(
      JSON.stringify({
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
