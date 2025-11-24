"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LearningSystem } from "@/lib/learning-system"
import type { KnowledgeItem } from "@/lib/appwrite"

// --- SVG Icons ---
const ChevronDown = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7 7 7 7-7" />
  </svg>
)

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

const GraduationCap = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
    />
  </svg>
)

const Phone = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    />
  </svg>
)

const Mail = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
)

interface Program {
  id: string
  name: string
  type: "doctorado" | "maestria" | "especializacion"
  coordinator: string
  description: string
  requirements: string[]
  duration: string
  modality: string
  icon: string
  image?: string
}

interface ProgramButtonsProps {
  programType: "clinicos" | "no-clinicos"
  onProgramSelectTitle: (title: string) => void
}

// Heurística: tipo por título
const inferTypeFromTitle = (title: string): Program["type"] => {
  const t = (title || "").toLowerCase()
  if (t.includes("doctorado")) return "doctorado"
  if (t.includes("maestr")) return "maestria"
  return "especializacion"
}

const iconForType = (type: Program["type"]) => {
  switch (type) {
    case "doctorado":
      return "🎓"
    case "maestria":
      return "💻"
    case "especializacion":
      return "📘"
    default:
      return "📘"
  }
}

// --- Lógica de Extracción Ajustada ---
function extractSummaryParts(answer: string) {
  const text = (answer || "").toString().trim()
  let about = ""
  let label = "Descripción" // Por defecto

  // Helper para extraer contenido de una sección
  const extractSection = (regex: RegExp) => {
    const match = text.match(regex)
    if (match && match[1]) {
      // Limpiar el texto capturado
      return match[1].trim().replace(/^[-*•\d\.)]+\s*/, "").split(/\n+/)[0]
    }
    return null
  }

  // 1. Intentar buscar "Objetivos" explícitamente
  const objetivosRegex = /(?:^|\n)(?:[*#]*\s*)Objetivos\s*[:\.]?\s*([\s\S]*?)(?=\n\s*(?:Grado|Perfil|Requisitos|Justificaci|Duraci|Evaluaci|Correo|[*#]+)|$)/i
  const foundObjective = extractSection(objetivosRegex)

  if (foundObjective) {
    about = foundObjective
    label = "Objetivo"
  } else {
    // 2. Si no hay objetivos, buscar "Justificación"
    const justifRegex = /(?:^|\n)(?:[*#]*\s*)Justificaci[oó]n\s*[:\.]?\s*([\s\S]*?)(?=\n\s*(?:Objetivos|Perfil|Visión|Grado)|$)/i
    const foundJustif = extractSection(justifRegex)
    
    if (foundJustif) {
      about = foundJustif
      label = "Descripción"
    } else {
      // 3. Fallback: Primer párrafo sustancial (Descripción generada)
      const cleanText = text.replace(/^(?:Autorizada|Aprobada|Creada)[\s\S]*?(?:Gaceta|CNU|Consejo|Resolución)[\s\S]*?[\.\n]+/i, "").trim()
      const firstPara = cleanText.split(/\n\n/)[0]
      if (firstPara && firstPara.length > 30) {
        about = firstPara.slice(0, 350) + (firstPara.length > 350 ? "..." : "")
        label = "Descripción"
      }
    }
  }

  // 4. Extracción de Duración (Mejorada para UJAP)
  let duration: string | undefined
  const durSectionMatch = text.match(/(?:^|\n)\s*Duraci[oó]n\s*[:\.]?([\s\S]{0,400}?)(?=\n\s*[A-Z]|$)/i)
  
  if (durSectionMatch && durSectionMatch[1]) {
    const durContent = durSectionMatch[1].replace(/\n/g, " ").trim()
    // Patrón para capturar "dos (2) años", "9 meses", etc.
    const timeRegex = /((?:un|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|\d+)\s*(?:\(\d+\))?\s*(?:años|año|meses|mes|semestres|trimestres)(?:\s*y\s*(?:un|dos|tres|cuatro|cinco|\d+)\s*(?:\(\d+\))?\s*(?:meses|mes))?)/i
    const specificTime = durContent.match(timeRegex)
    
    if (specificTime) {
      duration = specificTime[1]
    } else if (durContent.length < 80) {
      duration = durContent
    }
  }
  // Fallback duración genérica
  if (!duration) {
    const durGeneric = text.match(/\b(\d{1,2})\s*(años|año|meses|mes|trimestres|trimestre|semestres|semestre)\b/i)
    if (durGeneric) duration = `${durGeneric[1]} ${durGeneric[2]}`
  }

  // 5. Contacto
  const emailMatches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)
  const email = emailMatches ? emailMatches[0] : undefined

  let phone: string | undefined
  const contactSection = text.match(/Contacto\s*[:\.]?([\s\S]{0,300})/i)
  const textToSearchPhone = contactSection ? contactSection[1] : text
  const phoneCandidates = textToSearchPhone.match(/(?:\+58|0)(?:[\d\s().-]{8,})\d/g)
  
  if (phoneCandidates && phoneCandidates.length > 0) {
    phone = phoneCandidates.find(p => p.includes("+58")) || phoneCandidates[0]
    phone = phone.trim()
  }

  return { about, label, duration, email, phone }
}


export default function ProgramButtons({ programType, onProgramSelectTitle }: ProgramButtonsProps) {
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null)
  const [items, setItems] = useState<KnowledgeItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const fetched: KnowledgeItem[] = await LearningSystem.listKnowledgeByCategory("programs")

        const normalize = (t: string) =>
          (t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")

        const dentalSet = new Set([
          "bucal", "bucodental", "odontologia", "odontologico", "odontologicos", 
          "odontologica", "odontologicas", "ortodoncia", "periodoncia", 
          "endodoncia", "odontopediatria", "implante", "implantes", 
          "maxilofacial", "estomatologia"
        ])

        const filtered = fetched.filter((it) => {
          const kws = (it.keywords || []).map((k) => normalize(k || ""))
          const isClinical = kws.some((k) => {
            const tokens = k.split(/[^a-z0-9]+/).filter(Boolean)
            return tokens.some((tok) => dentalSet.has(tok))
          })
          return programType === "clinicos" ? isClinical : !isClinical
        })
        if (!cancelled) setItems(filtered)
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Error cargando programas")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [programType])

  const programs = useMemo((): Program[] => {
    const official = items.filter((it: any) => it.source !== "learned")
    return official.map((it: any) => {
      const type = inferTypeFromTitle(it.question)
      return {
        id: it.$id,
        name: it.question,
        type,
        coordinator: "",
        description: it.answer,
        requirements: [],
        duration: "",
        modality: "",
        icon: iconForType(type) ?? "📘",
        image: undefined,
      } as Program
    })
  }, [items])

  const toggleProgram = (programId: string) => {
    setExpandedProgram(expandedProgram === programId ? null : programId)
  }

  const getTypeColor = (type: Program["type"]) => {
    switch (type) {
      case "doctorado": return "bg-purple-100 text-purple-800 border-purple-200"
      case "maestria": return "bg-blue-100 text-blue-800 border-blue-200"
      case "especializacion": return "bg-green-100 text-green-800 border-green-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {programType === "clinicos" ? "Programas Clínicos" : "Programas No Clínicos"}
        </h3>
        <p className="text-sm text-gray-600">Selecciona un programa para ver información detallada</p>
      </div>

      {loading && (
        <Card className="border border-gray-200">
          <CardContent className="p-4 text-sm text-gray-600">Cargando programas...</CardContent>
        </Card>
      )}

      {error && (
        <Card className="border border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">{error}</CardContent>
        </Card>
      )}

      {!loading && !error && programs.length === 0 && (
        <Card className="border border-gray-200">
          <CardContent className="p-4 text-sm text-gray-600">
            No se encontraron programas en esta categoría.
          </CardContent>
        </Card>
      )}

      {!loading && !error && programs.map((program) => (
        <Card key={program.id} className="border border-gray-200 hover:border-amber-300 transition-all duration-200">
          <CardContent className="p-0">
            {/* Program Header Button */}
            <Button
              variant="ghost"
              className="w-full p-4 h-auto justify-between hover:bg-amber-50 rounded-lg"
              onClick={() => toggleProgram(program.id)}
            >
              <div className="flex items-center gap-3 text-left flex-1 min-w-0">
                <div className="text-2xl flex-shrink-0">{program.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 text-sm leading-tight break-words pr-2">
                    {program.name}
                  </div>
                  <div
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 border ${getTypeColor(program.type)}`}
                  >
                    {program.type.charAt(0).toUpperCase() + program.type.slice(1)}
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 ml-2">
                {expandedProgram === program.id ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </Button>

            {/* Expanded Content */}
            {expandedProgram === program.id && (
              <div className="border-t border-gray-100 p-4 bg-gray-50 animate-in slide-in-from-top-2 duration-300">
                {program.image && (
                  <div className="mb-4">
                    <img
                      src={program.image || "/placeholder.svg"}
                      alt={program.name}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}

                {/* Program Details (Formato Original Restaurado) */}
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm mb-1">Resumen</h4>
                    {(() => {
                      const { about, label, duration, email, phone } = extractSummaryParts(program.description || "")
                      const hasContact = email || phone
                      return (
                        <ul className="text-sm text-gray-700 space-y-1 list-disc pl-4">
                          <li>
                            {/* Etiqueta dinámica: Objetivo o Descripción */}
                            <span className="font-medium text-gray-800">{label}: </span>
                            <span className="text-gray-700">{about}</span>
                          </li>
                          {duration && (
                            <li>
                              <span className="font-medium text-gray-800">Duración: </span>
                              <span className="text-gray-700">{duration}</span>
                            </li>
                          )}
                          {hasContact && (
                            <li>
                              <span className="font-medium text-gray-800">Contacto: </span>
                              <span className="text-gray-700">
                                {email && <span className="break-all">{email}</span>}
                                {email && phone && <span> | </span>}
                                {phone && <span>{phone}</span>}
                              </span>
                            </li>
                          )}
                        </ul>
                      )
                    })()}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-200">
                    <Button
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700 text-white flex-1 text-xs sm:text-sm"
                      onClick={() => onProgramSelectTitle(program.name)}
                    >
                      <GraduationCap className="h-4 w-4 mr-1 sm:mr-2" />
                      Más información
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent flex-1 text-xs sm:text-sm"
                    >
                      <Phone className="h-4 w-4 mr-1 sm:mr-2" />
                      Contactar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Contact Information */}
      <Card className="border border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="text-center">
            <h4 className="font-semibold text-amber-800 mb-2">¿Necesitas más información?</h4>
            <div className="flex flex-col gap-2 justify-center items-center text-xs sm:text-sm text-amber-700">
              <div className="flex items-center gap-1 break-all">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>coordinacion.postgrado@ujap.edu.ve</span>
              </div>
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+58 241-8710903</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}