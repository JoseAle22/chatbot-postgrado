"use client"

import { Button } from "@/components/ui/button"
import ChatBot from "./ChatBot"

const X = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

interface ChatModalProps {
  onClose: () => void
}

export default function ChatModal({ onClose }: ChatModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Fondo transparente oscuro */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Contenedor modal */}
      <div
        className="
          relative
          w-full h-full sm:w-80 sm:h-96
          md:w-auto md:h-auto md:max-w-6xl md:max-h-[90vh] md:m-4
          flex flex-col shadow-2xl border border-amber-200 bg-white rounded-lg
          animate-in slide-in-from-bottom-4 md:slide-in-from-bottom-8 fade-in duration-500 ease-out
        "
      >
        {/* Botón cerrar */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-700 rounded-full h-9 w-9 flex items-center justify-center shadow-md z-20"
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Contenido */}
        <div className="flex-1 overflow-hidden bg-white rounded-lg">
          <ChatBot isModal={true} onClose={onClose} />
        </div>
      </div>
    </div>
  )
}
