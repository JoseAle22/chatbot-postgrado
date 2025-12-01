"use client"

import { useState } from "react"
import { StarRating } from "./star-rating"
import { Button } from "@/components/ui/button"

interface FeedbackWidgetProps {
  onSubmit?: (rating: number, comment?: string) => Promise<void>
  isOpen?: boolean
  onClose?: () => void
}

export function FeedbackWidget({ onSubmit, isOpen = true, onClose }: FeedbackWidgetProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) return

    setIsSubmitting(true)
    try {
      await onSubmit?.(rating, comment)
      setSubmitted(true)
      setTimeout(() => {
        setRating(0)
        setComment("")
        setSubmitted(false)
        onClose?.()
      }, 2000)
    } catch (error) {
      console.error("Error submitting feedback:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  if (submitted) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-green-700 font-medium">¡Gracias por tu calificación!</p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">¿Cómo fue tu experiencia?</label>
        <StarRating onRate={setRating} defaultValue={rating} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Comentarios (opcional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Cuéntanos más sobre tu experiencia..."
          className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      <Button onClick={handleSubmit} disabled={rating === 0 || isSubmitting} className="w-full">
        {isSubmitting ? "Enviando..." : "Enviar calificación"}
      </Button>
    </div>
  )
}
