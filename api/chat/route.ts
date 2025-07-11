import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: openai("gpt-4o"),
    system: "Eres un asistente útil y amigable. Responde de manera clara y concisa en español.",
    messages,
  })

  return result.toDataStreamResponse()
}
