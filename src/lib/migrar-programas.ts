// Script de migración de programas académicos desde archivos .txt a Firebase
// Ejecuta este script en un componente temporal de React o Node.js
import { agregarPrograma, ProgramaAcademico } from "@/lib/programas-academicos";

// Utiliza fetch para leer los archivos .txt en el entorno del navegador
// Si usas Node.js, reemplaza fetch por fs.readFileSync y adapta el código

const archivos = [
  { path: "/programas/doctorado-ciencias-educacion.txt", tipo: "doctorado" },
  { path: "/programas/doctorado-orientacion.txt", tipo: "doctorado" },
  { path: "/programas/maestria-gerencia-tecnologia-informacion.txt", tipo: "maestria" },
  { path: "/programas/maestria-gerencia-comunicacion.txt", tipo: "maestria" },
  { path: "/programas/maestria-educacion-desarrollo-sustentable.txt", tipo: "maestria" },
  { path: "/programas/especializacion-telecomunicaciones.txt", tipo: "especializacion" },
  { path: "/programas/especializacion-periodoncia.txt", tipo: "especializacion" },
  { path: "/programas/especializacion-ortodoncia.txt", tipo: "especializacion" },
  { path: "/programas/especializacion-odontopediatria.txt", tipo: "especializacion" },
  { path: "/programas/especializacion-gestion-control-finanzas-publicas.txt", tipo: "especializacion" },
  { path: "/programas/especializacion-gestion-aduanera-tributaria.txt", tipo: "especializacion" },
  { path: "/programas/especializacion-docencia-educacion-superior.txt", tipo: "especializacion" },
  { path: "/programas/especializacion-derecho-procesal-civil.txt", tipo: "especializacion" },
  { path: "/programas/especializacion-derecho-administrativo.txt", tipo: "especializacion" },
  { path: "/programas/especializacion-control-calidad-inspeccion-obras.txt", tipo: "especializacion" },
  { path: "/programas/especializacion-cirugia-bucal.txt", tipo: "especializacion" },
  { path: "/programas/especializacion-automatizacion-industrial.txt", tipo: "especializacion" },
  { path: "/programas/especializacion-administracion-empresas.txt", tipo: "especializacion" },
];

function extraerDatos(texto: string, tipo: string): ProgramaAcademico {
  // Extracción básica, puedes mejorarla según el formato real
  const nombre = texto.match(/^(.*?)(\n|$)/)?.[1]?.trim() || "";
  const descripcion = texto.split("Objetivos")[0]?.trim() || "";
  const requisitos = (texto.match(/Requisitos[\s\S]*?\n([\s\S]*?)(\n|$)/)?.[1]?.split("\n") || []).filter(r => r.trim());
  const duracion = texto.match(/Duraci[óo]n[\s\S]*?(\d+.*?a[ñn]os?)/i)?.[1] || "";
  const modalidad = texto.match(/modalidad[\s\S]*?(Presencial|Semipresencial|Virtual)/i)?.[1] || "";
  const coordinador = ""; // Si tienes el dato, agrégalo aquí
  // Ajustar el tipo para que coincida con el tipo esperado
  let tipoPrograma: "maestria" | "especializacion" | "curso";
  if (tipo === "maestria") tipoPrograma = "maestria";
  else if (tipo === "especializacion") tipoPrograma = "especializacion";
  else tipoPrograma = "curso";
  return {
    nombre,
    tipo: tipoPrograma,
    coordinador,
    descripcion,
    requisitos,
    duracion,
    modalidad,
  };
}

export async function migrarProgramas() {
  for (const archivo of archivos) {
    try {
      const res = await fetch(archivo.path);
      const texto = await res.text();
      const programa = extraerDatos(texto, archivo.tipo);
      await agregarPrograma(programa);
      console.log(`Migrado: ${programa.nombre}`);
    } catch (err) {
      console.error(`Error migrando ${archivo.path}:`, err);
    }
  }
}

// Para ejecutar la migración, llama migrarProgramas() desde un componente temporal
// Ejemplo:
// useEffect(() => { migrarProgramas(); }, []);
