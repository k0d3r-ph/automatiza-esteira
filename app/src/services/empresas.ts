import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDocs,
} from "firebase/firestore";

import { db } from "./firebase";
import type { Empresa } from "../types";

const COLLECTION = "empresas";

export async function salvarEmpresas(empresa: Partial<Empresa>) {
  if (empresa.id) {
    const ref = doc(db, COLLECTION, empresa.id);

    await updateDoc(ref, {
      ...empresa,
      updatedAt: Date.now(),
    });

    return empresa.id;
  }

  const docRef = await addDoc(collection(db, COLLECTION), {
    ...empresa,
    updatedAt: Date.now(),
  });

  return docRef.id;
}

export async function listarEmpresas() {
  const snapshot = await getDocs(collection(db, COLLECTION));

  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Empresa, "id">),
    }))
    .filter((empresa) => empresa.id);
}

export async function removerEmpresa(id: string) {
  await deleteDoc(doc(db, "empresas", id));
}
