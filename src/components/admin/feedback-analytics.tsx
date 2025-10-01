
import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";

const FeedbackAnalytics: React.FC = () => {
  const [totalFeedback, setTotalFeedback] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [distribution, setDistribution] = useState<{ rating: number, count: number }[]>([]);
  const [recentComments, setRecentComments] = useState<{ comment: string, rating: number, created_at: string }[]>([]);
  const [filterRating, setFilterRating] = useState<string>("all");

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.FEEDBACK, []);
        setTotalFeedback(res.total);
        // Distribución de ratings (1-5)
        const dist = [1,2,3,4,5].map(rating => ({
          rating,
          count: res.documents.filter((fb: any) => fb.rating === rating).length
        }));
        setDistribution(dist);
        // Comentarios recientes (últimos 5)
        const comments = res.documents
          .filter((fb: any) => fb.comment && fb.comment.length > 0)
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
          .map((fb: any) => ({ comment: fb.comment, rating: fb.rating, created_at: fb.created_at }));
        setRecentComments(comments);
      } catch (err) {
        setTotalFeedback(null);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-bold text-2xl text-orange-700 mb-1">Feedback de Usuarios</h2>
          <p className="text-gray-600">Resumen de satisfacción y comentarios recientes</p>
        </div>
        <div className="flex gap-2 items-center">
          <span className="font-semibold text-amber-700">Filtrar por calificación:</span>
          <select value={filterRating} onChange={e => setFilterRating(e.target.value)} className="border rounded px-2 py-1">
            <option value="all">Todas</option>
            {[1,2,3,4,5].map(r => <option key={r} value={r}>{r} estrellas</option>)}
          </select>
        </div>
      </div>

      {/* Gráfica de distribución de ratings */}
      <div className="bg-white rounded-xl shadow p-6 border border-amber-200">
        <h3 className="text-lg font-bold text-amber-700 mb-4">Distribución de Calificaciones</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={distribution.filter(d => filterRating === "all" ? true : d.rating === Number(filterRating))}>
            <XAxis dataKey="rating" stroke="#fb923c" fontSize={14} label={{ value: "Estrellas", position: "insideBottom", offset: -5 }} />
            <YAxis stroke="#fb923c" fontSize={14} allowDecimals={false} />
            <Tooltip wrapperStyle={{ backgroundColor: '#fff', color: '#fb923c', border: '1px solid #fb923c' }} />
            <Bar dataKey="count" fill="#fb923c" radius={[8,8,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Comentarios recientes */}
      <div className="bg-white rounded-xl shadow p-6 border border-amber-200">
        <h3 className="text-lg font-bold text-amber-700 mb-4">Comentarios Recientes</h3>
        {loading ? (
          <span>Cargando...</span>
        ) : recentComments.length === 0 ? (
          <span className="text-gray-500">No hay comentarios recientes.</span>
        ) : (
          <ul className="space-y-4">
            {recentComments.map((fb, idx) => (
              <li key={idx} className="border-b pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-orange-600">{fb.rating}★</span>
                  <span className="text-xs text-gray-400">{new Date(fb.created_at).toLocaleDateString()}</span>
                </div>
                <span className="text-gray-700">{fb.comment}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Resumen rápido */}
      <div className="flex gap-6 items-center mt-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-6 py-4 text-center">
          <div className="text-3xl font-extrabold text-orange-700">{totalFeedback ?? 0}</div>
          <div className="text-xs text-amber-700">Total de feedback recibidos</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-6 py-4 text-center">
          <div className="text-3xl font-extrabold text-orange-700">{distribution.length > 0 ? (
            (distribution.reduce((acc, d) => acc + d.rating * d.count, 0) / (distribution.reduce((acc, d) => acc + d.count, 0) || 1)).toFixed(2)
          ) : "0.00"}</div>
          <div className="text-xs text-amber-700">Promedio de satisfacción</div>
        </div>
        <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg shadow transition">Exportar feedback</button>
      </div>
    </div>
  );
};

export default FeedbackAnalytics;
