"use client"

import ChatBot from "./ChatBot"

const X = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

interface ChatModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ChatModal({ isOpen, onClose }: ChatModalProps) {
  if (!isOpen) return null


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
          w-full h-full sm:w-full sm:h-[92vh]
          md:w-auto md:h-auto md:max-w-7xl md:max-h-[95vh] md:m-6
          flex flex-col shadow-2xl border border-amber-200 bg-white rounded-lg
          animate-in slide-in-from-bottom-4 md:slide-in-from-bottom-8 fade-in duration-500 ease-out
        "
      >
        {/* Contenedor de botones (cerrar + iniciar sesión) en la esquina superior derecha */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
          <button
            onClick={() => (window.location.href = "/login")}
            className="bg-amber-600 hover:bg-amber-700 text-white rounded-full px-3 py-1 text-sm shadow-md border-none"
          >
            Iniciar sesión
          </button>

          <button
            onClick={onClose}
            className="bg-white/90 hover:bg-white text-gray-700 rounded-full h-9 w-9 flex items-center justify-center shadow-md border-none"
            aria-label="Cerrar chat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-hidden bg-white rounded-lg">
          <ChatBot isModal={true} onClose={onClose} />
        </div>
      </div>
    </div>
  )
}
