
import React, { useEffect, useState } from "react";
import { databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";

const ConversationAnalytics: React.FC = () => {
  const [totalConversations, setTotalConversations] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CONVERSATIONS);
        setTotalConversations(res.total);
      } catch (err) {
        setTotalConversations(null);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  return (
    <div>
      <h2 className="font-bold text-lg mb-2">Conversaciones totales</h2>
      {loading ? <span>Cargando...</span> : <span>{totalConversations ?? "Error"}</span>}
    </div>
  );
};

export default ConversationAnalytics;
