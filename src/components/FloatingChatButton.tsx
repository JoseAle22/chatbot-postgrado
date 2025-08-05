"use client"

import { useState } from "react"
import { MessageCircle, Sparkles } from "lucide-react"
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
      {/* Enhanced Floating Button */}
      {!showMiniChat && (
        <Button
          onClick={handleButtonClick}
          className="fixed bottom-6 right-6 h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-2xl hover:shadow-3xl transition-all duration-300 z-40 group animate-bounce hover:animate-none border-2 border-white/20 backdrop-blur-sm"
        >
          <div className="relative">
            <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7 text-white transition-transform duration-300 group-hover:scale-110" />
            <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-300 animate-pulse" />
          </div>

          {/* Ripple effect */}
          <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
        </Button>
      )}

      {/* Mini Chat - Solo en desktop */}
      {showMiniChat && (
        <div className="fixed bottom-6 right-6 z-40 hidden md:block">
          <MiniChat onExpand={handleExpandMiniChat} onClose={handleCloseMiniChat} />
        </div>
      )}

      {/* Chat Modal */}
      {showModal && <ChatModal onClose={handleCloseModal} />}
    </>
  )
}
