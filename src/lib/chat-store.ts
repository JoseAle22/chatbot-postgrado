"use client"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  error?: boolean
}

class ChatStore {
  private messages: Message[] = [
    {
      id: "welcome",
      role: "assistant",
      content:
        "¡Hola, soy UJAPITO! Tu asistente virtual de la Dirección de Postgrado UJAP. Puedo ayudarte con información sobre nuestros programas de Doctorado, Maestrías y Especializaciones, requisitos de admisión, contactos y más. ¿En qué puedo ayudarte hoy?",
    },
  ]
  private listeners: Set<(messages: Message[]) => void> = new Set()

  getMessages(): Message[] {
    return this.messages
  }

  addMessage(message: Message): void {
    this.messages = [...this.messages, message]
    this.notifyListeners()
  }

  setMessages(messages: Message[]): void {
    this.messages = messages
    this.notifyListeners()
  }

  subscribe(listener: (messages: Message[]) => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.messages))
  }
}

export const chatStore = new ChatStore()
