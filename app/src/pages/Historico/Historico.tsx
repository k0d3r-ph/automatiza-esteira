import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  salvarOcorrencia,
  listarOcorrencias,
  removerOcorrencia,
} from "../../services/ocorrencias";
import { listarEmpresas } from "../../services/empresas";
import type { Ocorrencia, Empresa } from "../../types";
import "./Historico.css";

const TIPOS = ["Reclamação", "Solicitação", "Informação", "Elogio"];

const CANAIS = [
  "Whatsapp",
  "CSAT",
  "Treinamento",
  "Interna Suporte",
  "Interna Comercial",
];

const TIPO_CLASS: Record<string, string> = {
  Reclamação: "tipo--reclamacao",
  Solicitação: "tipo--solicitacao",
  Informação: "tipo--informacao",
  Elogio: "tipo--elogio",
};

const EMPTY: Omit<Ocorrencia, "id" | "createdAt" | "updatedAt"> = {
  empresa: "",
  tipo: "",
  descricao: "",
  canal: "",
  responsavel: "",
  status: "aberta",
};

export function Historico() {
  const [empresasList, setEmpresasList] = useState<Empresa[]>([]);
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [selecionada, setSelecionada] = useState<Ocorrencia | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroStatus] = useState<string>("todos");
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [painelAberto, setPainelAberto] = useState(false);

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
    setForm({ ...EMPTY });
    setEditandoId(null);
    setPainelAberto(true);
  }

  function abrirEdicao(o: Ocorrencia) {
    setForm({
      empresa: o.empresa,
      tipo: o.tipo,
      descricao: o.descricao,
      responsavel: o.responsavel,
      status: o.status,
      canal: o.canal,
    });
    setEditandoId(o.id ?? null);
    setPainelAberto(true);
  }

  function cancelar() {
    setPainelAberto(false);
    setForm({ ...EMPTY });
    setEditandoId(null);
  }

  async function salvar() {
    if (!form.empresa.trim() || !form.tipo || !form.descricao.trim()) {
      toast.error("Preencha empresa, tipo e descrição.");
      return;
    }

    setSalvando(true);
    await salvarOcorrencia(editandoId ? { ...form, id: editandoId } : form);
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
    const bate =
      o.empresa.toLowerCase().includes(texto) ||
      o.tipo.toLowerCase().includes(texto) ||
      o.descricao.toLowerCase().includes(texto) ||
      o.responsavel.toLowerCase().includes(texto);
    const statusOk = filtroStatus === "todos" || o.status === filtroStatus;
    return bate && statusOk;
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
                const data = new Date(o.createdAt || 0);

                return (
                  <tr
                    key={o.id}
                    className="hist-row-click"
                    onClick={() => setSelecionada(o)}
                  >
                    <td>{data.toLocaleDateString("pt-BR")}</td>

                    <td>
                      {data.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td>{o.canal}</td>

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
              <select
                value={form.empresa}
                onChange={(e) => set("empresa", e.target.value)}
              >
                <option value="">Selecione uma empresa...</option>
                {empresasList
                  .sort((a, b) =>
                    a.nomeEmpresa.localeCompare(b.nomeEmpresa, "pt-BR"),
                  )
                  .map((e) => (
                    <option key={e.id} value={e.nomeEmpresa}>
                      {e.nomeEmpresa}
                    </option>
                  ))}
              </select>
            </div>

            <div className="hist-campo">
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
