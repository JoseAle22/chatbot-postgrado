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
      {/* Animated overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div
        className="
          relative
          w-full h-full max-w-none max-h-none
          sm:w-80 sm:h-96
          md:w-auto md:h-auto md:max-w-7xl md:max-h-[90vh] md:m-4
          animate-in slide-in-from-bottom-4 md:slide-in-from-bottom-8 fade-in duration-500 ease-out
          flex flex-col shadow-2xl border-amber-200 bg-white rounded-lg
        "
        style={{
          width: "100vw",
          height: "100vh", // <-- usa vh en vez de dvh
          maxWidth: "100vw",
          maxHeight: "100vh", // <-- usa vh en vez de dvh
          background: "#fff", // <-- asegúrate de fondo blanco
          zIndex: 100, // <-- asegúrate que esté por encima
        }}
      >
        {/* Close button - Solo visible en desktop */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="absolute -top-14 right-0 text-white hover:text-gray-200 hover:bg-white/10 z-20 hidden md:flex backdrop-blur-sm border border-white/20 rounded-full h-10 w-10 p-0 transition-all duration-200 hover:scale-105"
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="flex-1 overflow-y-auto bg-white">
          <ChatBot isModal={true} onClose={onClose} />
        </div>
      </div>
    </div>
  )
}
