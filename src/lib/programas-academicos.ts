// Firebase CRUD para programas académicos
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, doc, getDoc } from "firebase/firestore";

export interface ProgramaAcademico {
  id?: string;
  nombre: string;
  tipo: "especializacion" | "maestria" | "curso";
  coordinador: string;
  descripcion: string;
  requisitos: string[];
  duracion: string;
  modalidad: string;
  imagen?: string;
}

// Agregar un programa
export async function agregarPrograma(programa: ProgramaAcademico) {
  const col = collection(db, programa.tipo + "s"); // especializaciones, maestrias, cursos
  const docRef = await addDoc(col, programa);
  return docRef.id;
}

// Leer todos los programas de un tipo
export async function leerProgramas(tipo: "especializacion" | "maestria" | "curso"): Promise<ProgramaAcademico[]> {
  const col = collection(db, tipo + "s");
  const snapshot = await getDocs(col);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProgramaAcademico));
}

// Leer un programa específico
export async function leerProgramaPorId(tipo: "especializacion" | "maestria" | "curso", id: string): Promise<ProgramaAcademico | null> {
  const docRef = doc(db, tipo + "s", id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as ProgramaAcademico) : null;
}
