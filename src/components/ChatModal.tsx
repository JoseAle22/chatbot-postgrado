"use client"

import ChatBot from "./ChatBot"

interface ChatModalProps {
  onClose: () => void
}

export default function ChatModal({ onClose }: ChatModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      {/* Modal ocupa toda la pantalla */}
      <div className="h-full w-full">
        <ChatBot isModal={true} onClose={onClose} />
      </div>
    </div>
  )
}
