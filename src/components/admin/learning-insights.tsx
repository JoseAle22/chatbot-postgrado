
import React, { useEffect, useState } from "react";
import { databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";

const LearningInsights: React.FC = () => {
  const [totalPatterns, setTotalPatterns] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatterns = async () => {
      try {
        const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.LEARNING_PATTERNS);
        setTotalPatterns(res.total);
      } catch (err) {
        setTotalPatterns(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPatterns();
  }, []);

  return (
    <div>
      <h2 className="font-bold text-lg mb-2">Patrones de aprendizaje</h2>
      {loading ? <span>Cargando...</span> : <span>{totalPatterns ?? "Error"}</span>}
    </div>
  );
};

export default LearningInsights;
