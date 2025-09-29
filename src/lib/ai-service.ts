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
  private static readonly GEMINI_API_KEY = process.env.VITE_GOOGLE_GENERATIVE_AI_API_KEY

  // Enhanced response generation with learning capabilities
  static async generateResponse(
    userMessage: string,
    conversationHistory: any[],
    conversationId: string,
  ): Promise<AIResponse> {
    const startTime = Date.now()

    try {
      // First, search knowledge base for similar questions
      const intent = this.detectIntent(userMessage)
      const knowledgeResults = await LearningSystem.searchKnowledge(userMessage, intent)

      // If we find high-confidence knowledge base results, use them
      if (knowledgeResults.length > 0) {
        const bestMatch = this.findBestMatch(userMessage, knowledgeResults)
        if (bestMatch && bestMatch.confidence > this.CONFIDENCE_THRESHOLD) {
          // Update knowledge usage
          await LearningSystem.updateKnowledgeUsage(bestMatch.item.$id, true)

          return {
            content: bestMatch.item.answer,
            confidence: bestMatch.confidence,
            source: "knowledge_base",
            knowledgeId: bestMatch.item.$id,
            intent,
            responseTime: Date.now() - startTime,
          }
        }
      }

      // If no good knowledge base match, use Gemini with enhanced context
      const geminiResponse = await this.callGeminiWithContext(userMessage, conversationHistory, knowledgeResults)

      // Learn from this interaction
      await this.learnFromInteraction(userMessage, geminiResponse, intent, conversationId)

      return {
        content: geminiResponse,
        confidence: 0.8, // Gemini responses get default confidence
        source: knowledgeResults.length > 0 ? "hybrid" : "gemini",
        intent,
        responseTime: Date.now() - startTime,
      }
    } catch (error) {
      console.error("Error generating AI response:", error)
      throw error
    }
  }

  // Detect user intent from message
  private static detectIntent(message: string): string {
    const lowerMessage = message.toLowerCase()

    // Program-related intents
    if (this.containsKeywords(lowerMessage, ["programa", "programas", "maestria", "doctorado", "especializacion"])) {
      return "programs"
    }

    // Admission-related intents
    if (this.containsKeywords(lowerMessage, ["admision", "requisitos", "inscripcion", "documentos"])) {
      return "admissions"
    }

    // Contact-related intents
    if (this.containsKeywords(lowerMessage, ["contacto", "telefono", "email", "direccion", "ubicacion"])) {
      return "contact"
    }

    // Cost-related intents
    if (this.containsKeywords(lowerMessage, ["costo", "precio", "pago", "arancel", "mensualidad"])) {
      return "costs"
    }

    // Schedule-related intents
    if (this.containsKeywords(lowerMessage, ["horario", "cronograma", "fecha", "inicio", "duracion"])) {
      return "schedule"
    }

    return "general"
  }

  private static containsKeywords(text: string, keywords: string[]): boolean {
    return keywords.some((keyword) => text.includes(keyword))
  }

  // Find best matching knowledge item
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

      // Score based on word matches
      queryWords.forEach((queryWord) => {
        // Check question words
        if (questionWords.some((qWord: string) => qWord.includes(queryWord) || queryWord.includes(qWord))) {
          score += 2
          matches++
        }

        // Check keywords
        if (
          keywords.some(
            (keyword: string) => keyword.toLowerCase().includes(queryWord) || queryWord.includes(keyword.toLowerCase()),
          )
        ) {
          score += 3
          matches++
        }
      })

      // Calculate confidence based on matches and success rate
      const matchRatio = matches / queryWords.length
      const confidence = matchRatio * 0.7 + item.success_rate * 0.3

      if (confidence > bestScore) {
        bestScore = confidence
        bestMatch = { item, confidence }
      }
    }

    return bestMatch
  }

  // Enhanced Gemini call with knowledge context
  private static async callGeminiWithContext(
    userMessage: string,
    conversationHistory: any[],
    knowledgeContext: any[],
  ): Promise<string> {
    if (!this.GEMINI_API_KEY) {
      throw new Error("API key no configurada")
    }

    // Build enhanced system prompt with knowledge context
    let systemPrompt = `Eres UJAPITO, asistente virtual especializado en la Dirección de Postgrado de la Universidad José Antonio Páez (UJAP).

INFORMACIÓN CONTEXTUAL RELEVANTE:`

    // Add relevant knowledge context
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

    // Prepare conversation for Gemini
    const contents = [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
      {
        role: "model",
        parts: [{ text: "Entendido. Soy UJAPITO, tu asistente especializado en postgrado UJAP." }],
      },
    ]

    // Add conversation history (last 6 messages)
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

    // Add current message
    contents.push({
      role: "user",
      parts: [{ text: userMessage }],
    })

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.GEMINI_API_KEY}`,
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

  // Learn from successful interactions
  private static async learnFromInteraction(
    userMessage: string,
    aiResponse: string,
    intent: string,
    conversationId: string,
  ): Promise<void> {
    try {
      // Extract potential new knowledge
      if (this.shouldLearnFromInteraction(userMessage, aiResponse)) {
        const keywords = this.extractKeywords(userMessage)

        // Add to knowledge base as a learned item
        await LearningSystem.addKnowledge(userMessage, aiResponse, intent, keywords, "learned")
      }

      // Update learning patterns
      await LearningSystem.detectPatterns()
    } catch (error) {
      console.error("Error learning from interaction:", error)
    }
  }

  // Determine if we should learn from this interaction
  private static shouldLearnFromInteraction(userMessage: string, aiResponse: string): boolean {
    // Don't learn from very short messages or generic responses
    if (userMessage.length < 10 || aiResponse.length < 50) return false

    // Don't learn from error messages
    if (aiResponse.includes("Error") || aiResponse.includes("Lo siento")) return false

    // Don't learn from greetings
    if (userMessage.toLowerCase().includes("hola") || userMessage.toLowerCase().includes("buenos")) return false

    return true
  }

  // Extract keywords from user message
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
      .slice(0, 10) // Limit to 10 keywords
  }

  // Clean response text
  static cleanResponse(text: string): string {
    return text
      .replace(/\*/g, "")
      .replace(/^- /gm, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  }
}
