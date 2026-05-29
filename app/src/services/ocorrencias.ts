import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

import { db } from "./firebase";
import type { Ocorrencia } from "../types";

const COLLECTION = "ocorrencias";

export async function salvarOcorrencia(ocorrencia: Ocorrencia) {
  const { horaOcorrencia, id, ...dados } = ocorrencia as any;

  const dadosLimpos = Object.fromEntries(
    Object.entries(dados).filter(([_, v]) => v !== undefined),
  );

  if (id) {
    const ref = doc(db, COLLECTION, id);
    await updateDoc(ref, {
      ...dadosLimpos,
      updatedAt: Date.now(),
    });
    return id;
  }

  const docRef = await addDoc(collection(db, COLLECTION), {
    ...dadosLimpos,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  return docRef.id;
}

export async function listarOcorrencias() {
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Ocorrencia, "id">),
  }));
}

export async function removerOcorrencia(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));
}
