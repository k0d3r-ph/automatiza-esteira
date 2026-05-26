export function obterUltimoTreinamento(historico, empresaNome) {
  const nome = empresaNome.trim().toLowerCase();

  const treinamentos = historico.filter((item) => {
    return (
      item.empresa.trim().toLowerCase() === nome &&
      item.tipo?.toLowerCase().includes("treinamento")
    );
  });

  if (!treinamentos.length) return undefined;

  return treinamentos.sort(
    (a, b) =>
      (b.dataOcorrencia ?? b.createdAt ?? 0) -
      (a.dataOcorrencia ?? a.createdAt ?? 0),
  )[0];
}
