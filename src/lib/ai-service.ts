import { LearningSystem } from "./learning-system"

export interface AIResponse {
  content: string
  confidence: number
  source: "gemini" | "knowledge_base" | "hybrid"
  knowledgeId?: string
  intent?: string
  responseTime: number
}

export class AIService {
  private static readonly CONFIDENCE_THRESHOLD = 0.7
  private static readonly GEMINI_API_KEY = import.meta.env.VITE_GOOGLE_GENERATIVE_AI_API_KEY

  static async generateResponseStream(
    userMessage: string,
    conversationHistory: any[],
    onChunk: (chunk: string) => void,
  ): Promise<{ fullContent: string; metadata: AIResponse }> {
    const startTime = Date.now()

    try {
      const intent = this.detectIntent(userMessage)
      const knowledgeResults = await LearningSystem.searchKnowledge(userMessage, intent)

      // If high-confidence knowledge base result, use it (not streaming)
      if (knowledgeResults.length > 0) {
        const bestMatch = this.findBestMatch(userMessage, knowledgeResults)
        if (bestMatch && bestMatch.confidence > this.CONFIDENCE_THRESHOLD) {
          await LearningSystem.updateKnowledgeUsage(bestMatch.item.$id, true)
          const content = bestMatch.item.answer
          onChunk(content) // Send full content at once for KB
          return {
            fullContent: content,
            metadata: {
              content,
              confidence: bestMatch.confidence,
              source: "knowledge_base",
              knowledgeId: bestMatch.item.$id,
              intent,
              responseTime: Date.now() - startTime,
            },
          }
        }
      }

      // Stream from Gemini
      const fullContent = await this.callGeminiWithStreamContext(
        userMessage,
        conversationHistory,
        knowledgeResults,
        onChunk,
      )

      await this.learnFromInteraction(userMessage, fullContent, intent)

      return {
        fullContent,
        metadata: {
          content: fullContent,
          confidence: 0.8,
          source: knowledgeResults.length > 0 ? "hybrid" : "gemini",
          intent,
          responseTime: Date.now() - startTime,
        },
      }
    } catch (error) {
      console.error("Error generating AI response:", error)
      throw error
    }
  }

