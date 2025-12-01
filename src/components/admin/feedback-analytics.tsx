"use client"

import { StarRating } from "@/components/star-rating"
import { Card } from "@/components/ui/card"

interface FeedbackData {
  rating: number
  comment?: string
  timestamp?: string
  userId?: string
}

interface FeedbackAnalyticsProps {
  feedbackData?: FeedbackData[]
}

export function FeedbackAnalytics({ feedbackData = [] }: FeedbackAnalyticsProps) {
  // Calcular estadísticas
  const ratingDistribution = [0, 0, 0, 0, 0]
  const averageRating =
    feedbackData.length > 0 ? feedbackData.reduce((sum, f) => sum + f.rating, 0) / feedbackData.length : 0

  feedbackData.forEach((feedback) => {
    if (feedback.rating >= 1 && feedback.rating <= 5) {
      ratingDistribution[feedback.rating - 1]++
    }
  })

  return (
    <div className="space-y-6">
      {/* Resumen General */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Calificación Promedio</h3>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
              <StarRating readOnly defaultValue={Math.round(averageRating)} />
              <span className="text-sm text-gray-500">({feedbackData.length} calificaciones)</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Distribución de Calificaciones */}
      <Card className="p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Distribución de Calificaciones</h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = ratingDistribution[stars - 1]
            const percentage = feedbackData.length > 0 ? Math.round((count / feedbackData.length) * 100) : 0

            return (
              <div key={stars} className="flex items-center gap-4">
                <div className="w-28 flex items-center justify-end gap-2">
                  <span className="text-sm font-medium text-gray-600">{stars}</span>
                  <StarRating readOnly defaultValue={stars} size={16} />
                </div>
                <div className="flex-1">
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <div className="w-20 flex justify-end gap-2">
                  <span className="text-sm font-bold text-gray-700">{count}</span>
                  <span className="text-sm text-gray-400">({percentage}%)</span>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Lista de Comentarios */}
      {feedbackData.some((f) => f.comment) && (
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Comentarios de Usuarios</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {feedbackData
              .filter((f) => f.comment)
              .map((feedback, idx) => (
                <div key={idx} className="pb-4 border-b border-gray-200 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <StarRating readOnly defaultValue={feedback.rating} size={16} />
                    <span className="text-xs text-gray-500">
                      {feedback.timestamp ? new Date(feedback.timestamp).toLocaleString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      }) : ""}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{feedback.comment}</p>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  )
}
