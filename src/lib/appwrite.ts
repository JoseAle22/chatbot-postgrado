import { Client, Databases, Account, ID, Query } from "appwrite"

// Appwrite configuration
const client = new Client()
  .setEndpoint(import.meta.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
  .setProject(import.meta.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "68da0bce0032e08cea40")

export const databases = new Databases(client)
export const account = new Account(client)

// Database and Collection IDs
export const DATABASE_ID = import.meta.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "chatbot-postgrado"
export const COLLECTIONS = {
  CONVERSATIONS: "conversations",
  MESSAGES: "messages",
  KNOWLEDGE_BASE: "knowledge_base",
  LEARNING_PATTERNS: "learning_patterns",
  FEEDBACK: "feedback",
  ADMIN_ANALYTICS: "admin_analytics",
}

// Types
export interface Conversation {
  $id: string
  user_id?: string
  session_id: string
  started_at: string
  ended_at?: string
  total_messages: number
  user_satisfaction?: number
  resolved: boolean
  topic_category?: string
  created_at: string
  updated_at: string
}

export interface Message {
  $id: string
  conversation_id: string
  role: "user" | "assistant"
  content: string
  intent?: string
  confidence_score?: number
  response_time?: number
  feedback_rating?: number
  created_at: string
}

export interface KnowledgeItem {
  $id: string
  question: string
  answer: string
  category: string
  keywords: string[]
  usage_count: number
  success_rate: number
  created_by: string
  source: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LearningPattern {
  $id: string
  pattern_type: string
  pattern_data: any
  frequency: number
  confidence: number
  last_seen: string
  created_at: string
}

export interface Feedback {
  $id: string
  conversation_id: string
  message_id?: string
  feedback_type: string
  rating?: number
  comment?: string
  user_suggestion?: string
  processed: boolean
  created_at: string
}

// Utility functions
export const generateId = () => ID.unique()

export { client, Query }
