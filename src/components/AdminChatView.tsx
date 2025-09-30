import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";

type AdminMessage = {
  id: string;
  role: string;
  content: string;
  timestamp: number;
};

export default function AdminChatView() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    const adminMessage: AdminMessage = {
      id: Date.now().toString(),
      role: "admin",
      content: input,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, adminMessage]);
    await addDoc(collection(db, "chatMessages"), adminMessage);
    setInput("");
    setIsLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Vista Administrador Chatbot</h2>
      <div className="mb-4">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-2">
            <span className="font-semibold">{msg.role}:</span> {msg.content}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe un mensaje como administrador..."
        />
        <Button onClick={handleSend} disabled={isLoading}>
          Enviar
        </Button>
      </div>
    </div>
  );
}