  private static async callGeminiWithStreamContext(
    userMessage: string,
    conversationHistory: any[],
    knowledgeContext: any[],
    onChunk: (chunk: string) => void,
  ): Promise<string> {
    if (!this.GEMINI_API_KEY) {
      throw new Error("API key no configurada")
    }

    let systemPrompt = `Eres UJAPITO, asistente virtual especializado en la Dirección de Postgrado de la Universidad José Antonio Páez (UJAP).

INFORMACIÓN CONTEXTUAL RELEVANTE:`

    if (knowledgeContext.length > 0) {
      systemPrompt += `\n\nCONOCIMIENTO RELEVANTE ENCONTRADO:`
      knowledgeContext.slice(0, 3).forEach((item, index) => {
        systemPrompt += `\n${index + 1}. P: ${item.question}\n   R: ${item.answer}`
      })
    }

    systemPrompt += `\n\nINSTRUCCIONES:
- Usa el conocimiento contextual cuando sea relevante
- Si no tienes información específica, indica claramente que necesitas más detalles
- Mantén un tono profesional y servicial
- Proporciona información de contacto cuando sea apropiado
- No inventes información que no tengas`

    const contents = []

    for (const msg of conversationHistory) {
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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:streamGenerateContent?key=${this.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Error ${response.status}: ${errorData.error?.message || response.statusText}`)
    }

    if (!response.body) {
      throw new Error("Response body is null")
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullContent = ""
    let buffer = ""
    let braceCount = 0
    let inObject = false
    let currentObject = ""

    try {
      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        buffer += decoder.decode(value, { stream: true })

        // Process character by character to properly handle JSON objects
        for (let i = 0; i < buffer.length; i++) {
          const char = buffer[i]

          if (char === "{") {
            braceCount++
            inObject = true
            currentObject += char
          } else if (char === "}") {
            currentObject += char
            braceCount--

            // When we have a complete object (braceCount returns to 0)
            if (braceCount === 0 && inObject) {
              try {
                const parsed = JSON.parse(currentObject)
                const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text

                if (text) {
                  fullContent += text
                  onChunk(text)
                }
              } catch (e) {
                // Skip invalid JSON
              }

              // Reset for next object
              currentObject = ""
              inObject = false
            }
          } else if (inObject) {
            currentObject += char
          }
        }

        // Clear the buffer after processing
        buffer = ""
      }
    } finally {
      reader.releaseLock()
    }

    return fullContent || "Lo siento, no pude generar una respuesta."
  }

  static detectIntent(message: string): string {
    const lowerMessage = message.toLowerCase()

    if (this.containsKeywords(lowerMessage, ["programa", "programas", "maestria", "doctorado", "especializacion"])) {
      return "programs"
    }

    if (this.containsKeywords(lowerMessage, ["admision", "requisitos", "inscripcion", "documentos"])) {
      return "admissions"
    }

    if (this.containsKeywords(lowerMessage, ["contacto", "telefono", "email", "direccion", "ubicacion"])) {
      return "contact"
    }

    if (this.containsKeywords(lowerMessage, ["costo", "precio", "pago", "arancel", "mensualidad"])) {
      return "costs"
    }

    if (this.containsKeywords(lowerMessage, ["horario", "cronograma", "fecha", "inicio", "duracion"])) {
      return "schedule"
    }

    return "general"
  }

  private static containsKeywords(text: string, keywords: string[]): boolean {
    return keywords.some((keyword) => text.includes(keyword))
  }

  private static findBestMatch(query: string, knowledgeItems: any[]): { item: any; confidence: number } | null {
    if (knowledgeItems.length === 0) return null

    const queryWords = query
      .toLowerCase()
      .split(" ")
      .filter((word) => word.length > 2)
    let bestMatch = null
    let bestScore = 0

    for (const item of knowledgeItems) {
      const questionWords = item.question.toLowerCase().split(" ")
      const keywords = item.keywords || []

      let score = 0
      let matches = 0

      queryWords.forEach((queryWord) => {
        if (questionWords.some((qWord: string) => qWord.includes(queryWord) || queryWord.includes(qWord))) {
          score += 2
          matches++
        }

        if (
          keywords.some(
            (keyword: string) => keyword.toLowerCase().includes(queryWord) || queryWord.includes(keyword.toLowerCase()),
          )
        ) {
          score += 3
          matches++
        }
      })

      const matchRatio = matches / queryWords.length
      const confidence = matchRatio * 0.7 + item.success_rate * 0.3

      if (confidence > bestScore) {
        bestScore = confidence
        bestMatch = { item, confidence }
      }
    }

    return bestMatch
  }

  private static async learnFromInteraction(userMessage: string, aiResponse: string, intent: string): Promise<void> {
    try {
      if (this.shouldLearnFromInteraction(userMessage, aiResponse)) {
        const keywords = this.extractKeywords(userMessage)
        await LearningSystem.addKnowledge(userMessage, aiResponse, intent, keywords, "learned")
      }

      await LearningSystem.detectPatterns()
    } catch (error) {
      console.error("Error learning from interaction:", error)
    }
  }

  private static shouldLearnFromInteraction(userMessage: string, aiResponse: string): boolean {
    if (userMessage.length < 10 || aiResponse.length < 50) return false
    if (aiResponse.includes("Error") || aiResponse.includes("Lo siento")) return false
    if (userMessage.toLowerCase().includes("hola") || userMessage.toLowerCase().includes("buenos")) return false

    return true
  }

  private static extractKeywords(message: string): string[] {
    const stopWords = [
      "el",
      "la",
      "de",
      "que",
      "y",
      "a",
      "en",
      "un",
      "es",
      "se",
      "no",
      "te",
      "lo",
      "le",
      "da",
      "su",
      "por",
      "son",
      "con",
      "para",
      "como",
      "pero",
      "sus",
      "del",
      "al",
      "me",
      "si",
      "mi",
      "tu",
      "yo",
      "ha",
      "he",
    ]

    return message
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(" ")
      .filter((word) => word.length > 3 && !stopWords.includes(word))
      .slice(0, 10)
  }

  static cleanResponse(text: string): string {
    return text
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  }
}
