"use client"

import { useState } from "react"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import ChatModal from "./ChatModal"
import MiniChat from "./MiniChat"

export default function FloatingChatButton() {
  const [showModal, setShowModal] = useState(false)
  const [showMiniChat, setShowMiniChat] = useState(false)

  const handleButtonClick = () => {
    // En móvil, abrir directamente el modal
    // En desktop, mostrar mini chat primero
    if (window.innerWidth < 768) {
      setShowModal(true)
    } else {
      setShowMiniChat(true)
    }
  }

  const handleExpandMiniChat = () => {
    setShowMiniChat(false)
    setShowModal(true)
  }

  const handleCloseMiniChat = () => {
    setShowMiniChat(false)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  return (
    <>
      {/* Floating Button */}
      {!showMiniChat && (
        <Button
          onClick={handleButtonClick}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-300 z-40"
        >
          <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </Button>
      )}

      {/* Mini Chat - Solo en desktop */}
      {showMiniChat && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 hidden md:block">
          <MiniChat onExpand={handleExpandMiniChat} onClose={handleCloseMiniChat} />
        </div>
      )}

      {/* Chat Modal */}
      {showModal && <ChatModal onClose={handleCloseModal} />}
    </>
  )
}
