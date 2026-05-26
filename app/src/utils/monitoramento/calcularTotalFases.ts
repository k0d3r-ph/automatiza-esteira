export function calcularTotalFases(temaText: string) {
  return temaText
    .split("\n")
    .map((linha) => linha.trim())
    .filter(Boolean).length;
}
