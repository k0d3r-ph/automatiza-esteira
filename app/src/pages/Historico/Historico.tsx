import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  salvarOcorrencia,
  listarOcorrencias,
  removerOcorrencia,
} from "../../services/ocorrencias";
import { listarEmpresas } from "../../services/empresas";
import type { Ocorrencia, Empresa, OcorrenciaForm } from "../../types";
import "./Historico.css";
import { Star, GraduationCap, Wrench, TrendingUp } from "lucide-react";

import { FaWhatsapp } from "react-icons/fa";

const TIPOS = ["Informativa", "Financeira", "Comercial", "Treinamento"];

const CANAIS = [
  "Whatsapp",
  "CSAT",
  "Interna Treinamento",
  "Interna CS",
  "Interna Suporte",
  "Interna Comercial",
];

const CANAIS_CLASS: Record<string, string> = {
  Whatsapp: "canal-whatsapp",
  CSAT: "canal-csat",
  "Interna Treinamento": "canal-treinamento",
  "Interna CS": "canal-cs",
  "Interna Suporte": "canal-interna-suporte",
  "Interna Comercial": "canal-interna-comercial",
};

const CANAIS_ICONES: Record<string, React.ReactNode> = {
  Whatsapp: <FaWhatsapp size={14} />,
  CSAT: <Star size={14} />,
  Treinamento: <GraduationCap size={14} />,
  "Interna Suporte": <Wrench size={14} />,
  "Interna Comercial": <TrendingUp size={14} />,
};

const TIPO_CLASS: Record<string, string> = {
  Reclamação: "tipo--reclamacao",
  Solicitação: "tipo--solicitacao",
  Informação: "tipo--informacao",
  Elogio: "tipo--elogio",
  Treinamento: "tipo--treinamento",
};

const EMPTY: OcorrenciaForm = {
  empresa: "",
  tipo: "",
  descricao: "",
  canal: "",
  responsavel: "",
  dataOcorrencia: "",
  horaOcorrencia: "",
  temaOcorrencia: [],
};

