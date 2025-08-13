"use client"

import { useState } from "react"
import ChatModal from "./ChatModal"
import MiniChat from "./MiniChat"

export default function FloatingChatButton() {
  const [showModal, setShowModal] = useState(false)
  const [showMiniChat, setShowMiniChat] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

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
      {!showMiniChat && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
          <div
            className={`bg-white text-gray-800 px-4 py-2 rounded-full shadow-lg border transition-all duration-300 whitespace-nowrap ${
              showTooltip ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none"
            }`}
          >
            <span className="text-sm font-medium">¿Necesitas ayuda?</span>
            <div className="absolute top-1/2 -right-1 w-2 h-2 bg-white border-r border-b transform rotate-45 -translate-y-1/2"></div>
          </div>

          <button
            onClick={handleButtonClick}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="h-20 w-20 sm:h-24 sm:w-24 bg-transparent hover:bg-transparent transition-all duration-300 group p-0 border-0 outline-none focus:outline-none animate-bounce hover:animate-none"
          >
            <img
              src="/images/avatar.png?height=80&width=80"
              alt="UJAP Assistant"
              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-125 animate-pulse group-hover:animate-none"
            />
          </button>
        </div>
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
