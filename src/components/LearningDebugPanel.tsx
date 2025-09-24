"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const Brain = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
    />
  </svg>
)

export default function LearningDebugPanel() {
  const [conversations, setConversations] = useState<any[]>([])
  const [stats, setStats] = useState({ totalQuestions: 0, totalCategories: 0 })

  const loadData = () => {
    try {
      const stored = JSON.parse(localStorage.getItem("ujap_conversations") || "[]")
      setConversations(stored)
      setStats({
        totalQuestions: stored.length,
        totalCategories: new Set(stored.map((c: any) => c.question.split(" ")[0])).size,
      })
    } catch (error) {
      console.error("Error loading conversations:", error)
    }
  }

  const clearData = () => {
    localStorage.removeItem("ujap_conversations")
    setConversations([])
    setStats({ totalQuestions: 0, totalCategories: 0 })
    console.log("[v0] 🗑️ Datos de aprendizaje eliminados")
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Panel de Verificación de Aprendizaje
        </CardTitle>
        <CardDescription>Aquí puedes verificar que el chatbot está aprendiendo correctamente</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.totalQuestions}</div>
            <div className="text-sm text-blue-800">Conversaciones Guardadas</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.totalCategories}</div>
            <div className="text-sm text-green-800">Categorías Diferentes</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{conversations.length > 0 ? "✅" : "❌"}</div>
            <div className="text-sm text-purple-800">Sistema Activo</div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline">
            🔄 Actualizar Datos
          </Button>
          <Button onClick={clearData} variant="destructive">
            🗑️ Limpiar Aprendizaje
          </Button>
        </div>

        {conversations.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Últimas 5 Conversaciones:</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {conversations
                .slice(-5)
                .reverse()
                .map((conv, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg text-sm">
                    <div className="font-medium text-gray-700">P: {conv.question}</div>
                    <div className="text-gray-600 mt-1 truncate">R: {conv.answer.substring(0, 100)}...</div>
                    <div className="text-xs text-gray-500 mt-1">{new Date(conv.timestamp).toLocaleString()}</div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
