"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, X } from "lucide-react"
import MiniChat from "./MiniChat"
import ChatModal from "./ChatModal"

export default function FloatingChatButton() {
  const [isMiniChatOpen, setIsMiniChatOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleToggleMiniChat = () => {
    setIsMiniChatOpen(!isMiniChatOpen)
  }

  const handleExpandToModal = () => {
    setIsMiniChatOpen(false)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      {/* Botón flotante */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleToggleMiniChat}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
        >
          {isMiniChatOpen ? <X className="h-6 w-6 text-white" /> : <MessageCircle className="h-6 w-6 text-white" />}
        </Button>
      </div>

      {/* Mini chat */}
      {isMiniChatOpen && (
        <div className="fixed bottom-24 right-6 z-40">
          <MiniChat onExpand={handleExpandToModal} onClose={() => setIsMiniChatOpen(false)} />
        </div>
      )}

      {/* Modal del chat completo */}
      {isModalOpen && <ChatModal onClose={handleCloseModal} />}
    </>
  )
}