export function Historico() {
  const [empresasList, setEmpresasList] = useState<Empresa[]>([]);
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [selecionada, setSelecionada] = useState<Ocorrencia | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [painelAberto, setPainelAberto] = useState(false);

  const [searchParams] = useSearchParams();

  const empresaFiltro = searchParams.get("empresa") || "";

  async function carregar() {
    setLoading(true);
    const lista = await listarOcorrencias();
    setOcorrencias(lista);
    setLoading(false);
  }

  useEffect(() => {
    async function carregar() {
      setLoading(true);
      const [ocLista, empLista] = await Promise.all([
        listarOcorrencias(),
        listarEmpresas(),
      ]);
      setOcorrencias(ocLista);
      setEmpresasList(empLista);
      setLoading(false);
    }
    carregar();
  }, []);

  function set(campo: keyof typeof EMPTY, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function abrirNovo() {
    setForm({ ...EMPTY, empresa: empresaFiltro || "" });
    setEditandoId(null);
    setPainelAberto(true);
  }

  function abrirEdicao(o: Ocorrencia) {
    let dataFormatada = "";
    let hora = "";

    if (o.dataOcorrencia && o.dataOcorrencia > 0 && !isNaN(o.dataOcorrencia)) {
      const d = new Date(o.dataOcorrencia);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      dataFormatada = `${year}-${month}-${day}`;
      hora = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    }

    setForm({
      empresa: o.empresa,
      tipo: o.tipo,
      descricao: o.descricao,
      responsavel: o.responsavel,
      canal: o.canal,
      dataOcorrencia: dataFormatada,
      horaOcorrencia: hora,
      temaOcorrencia: o.temaOcorrencia ?? [],
    });
    setEditandoId(o.id ?? null);
    setPainelAberto(true);
  }

  function cancelar() {
    setPainelAberto(false);
    setForm({ ...EMPTY });
    setEditandoId(null);
  }

  function normalizar(str: string) {
    return str.trim().toLowerCase().replace(/&amp;/g, "&").replace(/\s+/g, " ");
  }

  async function salvar() {
    console.log("temaOcorrencia:", form.temaOcorrencia);
    if (!form.empresa.trim() || !form.tipo || !form.descricao.trim()) {
      toast.error("Preencha empresa, tipo e descrição.");
      return;
    }

    let timestamp = 0;

    if (form.dataOcorrencia) {
      const [year, month, day] = form.dataOcorrencia.split("-").map(Number);
      const [hours, minutes] = (form.horaOcorrencia || "00:00")
        .split(":")
        .map(Number);
      timestamp = new Date(year, month - 1, day, hours, minutes).getTime();
    }

    const base = { ...form, dataOcorrencia: timestamp };

    setSalvando(true);
    await salvarOcorrencia(editandoId ? { ...base, id: editandoId } : base);

    await carregar();
    setSalvando(false);
    cancelar();
    toast.success(
      editandoId ? "Ocorrência atualizada!" : "Ocorrência registrada!",
    );
  }

  async function excluir(id: string) {
    toast("Deseja excluir esta ocorrência?", {
      action: {
        label: "Excluir",
        onClick: async () => {
          await removerOcorrencia(id);
          await carregar();
          toast.success("Ocorrência removida.");
        },
      },
      cancel: { label: "Cancelar", onClick: () => {} },
      duration: 10000,
    });
  }

  const filtradas = ocorrencias.filter((o) => {
    const texto = busca.toLowerCase();

    const bateBusca =
      normalizar(o.empresa).includes(normalizar(texto)) ||
      o.tipo.toLowerCase().includes(texto) ||
      o.descricao.toLowerCase().includes(texto) ||
      o.responsavel.toLowerCase().includes(texto);

    const empresaOk =
      !empresaFiltro || normalizar(o.empresa) === normalizar(empresaFiltro);

    return bateBusca && empresaOk;
  });
  return (
    <div className="hist-shell">
      {/* Header */}
      <header className="hist-header">
        <div className="hist-header-inner">
          <div>
            <h1 className="hist-title">Histórico de Ocorrências</h1>
            <p className="hist-subtitle">
              Registro e acompanhamento de ocorrências
            </p>
          </div>
          <button className="btn-primary hist-btn-novo" onClick={abrirNovo}>
            + Nova ocorrência
          </button>
        </div>
      </header>

      {/* Barra de filtros */}
      <div className="hist-filtros">
        <input
          className="hist-busca"
          placeholder="Buscar por empresa, tipo, responsável..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* Lista */}
      <div className="hist-table-wrapper">
        <table className="hist-table">
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Data</th>
              <th>Hora</th>
              <th>Canal de interação</th>
              <th>Tipo de registro</th>
              <th>Responsável</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {!loading &&
              filtradas.map((o) => {
                const timestamp = o.createdAt ?? o.dataOcorrencia ?? 0;
                const data = timestamp ? new Date(timestamp) : null;

                return (
                  <tr
                    key={o.id}
                    className="hist-row-click"
                    onClick={() => setSelecionada(o)}
                  >
                    <td>{o.empresa}</td>

                    <td>{data ? data.toLocaleDateString("pt-BR") : "—"}</td>
                    <td>
                      {data
                        ? data.toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>

                    <td>
                      <span
                        className={`hist-item-canal ${CANAIS_CLASS[o.canal] || ""}`}
                      >
                        <span className="canal-icon">
                          {CANAIS_ICONES[o.canal]}
                        </span>

                        {o.canal}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`hist-item-tipo ${TIPO_CLASS[o.tipo] || ""}`}
                      >
                        {o.tipo}
                      </span>
                    </td>

                    <td>👤 {o.responsavel || "—"}</td>

                    <td className="hist-arrow-cell">
                      <span className="hist-arrow">›</span>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>

        {selecionada && (
          <div
            className="hist-detail-overlay"
            onClick={() => setSelecionada(null)}
          >
            <div
              className="hist-detail-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="hist-detail-header">
                <h2>Detalhes da interação</h2>

                <button onClick={() => setSelecionada(null)}>✕</button>
              </div>

              <div className="hist-detail-grid">
                <div>
                  <span>Empresa</span>
                  <strong>{selecionada.empresa}</strong>
                </div>

                <div>
                  <span>Canal</span>
                  <strong>{selecionada.canal}</strong>
                </div>

                <div>
                  <span>Tipo</span>
                  <strong
                    className={`hist-item-tipo hist-item-tipo-detail ${TIPO_CLASS[selecionada.tipo]}`}
                  >
                    {selecionada.tipo}
                  </strong>
                </div>

                <div>
                  <span>Responsável</span>
                  <strong>{selecionada.responsavel || "—"}</strong>
                </div>

                {selecionada.dataOcorrencia > 0 &&
                  !isNaN(selecionada.dataOcorrencia) && (
                    <div>
                      <span>Data da ocorrência</span>
                      <strong>
                        {new Date(
                          selecionada.dataOcorrencia,
                        ).toLocaleDateString("pt-BR")}{" "}
                        {new Date(
                          selecionada.dataOcorrencia,
                        ).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </strong>
                    </div>
                  )}

                {selecionada.temaOcorrencia &&
                  selecionada.temaOcorrencia.length > 0 && (
                    <div className="hist-detail-desc">
                      <span>Temas abordados</span>
                      <div className="temas-selecionados">
                        {selecionada.temaOcorrencia.map((tema) => (
                          <span
                            key={tema}
                            className={`tema-tag ${["Ausente", "Cancelado"].includes(tema) ? "tema-tag-alerta" : ""}`}
                          >
                            {tema}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              <div className="hist-detail-desc">
                <span>Descrição</span>

                <p>{selecionada.descricao}</p>
              </div>

              <div className="botoes">
                <button
                  className="btn-secondary btn-small"
                  onClick={() => {
                    setSelecionada(null);
                    abrirEdicao(selecionada);
                  }}
                >
                  Editar
                </button>

                <button
                  className="btn-danger"
                  onClick={() => {
                    setSelecionada(null);
                    excluir(selecionada.id!);
                  }}
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && filtradas.length === 0 && (
          <div className="hist-empty">
            <p className="hist-empty-icon">📋</p>
            <p>Nenhuma ocorrência encontrada.</p>
          </div>
        )}
      </div>

      {/* Painel lateral de formulário */}
      {painelAberto && (
        <div className="hist-overlay" onClick={cancelar}>
          <div className="hist-painel" onClick={(e) => e.stopPropagation()}>
            <div className="hist-painel-header">
              <h2>{editandoId ? "Editar ocorrência" : "Nova ocorrência"}</h2>
              <button className="hist-fechar" onClick={cancelar}>
                ✕
              </button>
            </div>

            <div className="hist-campo">
              <label>Empresa *</label>
              <input
                list="empresas-list"
                value={form.empresa}
                onChange={(e) => set("empresa", e.target.value)}
                placeholder="Digite para buscar..."
              />
              <datalist id="empresas-list">
                {empresasList
                  .sort((a, b) =>
                    a.nomeEmpresa.localeCompare(b.nomeEmpresa, "pt-BR"),
                  )
                  .map((e) => (
                    <option key={e.id} value={e.nomeEmpresa} />
                  ))}
              </datalist>
            </div>

            <div className="hist-campo hist-campo-row">
              <div>
                <label>Data do agendamento (não obrigatório)</label>
                <input
                  type="date"
                  value={form.dataOcorrencia}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      dataOcorrencia: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label>Hora (não obrigatório)</label>
                <input
                  type="time"
                  value={form.horaOcorrencia ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, horaOcorrencia: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="hist-campo hist-campo-row">
              <label>Tipo de ocorrência *</label>
              <select
                value={form.tipo}
                onChange={(e) => set("tipo", e.target.value)}
              >
                <option value="">Selecione...</option>
                {TIPOS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="hist-campo">
              <label>Canal de Interação *</label>
              <select
                value={form.canal}
                onChange={(e) => set("canal", e.target.value)}
              >
                <option value="">Selecione...</option>
                {CANAIS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {form.tipo === "Treinamento" && (
              <div className="hist-campo">
                <label>Temas abordados</label>
                <div className="temas-lista">
                  {[
                    "Ausente",
                    "Cancelado",
                    ...(() => {
                      const empresa = empresasList.find(
                        (e) =>
                          normalizar(e.nomeEmpresa) ===
                          normalizar(form.empresa),
                      );
                      return empresa?.temaText
                        ? empresa.temaText
                            .trim()
                            .split(/\s{2,}|\n/)
                            .filter(Boolean)
                        : [];
                    })(),
                  ].map((tema) => (
                    <label key={tema} className="tema-opcao">
                      <input
                        type="checkbox"
                        checked={form.temaOcorrencia?.includes(tema) ?? false}
                        onChange={(e) => {
                          const atual = form.temaOcorrencia ?? [];
                          setForm({
                            ...form,
                            temaOcorrencia: e.target.checked
                              ? [...atual, tema]
                              : atual.filter((t) => t !== tema),
                          });
                        }}
                      />
                      {tema}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="hist-campo">
              <label>Descrição *</label>
              <textarea
                value={form.descricao}
                onChange={(e) => set("descricao", e.target.value)}
                placeholder="Descreva a ocorrência com detalhes..."
                rows={5}
              />
            </div>

            <div className="hist-campo">
              <label>Responsável</label>
              <input
                value={form.responsavel}
                onChange={(e) => set("responsavel", e.target.value)}
                placeholder="Nome do responsável"
              />
            </div>

            <div className="hist-painel-actions">
              <button className="btn-ghost" onClick={cancelar}>
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={salvar}
                disabled={salvando}
              >
                {salvando
                  ? "Salvando..."
                  : editandoId
                    ? "Atualizar"
                    : "Registrar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
