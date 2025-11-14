"use client"

import { useState, useEffect } from "react"
import { account, databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite"

// Appwrite config for keepalive logout
const APPWRITE_ENDPOINT = (import.meta.env.NEXT_PUBLIC_APPWRITE_ENDPOINT as string) || "https://cloud.appwrite.io/v1"
const APPWRITE_PROJECT = (import.meta.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string) || "68da0bce0032e08cea40"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Database, BarChart3, Clock } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import { KnowledgeManager } from "./knowledge-manager"
import LearningInsights from "./learning-insights"
import FeedbackAnalytics from "./feedback-analytics"

interface DashboardStats {
  totalConversations: number
  avgResponseTime: number
  satisfactionRate: number
  knowledgeBaseSize: number
  learningPatterns: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeTab, setActiveTab] = useState("knowledge");
  const [loading, setLoading] = useState(true);
  const handleLogout = async () => {
    await account.deleteSession("current");
    window.location.href = "/login";
  };

  useEffect(() => {
    // Cargar datos reales
    const fetchStats = async () => {
      try {
        setLoading(true);
        const conversations = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CONVERSATIONS);
        const messages = await databases.listDocuments(DATABASE_ID, COLLECTIONS.MESSAGES);
        const feedback = await databases.listDocuments(DATABASE_ID, COLLECTIONS.FEEDBACK);
        const knowledge = await databases.listDocuments(DATABASE_ID, COLLECTIONS.KNOWLEDGE_BASE);
        const patterns = await databases.listDocuments(DATABASE_ID, COLLECTIONS.LEARNING_PATTERNS);

        // Calcular métricas
        const totalConversations = conversations.total;
        const avgResponseTime = messages.total > 0 ? (
          messages.documents.reduce((acc, msg) => acc + (msg.response_time || 0), 0) / messages.total
        ) : 0;
        const satisfactionRate = feedback.total > 0 ? (
          feedback.documents.reduce((acc, fb) => acc + (fb.rating || 0), 0) / feedback.total
        ) : 0;
        const knowledgeBaseSize = knowledge.total;
        const learningPatterns = patterns.total;

        setStats({
          totalConversations,
          avgResponseTime: Number(avgResponseTime.toFixed(2)),
          satisfactionRate: Number(satisfactionRate.toFixed(2)),
          knowledgeBaseSize,
          learningPatterns,
        });
      } catch (err) {
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();

    // Cerrar sesión al cerrar la pestaña
    const handleTabClose = () => {
      try {
        // Use fetch with keepalive to ensure the request is sent even when the page unloads
        const endpoint = `${APPWRITE_ENDPOINT.replace(/\/$/, "")}/account/sessions/current`
        navigator && (fetch as any)(endpoint, {
          method: "DELETE",
          keepalive: true,
          credentials: "include",
          headers: {
            "X-Appwrite-Project": APPWRITE_PROJECT,
          },
        })
      } catch (err) {
        // Fallback to SDK call (may be aborted in some browsers)
        try {
          void account.deleteSession("current")
        } catch (e) {
          // ignore
        }
      }
    }

    window.addEventListener("beforeunload", handleTabClose)
    return () => {
      window.removeEventListener("beforeunload", handleTabClose)
    }
  }, []);

  return (
  <div className="min-h-screen bg-gray-50 py-8 px-4">
    {/* Header institucional */}
    <div className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 shadow-lg mb-10 px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <BarChart3 className="w-12 h-12 text-white drop-shadow-lg" />
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-1">Panel de Administración</h1>
          <p className="text-lg text-amber-100 font-medium">UJAPITO &mdash; Dirección de Postgrado</p>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="bg-white text-orange-600 px-6 py-3 rounded-lg font-bold shadow hover:bg-orange-100 hover:text-orange-700 transition border-2 border-orange-500"
      >
        Cerrar sesión
      </button>
    </div>

      {/* Main Dashboard Tabs */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 items-stretch">
          <button
            className={`w-full flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-xl font-bold shadow transition text-lg border-2 ${activeTab === "knowledge" ? "bg-orange-100 text-orange-700 border-orange-400" : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300"}`}
            onClick={() => setActiveTab("knowledge")}
          >
            <Database className="w-8 h-8 mb-1" />
            Base de Conocimiento
          </button>
          <button
            className={`w-full flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-xl font-bold shadow transition text-lg border-2 ${activeTab === "analytics" ? "bg-orange-100 text-orange-700 border-orange-400" : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300"}`}
            onClick={() => setActiveTab("analytics")}
          >
            <BarChart3 className="w-8 h-8 mb-1" />
            Analíticas
          </button>
          <button
            className={`w-full flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-xl font-bold shadow transition text-lg border-2 ${activeTab === "feedback" ? "bg-orange-100 text-orange-700 border-orange-400" : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300"}`}
            onClick={() => setActiveTab("feedback")}
          >
            <MessageSquare className="w-8 h-8 mb-1" />
            Feedback
          </button>
        </div>
        <div className="mt-4">
          {activeTab === "knowledge" && <KnowledgeManager />}
          {activeTab === "analytics" && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
              {loading || !stats ? (
                <div className="col-span-3 text-center py-8 text-amber-600 font-bold">No se pudieron cargar las analíticas.</div>
              ) : (
                <>
                  {/* Cards resumen */}
                  <div className="col-span-1 flex flex-col gap-6">
                    <Card className="bg-gradient-to-br from-amber-50 to-amber-200 border-amber-300 shadow-lg rounded-xl">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-bold text-amber-700">Conversaciones</CardTitle>
                        <MessageSquare className="h-8 w-8 text-amber-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-extrabold text-amber-700">{stats.totalConversations}</div>
                        <p className="text-xs text-amber-600">Total de conversaciones registradas</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-amber-50 to-yellow-100 border-yellow-300 shadow-lg rounded-xl">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-bold text-yellow-700">Base Conocimiento</CardTitle>
                        <Database className="h-8 w-8 text-yellow-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-extrabold text-yellow-700">{stats.knowledgeBaseSize}</div>
                        <p className="text-xs text-yellow-600">Entradas en la base de conocimiento</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Gráficos */}
                  <div className="col-span-2 grid grid-cols-1 gap-8">
                    {/* Gráfico de barras: Conversaciones y Conocimiento */}
                    <div className="bg-white rounded-xl shadow p-6 border border-amber-200">
                      <h3 className="text-lg font-bold text-amber-700 mb-4">Resumen General</h3>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={[{ name: "Conversaciones", value: stats.totalConversations }, { name: "Conocimiento", value: stats.knowledgeBaseSize }]}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <XAxis dataKey="name" stroke="#fb923c" fontSize={14} />
                          <YAxis stroke="#fb923c" fontSize={14} />
                          <Tooltip wrapperStyle={{ backgroundColor: '#fff', color: '#fb923c', border: '1px solid #fb923c' }} />
                          <Bar dataKey="value" fill="#fb923c" radius={[8,8,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Gráfico circular: Satisfacción y Patrones */}
                    <div className="bg-white rounded-xl shadow p-6 border border-amber-200">
                      <h3 className="text-lg font-bold text-amber-700 mb-4">Satisfacción y Patrones IA</h3>
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={[{ name: "Satisfacción", value: stats.satisfactionRate }, { name: "Patrones IA", value: stats.learningPatterns }]}
                            dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                            <Cell key="satisfaccion" fill="#fb923c" />
                            <Cell key="patrones" fill="#f59e42" />
                          </Pie>
                          <Legend />
                          <Tooltip wrapperStyle={{ backgroundColor: '#fff', color: '#fb923c', border: '1px solid #fb923c' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Card: Tiempo de respuesta */}
                    <Card className="bg-gradient-to-br from-gray-50 to-amber-100 border-amber-200 shadow-lg rounded-xl">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-bold text-amber-700">Tiempo Respuesta</CardTitle>
                        <Clock className="h-8 w-8 text-amber-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-extrabold text-amber-700">{stats.avgResponseTime}s</div>
                        <p className="text-xs text-amber-600">Promedio de tiempo de respuesta</p>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>
          )}
          {activeTab === "feedback" && <FeedbackAnalytics />}
          {activeTab === "patterns" && <LearningInsights />}
        </div>
      </div>
      {/* Puedes agregar aquí el resto de los tabs y sus componentes según la lógica que prefieras */}
    </div>
  );
}
