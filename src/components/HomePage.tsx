"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Phone, PhoneCall, Facebook, Twitter, Instagram, MessageCircle } from "lucide-react"

interface HomePageProps {
  onNavigateToChatbot: () => void
}

export default function HomePage({ onNavigateToChatbot }: HomePageProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Top Header */}
      <div className="bg-amber-600 text-white py-2 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span className="text-sm">info@ujap.edu.ve</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span className="text-sm">+58-241-8714240</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <a href="http://correo.ujap.edu.ve/" className="text-sm hover:text-amber-200">
              Correo
            </a>
            <a href="https://aulavirtual.ujap.edu.ve/" className="text-sm hover:text-amber-200">
              Acrópolis
            </a>
            <a href="https://www.adm.ujap.edu.ve/" className="text-sm hover:text-amber-200">
              Ujap en Línea
            </a>
            <a href="https://ujap.edu.ve/blog/" className="text-sm hover:text-amber-200">
              Noticias
            </a>
            <a href="https://ujap.edu.ve/atencion/" className="text-sm hover:text-amber-200">
              Atención
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img src="/placeholder.svg?height=60&width=200" alt="UJAP Logo" className="h-12 w-auto" />
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <div className="relative group">
                <button className="text-gray-700 hover:text-amber-600 font-medium">Doctorados</button>
                <div className="absolute top-full left-0 mt-2 w-64 bg-white shadow-lg rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50">
                    Ciencias de la Educación
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50">
                    Orientación
                  </a>
                </div>
              </div>

              <div className="relative group">
                <button className="text-gray-700 hover:text-amber-600 font-medium">Maestrías</button>
                <div className="absolute top-full left-0 mt-2 w-80 bg-white shadow-lg rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50">
                    Gerencia de la Comunicación Organizacional
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50">
                    Gerencia y Tecnología de la Información
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50">
                    Educación para el Desarrollo Sustentable
                  </a>
                </div>
              </div>

              <div className="relative group">
                <button className="text-gray-700 hover:text-amber-600 font-medium">Especializaciones</button>
                <div className="absolute top-full left-0 mt-2 w-80 bg-white shadow-lg rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50">
                    Administración de Empresas
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50">
                    Automatización Industrial
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50">
                    Derecho Administrativo
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50">
                    Derecho Procesal Civil
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50">
                    Docencia en Educación Superior
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50">
                    Gerencia de Control de Calidad e Inspección de Obras
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50">
                    Gestión Aduanera y Tributaria
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50">
                    Gestión y Control de las Finanzas Públicas
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50">
                    Telecomunicaciones
                  </a>
                </div>
              </div>

              <a href="#" className="text-amber-600 font-medium">
                Dirección
              </a>
            </nav>

            {/* Chatbot Button */}
            <Button
              onClick={onNavigateToChatbot}
              className="bg-amber-600 hover:bg-amber-700 text-white flex items-center space-x-2"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Chatbot</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="relative h-96 bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/placeholder.svg?height=400&width=1200')",
        }}
      >
        <div className="text-center text-white">
          <p className="text-sm uppercase tracking-wide mb-2">Universidad José Antonio Páez</p>
          <h1 className="text-4xl md:text-5xl font-bold">Dirección General de Estudios de Postgrado</h1>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="prose prose-lg max-w-none text-justify">
                <p>
                  La Dirección General de Postgrado de la Universidad José Antonio Páez es el órgano encargado de
                  gestionar y coordinar los programas de especialización, maestría y doctorado que se imparten en la
                  institución. Su misión es ofrecer una formación de alto nivel, con un enfoque interdisciplinario,
                  multidisciplinario y transdisciplinario, orientado a la investigación. Los programas de postgrado
                  tienen como objetivo profundizar y ampliar los conocimientos y competencias de los egresados, así como
                  prepararlos para el ejercicio profesional y académico en un contexto global y complejo.
                </p>
                <p>
                  La dirección de postgrado cuenta con un equipo humano altamente cualificado y comprometido con la
                  calidad educativa. Asimismo, dispone de una infraestructura moderna y adecuada para el desarrollo de
                  las actividades académicas y administrativas. Los estudiantes de postgrado tienen acceso a una amplia
                  oferta de servicios y recursos, tales como biblioteca, salas de estudio, laboratorios, plataformas
                  virtuales, becas y convenios.
                </p>
                <p>
                  La dirección de postgrado es una entidad que promueve la excelencia, la innovación y la
                  internacionalización. Su visión es ser un referente nacional e internacional en la formación de
                  postgrado, con un impacto positivo en la generación y transferencia de conocimiento. Si quieres
                  continuar tu formación académica y profesional, te invitamos a conocer más sobre nuestros programas de
                  postgrado y nuestro proceso de postulación. ¡Te esperamos!
                </p>
              </div>
            </div>

            <div className="lg:col-span-1">
              <Card className="bg-gray-50 p-6">
                <CardContent className="space-y-4">
                  <a href="https://ujap.edu.ve/blog/">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      Noticias y Eventos
                    </Button>
                  </a>
                  <a href="/reglamento.pdf" target="_blank" rel="noreferrer">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      Reglamento de Estudios
                    </Button>
                  </a>
                  <a href="/cronograma.pdf" target="_blank" rel="noreferrer">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      Cronograma Período 2025-1CP
                    </Button>
                  </a>
                  <hr className="my-4" />
                  <a href="#direccion">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      Autoridades
                    </Button>
                  </a>
                  <a href="#programas">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      Programas Académicos
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programas" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-amber-600 mb-8">Programas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { title: "Doctorado en Ciencias de la Educación", image: "/placeholder.svg?height=200&width=300" },
              { title: "Doctorado en Orientación", image: "/placeholder.svg?height=200&width=300" },
              {
                title: "Maestría Gerencia y Tecnología de la Información",
                image: "/placeholder.svg?height=200&width=300",
              },
              {
                title: "Maestría Gerencia de la Comunicación Organizacional",
                image: "/placeholder.svg?height=200&width=300",
              },
              {
                title: "Maestría Educación para el Desarrollo Sustentable",
                image: "/placeholder.svg?height=200&width=300",
              },
              {
                title: "Especialización Docencia en Educación Superior",
                image: "/placeholder.svg?height=200&width=300",
              },
              {
                title: "Especialización en Administración de Empresas",
                image: "/placeholder.svg?height=200&width=300",
              },
              { title: "Especialización en Automatización Industrial", image: "/placeholder.svg?height=200&width=300" },
              { title: "Especialización en Derecho Administrativo", image: "/placeholder.svg?height=200&width=300" },
              { title: "Especialización en Derecho Procesal Civil", image: "/placeholder.svg?height=200&width=300" },
              {
                title: "Especialización en Gerencia de Control de Calidad e Inspección de Obras",
                image: "/placeholder.svg?height=200&width=300",
              },
              {
                title: "Especialización en Gestión Aduanera y Tributaria",
                image: "/placeholder.svg?height=200&width=300",
              },
              { title: "Especialización en Telecomunicaciones", image: "/placeholder.svg?height=200&width=300" },
              {
                title: "Especialización en Gestión y Control de las Finanzas Públicas",
                image: "/placeholder.svg?height=200&width=300",
              },
            ].map((program, index) => (
              <Card
                key={index}
                className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <div className="relative h-32 bg-gradient-to-br from-amber-400 to-amber-600">
                  <img
                    src={program.image || "/placeholder.svg"}
                    alt={program.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold text-gray-800 line-clamp-3">{program.title}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Authorities Section */}
      <section id="direccion" className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-bold text-gray-800 mb-8 border-b-2 border-amber-600 pb-2">Autoridades</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gray-50">
                  <CardContent className="p-6 text-center">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-amber-200 border-4 border-amber-300 overflow-hidden">
                      <img
                        src="/placeholder.svg?height=96&width=96"
                        alt="Dra. Haydee Páez"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Dra. Haydee Páez</h3>
                    <p className="text-sm text-gray-600">
                      Directora General de Estudios de Postgrado, Coordinadora del Programa Doctorado en Ciencias de la
                      Educación
                    </p>
                  </CardContent>
                </Card>

                {[
                  {
                    name: "Dra. Omaira Lessire de González",
                    role: "Coordinadora del Programa Doctorado en Orientación.",
                  },
                  {
                    name: "Dra. Thania Oberto",
                    role: "Coordinadora de los Programas Maestría en Gerencia de la Comunicación Organizacional, Especialización en Gestión Aduanera y Tributaria, Especialización en Administración de Empresas, Especialización en Derecho Administrativo, Especialización en Gerencia de Control de Calidad e Inspección de Obras.",
                  },
                  {
                    name: "MSc. Wilmer Sanz",
                    role: "Coordinador del Programa de Especialización en Automatización Industrial.",
                  },
                  {
                    name: "MSc. Susan León",
                    role: "Coordinadora de los Programas Maestría en Gerencia y Tecnología de la Información, Especialización en Docencia en Educación Superior. Coordinadora del Curso de Formación Docente.",
                  },
                  {
                    name: "MSc. Ledys Herrera",
                    role: "Coordinadora del Programa Especialización en Derecho Procesal Civil.",
                  },
                  {
                    name: "Esp. Federico Estaba",
                    role: "Coordinador del Programa Especialización en Gestión y Control de las Finanzas Públicas.",
                  },
                  {
                    name: "Esp. Adriana Materán",
                    role: "Coordinadora del Programa de Especialización en Odontopediatría.",
                  },
                ].map((person, index) => (
                  <Card key={index} className="bg-gray-50">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{person.name}</h3>
                      <p className="text-sm text-gray-600">{person.role}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1">
              <Card className="bg-gray-50 p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Contáctanos</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-amber-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-800">Email:</p>
                      <p className="text-sm text-gray-600">coordinacion.postgrado@ujap.edu.ve</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-amber-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-800">Número Telefónico:</p>
                      <p className="text-sm text-gray-600">+582418710903</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <PhoneCall className="h-5 w-5 text-amber-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-800">Contacto UJAP:</p>
                      <p className="text-sm text-gray-600">+582418714240</p>
                      <p className="text-sm text-gray-600">Extensión 1260</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-amber-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
            <div className="md:col-span-1 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-white rounded-full flex items-center justify-center">
                <img src="/placeholder.svg?height=32&width=32" alt="UJAP" />
              </div>
              <p className="text-sm">
                Universidad
                <br />
                <strong>José Antonio Páez</strong>
              </p>
              <div className="flex justify-center space-x-4 mt-4">
                <Facebook className="h-5 w-5 hover:text-amber-200 cursor-pointer" />
                <Twitter className="h-5 w-5 hover:text-amber-200 cursor-pointer" />
                <Instagram className="h-5 w-5 hover:text-amber-200 cursor-pointer" />
              </div>
            </div>

            {[
              {
                title: "Universidad",
                links: ["Quienes Somos", "Símbolos", "Historia"],
              },
              {
                title: "Contacto",
                links: ["Correo Electrónico", "Directorio", "Atención al Estudiante"],
              },
              {
                title: "Información",
                links: ["Transporte", "Admisión", "Cronograma"],
              },
              {
                title: "Enlaces frecuentes",
                links: ["Acrópolis", "UJAP En Línea", "Noticias"],
              },
              {
                title: "Páginas",
                links: ["Ceujap", "Revista Digital", "IDIT"],
              },
            ].map((section, index) => (
              <div key={index}>
                <h3 className="font-bold text-white mb-4">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="text-sm text-gray-200 hover:text-white">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-amber-500 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-200 mb-2">
              Municipio San Diego, Calle Nº 3. Urb. Yuma II.
              <br />
              (2do. Semáforo de La Urb. La Esmeralda, detrás del Conjunto Residencial Poblado).
              <br />
              Valencia – Edo. Carabobo
            </p>
            <p className="text-sm text-gray-200">
              © 2022-2023 Universidad José Antonio Páez S. A.
              <br />
              J-30400858-9
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
