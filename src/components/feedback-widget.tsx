"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react"
import { LearningSystem } from "src/lib/learning-system.ts"

interface FeedbackWidgetProps {
  conversationId: string
  messageId?: string
  onFeedbackSubmitted?: () => void
}

export function FeedbackWidget({ conversationId, messageId, onFeedbackSubmitted }: FeedbackWidgetProps) {
  const [showFeedback, setShowFeedback] = useState(false)
  const [rating, setRating] = useState<number | null>(null)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleRating = async (newRating: number) => {
    setRating(newRating)
    setIsSubmitting(true)

    try {
      await LearningSystem.saveFeedback(
        conversationId,
        newRating > 0 ? "positive" : "negative",
        newRating,
        undefined,
        messageId,
      )

      if (newRating > 0) {
        setSubmitted(true)
        onFeedbackSubmitted?.()
      } else {
        setShowFeedback(true)
      }
    } catch (error) {
      console.error("Error submitting feedback:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCommentSubmit = async () => {
    if (!comment.trim()) return

    setIsSubmitting(true)
    try {
      await LearningSystem.saveFeedback(conversationId, "detailed_feedback", rating ?? undefined, comment, messageId)
      setSubmitted(true)
      onFeedbackSubmitted?.()
    } catch (error) {
      console.error("Error submitting detailed feedback:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MessageSquare className="h-4 w-4" />
        <span>¡Gracias por tu feedback!</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {!showFeedback ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">¿Te fue útil esta respuesta?</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRating(1)}
            disabled={isSubmitting}
            className="h-8 w-8 p-0"
          >
            <ThumbsUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRating(-1)}
            disabled={isSubmitting}
            className="h-8 w-8 p-0"
          >
            <ThumbsDown className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Card>
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-medium">¿Cómo podemos mejorar esta respuesta?</p>
            <Textarea
              placeholder="Comparte tus comentarios o sugerencias..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex gap-2">
              <Button onClick={handleCommentSubmit} disabled={!comment.trim() || isSubmitting} size="sm">
                {isSubmitting ? "Enviando..." : "Enviar"}
              </Button>
              <Button variant="outline" onClick={() => setShowFeedback(false)} size="sm">
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
