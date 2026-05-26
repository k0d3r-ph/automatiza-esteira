export function calcularDiasNaEsteira(dataEntrada?: string) {
  if (!dataEntrada) {
    return 0;
  }

  const entrada = new Date(dataEntrada);

  if (isNaN(entrada.getTime())) {
    return 0;
  }

  const hoje = new Date();

  return Math.floor(
    (hoje.getTime() - entrada.getTime()) / (1000 * 60 * 60 * 24),
  );
}
