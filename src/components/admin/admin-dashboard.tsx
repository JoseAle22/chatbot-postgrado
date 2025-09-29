"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Users, TrendingUp, Brain, Database, BarChart3, Clock, CheckCircle } from "lucide-react"
import ConversationAnalytics from "@/components/admin/analytics-dashboard"
import { KnowledgeManager } from "@/components/admin/knowledge-manager"
import LearningInsights from "@/components/admin/"
import FeedbackAnalytics from "./feedback-analytics"

interface DashboardStats {
  totalConversations: number
  activeUsers: number
  avgResponseTime: number
  satisfactionRate: number
  knowledgeBaseSize: number
  learningPatterns: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalConversations: 0,
    activeUsers: 0,
    avgResponseTime: 0,
    satisfactionRate: 0,
    knowledgeBaseSize: 0,
    learningPatterns: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carga de datos del dashboard
    const loadDashboardData = async () => {
      try {
        // En una implementación real, esto vendría de la API
        setStats({
          totalConversations: 1247,
          activeUsers: 89,
          avgResponseTime: 1.2,
          satisfactionRate: 4.3,
          knowledgeBaseSize: 156,
          learningPatterns: 23,
        })
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-600">Sistema de Aprendizaje Inteligente UJAPITO</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Sistema Activo
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversaciones</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConversations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% desde el mes pasado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">+5% esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Respuesta</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgResponseTime}s</div>
            <p className="text-xs text-muted-foreground">-0.3s mejora</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfacción</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.satisfactionRate}/5</div>
            <p className="text-xs text-muted-foreground">+0.2 puntos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Base Conocimiento</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.knowledgeBaseSize}</div>
            <p className="text-xs text-muted-foreground">+8 nuevas entradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patrones IA</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.learningPatterns}</div>
            <p className="text-xs text-muted-foreground">+3 identificados</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="knowledge">
            <Database className="w-4 h-4 mr-2" />
            Conocimiento
          </TabsTrigger>
          <TabsTrigger value="learning">
            <Brain className="w-4 h-4 mr-2" />
            Aprendizaje
          </TabsTrigger>
          <TabsTrigger value="feedback">
            <MessageSquare className="w-4 h-4 mr-2" />
            Feedback
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          <ConversationAnalytics />
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          <KnowledgeManager />
        </TabsContent>

        <TabsContent value="learning" className="space-y-4">
          <LearningInsights />
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <FeedbackAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  )
}
