"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Plus, Search, Edit, Trash2, BookOpen, TrendingUp } from "lucide-react"
import { databases, DATABASE_ID, COLLECTIONS, Query } from "@/lib/appwrite"
import { LearningSystem } from "@/lib/learning-system"
import type { KnowledgeItem } from "@/lib/appwrite"

export function KnowledgeManager() {
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "",
    keywords: "",
  })

  const categories = ["programs", "admissions", "contact", "costs", "schedule", "general"]

  const categoryLabels: { [key: string]: string } = {
    programs: "Programas",
    admissions: "Admisiones",
    contact: "Contacto",
    costs: "Costos",
    schedule: "Horarios",
    general: "General",
  }

  const loadKnowledgeItems = async () => {
    setLoading(true)
    try {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.KNOWLEDGE_BASE, [
        Query.orderDesc("created_at"),
      ])
      setKnowledgeItems(response.documents as unknown as KnowledgeItem[])
    } catch (error) {
      console.error("Error loading knowledge items:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadKnowledgeItems()
  }, [])

  const filteredItems = knowledgeItems.filter((item) => {
    const matchesSearch =
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const keywords = formData.keywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k)

      if (editingItem) {
        // Update existing item
        await databases.updateDocument(DATABASE_ID, COLLECTIONS.KNOWLEDGE_BASE, editingItem.$id, {
          question: formData.question,
          answer: formData.answer,
          category: formData.category,
          keywords,
          updated_at: new Date().toISOString(),
        })
      } else {
        // Create new item
        await LearningSystem.addKnowledge(formData.question, formData.answer, formData.category, keywords, "manual")
      }

      // Reset form and reload
      setFormData({ question: "", answer: "", category: "", keywords: "" })
      setIsAddDialogOpen(false)
      setEditingItem(null)
      loadKnowledgeItems()
    } catch (error) {
      console.error("Error saving knowledge item:", error)
    }
  }

  const handleEdit = (item: KnowledgeItem) => {
    setEditingItem(item)
    setFormData({
      question: item.question,
      answer: item.answer,
      category: item.category,
      keywords: item.keywords?.join(", ") || "",
    })
    setIsAddDialogOpen(true)
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este elemento?")) return

    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.KNOWLEDGE_BASE, itemId)
      loadKnowledgeItems()
    } catch (error) {
      console.error("Error deleting knowledge item:", error)
    }
  }

  const resetForm = () => {
    setFormData({ question: "", answer: "", category: "", keywords: "" })
    setEditingItem(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Conocimiento</h2>
          <p className="text-muted-foreground">Administra la base de conocimiento del chatbot</p>
        </div>
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white font-semibold">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Conocimiento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl p-0 bg-white border-0 rounded-xl overflow-hidden">
            <div className="bg-white p-8 relative">
              
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-bold text-orange-700 mb-2">
                  {editingItem ? "Editar" : "Agregar"} Conocimiento
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  {editingItem ? "Modifica" : "Agrega"} información que el chatbot puede usar para responder preguntas.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="question">Pregunta</Label>
                  <Input
                    id="question"
                    value={formData.question}
                    onChange={(e) => setFormData((prev) => ({ ...prev, question: e.target.value }))}
                    placeholder="¿Cuáles son los requisitos de admisión?"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="answer">Respuesta</Label>
                  <Textarea
                    id="answer"
                    value={formData.answer}
                    onChange={(e) => setFormData((prev) => ({ ...prev, answer: e.target.value }))}
                    placeholder="Los requisitos de admisión incluyen..."
                    className="min-h-[100px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {categoryLabels[cat]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="keywords">Palabras Clave</Label>
                    <Input
                      id="keywords"
                      value={formData.keywords}
                      onChange={(e) => setFormData((prev) => ({ ...prev, keywords: e.target.value }))}
                      placeholder="admisión, requisitos, documentos"
                    />
                    <p className="text-xs text-muted-foreground">Separadas por comas</p>
                  </div>
                </div>

                <DialogFooter className="pt-6">
                  <Button 
                    type="submit" 
                    className="bg-amber-500 hover:bg-amber-600 text-white font-semibold w-full"
                  >
                    {editingItem ? "Actualizar Conocimiento" : "Agregar Conocimiento"}
                  </Button>
                </DialogFooter>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar en la base de conocimiento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {categoryLabels[cat]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Knowledge Items */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || selectedCategory !== "all"
                ? "No se encontraron elementos que coincidan con los filtros"
                : "No hay elementos en la base de conocimiento"}
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.$id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{item.question}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{categoryLabels[item.category] || item.category}</Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        <span>{item.usage_count || 0} usos</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {Math.round((item.success_rate || 0) * 100)}% éxito
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item.$id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">{item.answer}</p>
                {item.keywords && item.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.keywords.map((keyword, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}