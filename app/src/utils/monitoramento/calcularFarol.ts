export type StatusFarolType = "verde" | "amarelo" | "vermelho";

export function calcularFarol({
  progresso,
  tme,
  alerta,
}: {
  progresso: number;
  tme: number;
  alerta?: boolean;
}): StatusFarolType {
  if (alerta) {
    return "vermelho";
  }

  const finalizado = progresso >= 100;

  if (!finalizado) {
    if (tme > 4) {
      return "vermelho";
    }

    if (tme <= 3) {
      return "amarelo";
    }

    return "verde";
  }

  if (tme > 20) {
    return "vermelho";
  }

  return "verde";
}
