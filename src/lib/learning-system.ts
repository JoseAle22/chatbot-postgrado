import { databases, DATABASE_ID, COLLECTIONS, generateId, Query } from "./appwrite"
import type { KnowledgeItem } from "./appwrite"

export class LearningSystem {
  // Save conversation to database
  static async saveConversation(sessionId: string, userId?: string): Promise<string> {
    try {
      const conversation = await databases.createDocument(DATABASE_ID, COLLECTIONS.CONVERSATIONS, generateId(), {
        user_id: userId,
        session_id: sessionId,
        started_at: new Date().toISOString(),
        total_messages: 0,
        resolved: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      return conversation.$id
    } catch (error) {
      console.error("Error saving conversation:", error)
      throw error
    }
  }

  // Save message to database
  static async saveMessage(
    conversationId: string,
    role: "user" | "assistant",
    content: string,
    intent?: string,
    confidenceScore?: number,
    responseTime?: number,
  ): Promise<void> {
    try {
      await databases.createDocument(DATABASE_ID, COLLECTIONS.MESSAGES, generateId(), {
        conversation_id: conversationId,
        role,
        content,
        intent,
        confidence_score: confidenceScore,
        response_time: responseTime,
        created_at: new Date().toISOString(),
      })

      // Update conversation message count
      await this.updateConversationStats(conversationId)
    } catch (error) {
      console.error("Error saving message:", error)
      throw error
    }
  }

  // Update conversation statistics
  static async updateConversationStats(conversationId: string): Promise<void> {
    try {
      const messages = await databases.listDocuments(DATABASE_ID, COLLECTIONS.MESSAGES, [
        Query.equal("conversation_id", conversationId),
      ])

      await databases.updateDocument(DATABASE_ID, COLLECTIONS.CONVERSATIONS, conversationId, {
        total_messages: messages.total,
        updated_at: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error updating conversation stats:", error)
    }
  }

  // Search knowledge base for similar questions
  static async searchKnowledge(query: string, category?: string): Promise<KnowledgeItem[]> {
    // Normaliza texto: minúsculas, elimina tildes y signos de puntuación
    const normalizeText = (text: string) =>
      text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Elimina tildes
        .replace(/[^\w\s]/gi, "") // Elimina signos de puntuación

    try {
      const queries = [Query.equal("is_active", true)]
      if (category) {
        queries.push(Query.equal("category", category))
      }
      const results = await databases.listDocuments(DATABASE_ID, COLLECTIONS.KNOWLEDGE_BASE, queries)

      const normalizedQuery = normalizeText(query || "")
      // Si no hay query, devolver todos los items (respetando categoría y activos)
      if (!normalizedQuery.trim()) {
        return results.documents as unknown as KnowledgeItem[]
      }
      const queryWords = normalizedQuery.split(" ").filter(Boolean)

      // Ponderar resultados: exactos primero, luego parciales
      const exactMatches: any[] = []
      const partialMatches: any[] = []

      for (const item of results.documents) {
        const keywords = (item.keywords || []).map((kw: string) => normalizeText(kw))
        const normalizedQuestion = normalizeText(item.question)
        const normalizedAnswer = normalizeText(item.answer || "")

        // Coincidencia exacta por frase completa en pregunta, respuesta o keywords
        if (
          normalizedQuestion === normalizedQuery ||
          normalizedAnswer === normalizedQuery ||
          keywords.includes(normalizedQuery)
        ) {
          exactMatches.push(item)
          continue
        }

        // Coincidencia parcial: alguna palabra del query está incluida en pregunta, respuesta o keywords
        const partial = queryWords.some(
          (word) =>
            normalizedQuestion.includes(word) ||
            normalizedAnswer.includes(word) ||
            keywords.some((keyword: string) => keyword.includes(word)),
        )
        if (partial) {
          partialMatches.push(item)
        }
      }

      // Devuelve primero los exactos, luego los parciales
      const filteredResults = [...exactMatches, ...partialMatches]
      return filteredResults as unknown as KnowledgeItem[]
    } catch (error) {
      console.error("Error searching knowledge base:", error)
      return []
    }
  }

  // List active knowledge items by category (no query filtering)
  static async listKnowledgeByCategory(category: string): Promise<KnowledgeItem[]> {
    try {
      const results = await databases.listDocuments(DATABASE_ID, COLLECTIONS.KNOWLEDGE_BASE, [
        Query.equal("is_active", true),
        Query.equal("category", category),
      ])
      return results.documents as unknown as KnowledgeItem[]
    } catch (error) {
      console.error("Error listing knowledge by category:", error)
      return []
    }
  }

  // Add new knowledge item
  static async addKnowledge(
    question: string,
    answer: string,
    category: string,
    keywords: string[],
    source = "manual",
  ): Promise<void> {
    try {
      // Sanitize and validate inputs to match Appwrite collection schema
      const toStr = (v: any) => (v === null || v === undefined ? "" : String(v))

      let safeQuestion = toStr(question).trim()
      let safeAnswer = toStr(answer).trim()

      // Remove control characters that may break Appwrite validation
      safeQuestion = safeQuestion.replace(/\s+/g, " ")
      safeAnswer = safeAnswer.replace(/\s+/g, " ")

      // Appwrite error says question must be <= 1000 chars — truncate to be safe
      if (safeQuestion.length > 1000) {
        console.warn("Question too long, truncating to 1000 chars")
        safeQuestion = safeQuestion.slice(0, 1000)
      }

      // Truncate answer to a reasonable length (keep some margin)
      if (safeAnswer.length > 5000) {
        console.warn("Answer too long, truncating to 5000 chars")
        safeAnswer = safeAnswer.slice(0, 5000)
      }

      // Ensure keywords is an array of strings
      const safeKeywords = Array.isArray(keywords) ? keywords.map((k) => toStr(k).trim()).filter(Boolean) : []

      // If question is empty after sanitization, skip creating the document
      if (!safeQuestion) {
        console.warn("Skipping addKnowledge: question is empty after sanitization")
        return
      }

      const payload = {
        question: safeQuestion,
        answer: safeAnswer,
        category: toStr(category),
        keywords: safeKeywords,
        usage_count: 0,
        success_rate: 0.0,
        created_by: "admin",
        source,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Debug log payload to help trace Appwrite 400 errors (remove in production)
      // Note: avoid logging large sensitive data in production environments
      console.debug("Adding knowledge payload:", payload)

      await databases.createDocument(DATABASE_ID, COLLECTIONS.KNOWLEDGE_BASE, generateId(), payload)
    } catch (error) {
      console.error("Error adding knowledge:", error)
      throw error
    }
  }

  // Update knowledge usage and success rate
  static async updateKnowledgeUsage(knowledgeId: string, wasHelpful: boolean): Promise<void> {
    try {
      const knowledge = await databases.getDocument(DATABASE_ID, COLLECTIONS.KNOWLEDGE_BASE, knowledgeId)

      const newUsageCount = (knowledge.usage_count || 0) + 1
      const currentSuccessRate = knowledge.success_rate || 0
      const newSuccessRate = wasHelpful
        ? (currentSuccessRate * (newUsageCount - 1) + 1) / newUsageCount
        : (currentSuccessRate * (newUsageCount - 1)) / newUsageCount

      await databases.updateDocument(DATABASE_ID, COLLECTIONS.KNOWLEDGE_BASE, knowledgeId, {
        usage_count: newUsageCount,
        success_rate: Math.round(newSuccessRate * 100) / 100,
        updated_at: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error updating knowledge usage:", error)
    }
  }

  // Detect and save learning patterns
  static async detectPatterns(): Promise<void> {
    try {
      // Get recent messages for pattern analysis
      const recentMessages = await databases.listDocuments(DATABASE_ID, COLLECTIONS.MESSAGES, [
        Query.equal("role", "user"),
        Query.orderDesc("created_at"),
        Query.limit(100),
      ])

      // Analyze frequent questions
      const questionFrequency: { [key: string]: number } = {}
      recentMessages.documents.forEach((message: any) => {
        const content = message.content.toLowerCase()
        const words = content.split(" ").filter((word: string | any[]) => word.length > 3)

        words.forEach((word: string | number) => {
          questionFrequency[word] = (questionFrequency[word] || 0) + 1
        })
      })

      // Save top patterns
      const topPatterns = Object.entries(questionFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)

      for (const [pattern, frequency] of topPatterns) {
        if (frequency > 3) {
          // Only save patterns that appear more than 3 times
          await this.savePattern("frequent_question", { keyword: pattern }, frequency)
        }
      }
    } catch (error) {
      console.error("Error detecting patterns:", error)
    }
  }

  // Save learning pattern
  static async savePattern(type: string, data: any, frequency: number): Promise<void> {
    try {
      // Check if pattern already exists
      const existing = await databases.listDocuments(DATABASE_ID, COLLECTIONS.LEARNING_PATTERNS, [
        Query.equal("pattern_type", type),
        Query.equal("pattern_data", JSON.stringify(data)),
      ])

      if (existing.documents.length > 0) {
        // Update existing pattern
        const pattern = existing.documents[0]
        await databases.updateDocument(DATABASE_ID, COLLECTIONS.LEARNING_PATTERNS, pattern.$id, {
          frequency: frequency,
          last_seen: new Date().toISOString(),
        })
      } else {
        // Create new pattern
        await databases.createDocument(DATABASE_ID, COLLECTIONS.LEARNING_PATTERNS, generateId(), {
          pattern_type: type,
          pattern_data: data,
          frequency,
          confidence: frequency > 5 ? 0.8 : 0.5,
          last_seen: new Date().toISOString(),
          created_at: new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error("Error saving pattern:", error)
    }
  }

  // Save user feedback
  static async saveFeedback(
    conversationId: string,
    feedbackType: string,
    rating?: number,
    comment?: string,
    messageId?: string,
  ): Promise<void> {
    try {
      await databases.createDocument(DATABASE_ID, COLLECTIONS.FEEDBACK, generateId(), {
        conversation_id: conversationId,
        message_id: messageId,
        feedback_type: feedbackType,
        rating,
        comment,
        processed: false,
        created_at: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error saving feedback:", error)
      throw error
    }
  }

  // Get analytics data
  static async getAnalytics(days = 7): Promise<any> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const [conversations, messages, feedback] = await Promise.all([
        databases.listDocuments(DATABASE_ID, COLLECTIONS.CONVERSATIONS, [
          Query.greaterThan("created_at", startDate.toISOString()),
        ]),
        databases.listDocuments(DATABASE_ID, COLLECTIONS.MESSAGES, [
          Query.greaterThan("created_at", startDate.toISOString()),
        ]),
        databases.listDocuments(DATABASE_ID, COLLECTIONS.FEEDBACK, [
          Query.greaterThan("created_at", startDate.toISOString()),
        ]),
      ])

      return {
        totalConversations: conversations.total,
        totalMessages: messages.total,
        totalFeedback: feedback.total,
        averageMessagesPerConversation: conversations.total > 0 ? Math.round(messages.total / conversations.total) : 0,
        feedbackByType: this.groupFeedbackByType(feedback.documents),
        dailyStats: this.calculateDailyStats(conversations.documents, messages.documents),
      }
    } catch (error) {
      console.error("Error getting analytics:", error)
      return null
    }
  }

  private static groupFeedbackByType(feedback: any[]): { [key: string]: number } {
    return feedback.reduce((acc, item) => {
      acc[item.feedback_type] = (acc[item.feedback_type] || 0) + 1
      return acc
    }, {})
  }

  private static calculateDailyStats(conversations: any[], messages: any[]): any[] {
    const dailyStats: { [key: string]: { conversations: number; messages: number } } = {}

    conversations.forEach((conv) => {
      const date = new Date(conv.created_at).toDateString()
      if (!dailyStats[date]) dailyStats[date] = { conversations: 0, messages: 0 }
      dailyStats[date].conversations++
    })

    messages.forEach((msg) => {
      const date = new Date(msg.created_at).toDateString()
      if (!dailyStats[date]) dailyStats[date] = { conversations: 0, messages: 0 }
      dailyStats[date].messages++
    })

    return Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      ...stats,
    }))
  }
}
