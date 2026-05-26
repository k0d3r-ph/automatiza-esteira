export function calcularProgressoPorFases(
  faseAtual: number,
  totalFases: number,
) {
  if (!totalFases) return 0;

  return Math.round(((faseAtual + 1) / totalFases) * 100);
}
