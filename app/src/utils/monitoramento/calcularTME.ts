export function calcularTME(dataUltimoTreinamento?: number): number | null {
  if (!dataUltimoTreinamento) {
    return null;
  }

  const ultimaData = new Date(dataUltimoTreinamento);

  if (isNaN(ultimaData.getTime())) {
    return 0;
  }

  const hoje = new Date();

  return Math.floor(
    (hoje.getTime() - ultimaData.getTime()) / (1000 * 60 * 60 * 24),
  );
}
