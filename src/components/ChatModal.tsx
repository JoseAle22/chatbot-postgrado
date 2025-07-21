"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import ChatBot from "./ChatBot"

interface ChatModalProps {
  onClose: () => void
}

export default function ChatModal({ onClose }: ChatModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Content - SIN fondo blanco */}
      <div className="relative z-10 w-full h-full max-w-6xl max-h-[90vh] m-4">
        {/* Close button */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="absolute -top-12 right-0 text-white hover:bg-white/20 z-20"
        >
          <X className="h-5 w-5 mr-2" />
          Cerrar
        </Button>

        {/* ChatBot component */}
        <div className="h-full">
          <ChatBot isModal={true} onClose={onClose} />
        </div>
      </div>
    </div>
  )
}
