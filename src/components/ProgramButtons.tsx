"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// SVG Icon Components
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
  onProgramSelect: (program: Program) => void
}

const clinicalPrograms: Program[] = [
  {
    id: "odontopediatria",
    name: "Especialización en Odontopediatría",
    type: "especializacion",
    coordinator: "Esp. Adriana Materán",
    description:
      "Especialización enfocada en la atención odontológica integral de niños y adolescentes, con énfasis en prevención, diagnóstico y tratamiento de patologías bucodentales en pacientes pediátricos.",
    requirements: [
      "Título de Odontólogo",
      "Experiencia mínima de 2 años",
      "Certificado de salud",
      "Entrevista personal",
    ],
    duration: "3 años",
    modality: "Presencial",
    icon: "🦷",
    image: "/images/odontpedia.jpg",
  },
]

const nonClinicalPrograms: Program[] = [
  {
    id: "ciencias-educacion",
    name: "Doctorado en Ciencias de la Educación",
    type: "doctorado",
    coordinator: "Dra. Haydee Páez",
    description:
      "Programa doctoral orientado a la formación de investigadores de alto nivel en el campo educativo, con énfasis en innovación pedagógica y desarrollo sustentable.",
    requirements: [
      "Título de Maestría",
      "Propuesta de tesis doctoral",
      "Dos referencias académicas",
      "Entrevista personal",
    ],
    duration: "4 años",
    modality: "Semipresencial",
    icon: "🎓",
    image: "/images/cienciaseducacion.webp",
  },
  {
    id: "orientacion",
    name: "Doctorado en Orientación",
    type: "doctorado",
    coordinator: "Dra. Omaira Lessire de González",
    description:
      "Programa doctoral especializado en orientación educativa y vocacional, formando investigadores en el área de desarrollo humano y orientación profesional.",
    requirements: [
      "Título de Maestría en área afín",
      "Experiencia en orientación",
      "Propuesta de investigación",
      "Entrevista académica",
    ],
    duration: "4 años",
    modality: "Semipresencial",
    icon: "🧭",
    image: "/images/cienciasorientiacion.webp",
  },
  {
    id: "gerencia-comunicacion",
    name: "Maestría en Gerencia de la Comunicación Organizacional",
    type: "maestria",
    coordinator: "Dra. Thania Oberto",
    description:
      "Maestría enfocada en la gestión estratégica de la comunicación en organizaciones, desarrollando competencias en comunicación corporativa y relaciones públicas.",
    requirements: [
      "Título universitario",
      "Experiencia laboral mínima 2 años",
      "Entrevista personal",
      "Prueba de admisión",
    ],
    duration: "2 años",
    modality: "Semipresencial",
    icon: "📢",
    image: "/images/cienciasgerencia.webp",
  },
  {
    id: "gerencia-tecnologia",
    name: "Maestría en Gerencia y Tecnología de la Información",
    type: "maestria",
    coordinator: "MSc. Susan León",
    description:
      "Programa orientado a formar profesionales capaces de gestionar proyectos tecnológicos y liderar la transformación digital en organizaciones.",
    requirements: [
      "Título en área tecnológica o afín",
      "Conocimientos básicos de programación",
      "Experiencia en TI",
      "Proyecto de investigación",
    ],
    duration: "2 años",
    modality: "Semipresencial",
    icon: "💻",
    image: "/images/cienciastegnologia.webp",
  },
  {
    id: "educacion-sustentable",
    name: "Maestría en Educación para el Desarrollo Sustentable",
    type: "maestria",
    coordinator: "Coordinación General",
    description:
      "Maestría interdisciplinaria que forma educadores comprometidos con el desarrollo sustentable y la responsabilidad ambiental.",
    requirements: [
      "Título universitario",
      "Experiencia en educación",
      "Compromiso ambiental",
      "Proyecto de investigación",
    ],
    duration: "2 años",
    modality: "Semipresencial",
    icon: "🌱",
    image: "/images/educaciondesarrollo.webp",
  },
  {
    id: "administracion-empresas",
    name: "Especialización en Administración de Empresas",
    type: "especializacion",
    coordinator: "Dra. Thania Oberto",
    description:
      "Especialización diseñada para fortalecer competencias gerenciales y administrativas en el ámbito empresarial.",
    requirements: ["Título universitario", "Experiencia administrativa", "Entrevista personal"],
    duration: "18 meses",
    modality: "Semipresencial",
    icon: "🏢",
    image: "/images/especialicacionempresas.webp",
  },
  {
    id: "automatizacion-industrial",
    name: "Especialización en Automatización Industrial",
    type: "especializacion",
    coordinator: "MSc. Wilmer Sanz",
    description:
      "Programa especializado en sistemas de automatización y control industrial, orientado a la industria 4.0.",
    requirements: ["Título en Ingeniería", "Conocimientos en control", "Experiencia industrial"],
    duration: "18 meses",
    modality: "Presencial",
    icon: "⚙️",
    image: "/images/especializacionmaquinas.webp",
  },
  {
    id: "derecho-administrativo",
    name: "Especialización en Derecho Administrativo",
    type: "especializacion",
    coordinator: "Coordinación de Derecho",
    description:
      "Especialización en derecho público administrativo, procedimientos y régimen jurídico de la administración pública.",
    requirements: ["Título de Abogado", "Colegiatura vigente", "Experiencia jurídica"],
    duration: "18 meses",
    modality: "Semipresencial",
    icon: "⚖️",
    image: "/images/especializacionempresasgeneral.webp",
  },
  {
    id: "derecho-procesal-civil",
    name: "Especialización en Derecho Procesal Civil",
    type: "especializacion",
    coordinator: "MSc. Ledys Herrera",
    description:
      "Especialización en procedimientos civiles, técnicas de litigación y práctica forense en el ámbito civil.",
    requirements: ["Título de Abogado", "Colegiatura vigente", "Experiencia en litigios"],
    duration: "18 meses",
    modality: "Semipresencial",
    icon: "📋",
    image: "/images/derechoprocesal.webp",
  },
  {
    id: "docencia-superior",
    name: "Especialización en Docencia en Educación Superior",
    type: "especializacion",
    coordinator: "MSc. Susan León",
    description:
      "Programa orientado a la formación de docentes universitarios con competencias pedagógicas y didácticas avanzadas.",
    requirements: ["Título universitario", "Experiencia docente", "Vocación pedagógica"],
    duration: "18 meses",
    modality: "Semipresencial",
    icon: "👨‍🏫",
    image: "/images/docencia.webp",
  },
  {
    id: "control-calidad",
    name: "Especialización en Gerencia de Control de Calidad e Inspección de Obras",
    type: "especializacion",
    coordinator: "Dra. Thania Oberto",
    description:
      "Especialización en gestión de calidad y supervisión técnica de proyectos de construcción e infraestructura.",
    requirements: ["Título en Ingeniería o Arquitectura", "Experiencia en construcción", "Conocimientos de normativas"],
    duration: "18 meses",
    modality: "Semipresencial",
    icon: "🏗️",
    image: "/images/controldecalidad.webp",
  },
  {
    id: "gestion-aduanera",
    name: "Especialización en Gestión Aduanera y Tributaria",
    type: "especializacion",
    coordinator: "Coordinación Especializada",
    description: "Programa especializado en procedimientos aduaneros, comercio internacional y gestión tributaria.",
    requirements: ["Título universitario", "Experiencia en comercio exterior", "Conocimientos contables"],
    duration: "18 meses",
    modality: "Semipresencial",
    icon: "🚢",
    image: "/images/aduaneratributaria.webp",
  },
  {
    id: "finanzas-publicas",
    name: "Especialización en Gestión y Control de las Finanzas Públicas",
    type: "especializacion",
    coordinator: "Esp. Federico Estaba",
    description: "Especialización en administración financiera del sector público, presupuesto y control fiscal.",
    requirements: ["Título universitario", "Experiencia en sector público", "Conocimientos financieros"],
    duration: "18 meses",
    modality: "Semipresencial",
    icon: "🏛️",
    image: "/images/finanzas.webp",
  },
  {
    id: "telecomunicaciones",
    name: "Especialización en Telecomunicaciones",
    type: "especializacion",
    coordinator: "Coordinación Técnica",
    description:
      "Programa especializado en sistemas de telecomunicaciones, redes y tecnologías de comunicación avanzadas.",
    requirements: ["Título en Ingeniería", "Conocimientos en telecomunicaciones", "Experiencia técnica"],
    duration: "18 meses",
    modality: "Semipresencial",
    icon: "📡",
    image: "/images/telecom.webp",
  },
]

export default function ProgramButtons({ programType, onProgramSelect }: ProgramButtonsProps) {
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null)

  const programs = programType === "clinicos" ? clinicalPrograms : nonClinicalPrograms

  const toggleProgram = (programId: string) => {
    setExpandedProgram(expandedProgram === programId ? null : programId)
  }

  const getTypeColor = (type: Program["type"]) => {
    switch (type) {
      case "doctorado":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "maestria":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "especializacion":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
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

      {programs.map((program) => (
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
                {/* Program Image */}
                {program.image && (
                  <div className="mb-4">
                    <img
                      src={program.image || "/placeholder.svg"}
                      alt={program.name}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}

                {/* Program Details */}
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm mb-1">Coordinador</h4>
                    <p className="text-sm text-gray-600">{program.coordinator}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm mb-1">Descripción</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{program.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm mb-1">Duración</h4>
                      <p className="text-sm text-gray-600">{program.duration}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm mb-1">Modalidad</h4>
                      <p className="text-sm text-gray-600">{program.modality}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm mb-2">Requisitos</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {program.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-amber-500 mt-1">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-200">
                    <Button
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700 text-white flex-1 text-xs sm:text-sm"
                      onClick={() => onProgramSelect(program)}
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
                <span>+58 241 871 0903</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
