import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Home.css";

import ProgressBar from "../../components/ProgressBar";
import StatusFarol from "../../components/StatusFarol";

import { listarOcorrencias } from "../../services/ocorrencias";

import {
  listarEmpresas,
  removerEmpresa,
  salvarEmpresas,
} from "../../services/empresas";

import {
  calcularDiasNaEsteira,
  calcularFarol,
  calcularProgressoPorFases,
  calcularTME,
  calcularTotalFases,
  obterUltimoTreinamento,
} from "../../utils/monitoramento";
import type { Empresa, Ocorrencia } from "../../types";

export default function Home() {
  const navigate = useNavigate();

  const [clienteSelecionado, setClienteSelecionado] = useState<Empresa | null>(
    null,
  );

  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroResponsavel, setFiltroResponsavel] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroProgresso, setFiltroProgresso] = useState("");

  const [empresas, setEmpresas] = useState<Empresa[]>([]);

  const [historico, setHistorico] = useState<Ocorrencia[]>([]);

  const [loading, setLoading] = useState(true);

  const EMPTY_CLIENTE: Empresa = {
    nomeEmpresa: "",
    responsavel: "",
    tipo: "",
    dataEntrada: "",
    temaText: "",
    dataText: "",
    currentPhase: 0,
    updatedAt: 0,
  };

  const [clienteForm, setClienteForm] = useState<Empresa>(EMPTY_CLIENTE);

  const [modalClienteAberto, setModalClienteAberto] = useState(false);

  const [editandoClienteId, setEditandoClienteId] = useState<string | null>(
    null,
  );

  async function excluirCliente(id: string) {
    await removerEmpresa(id);
    const lista = await listarEmpresas();
    setEmpresas(lista);
    setClienteSelecionado(null);
  }

  function formatarData(data?: string | number) {
    if (!data) return "-";

    // Se for string no formato yyyy-mm-dd, adiciona o horário local pra evitar UTC
    if (typeof data === "string" && /^\d{4}-\d{2}-\d{2}$/.test(data)) {
      const [year, month, day] = data.split("-").map(Number);
      return new Date(year, month - 1, day).toLocaleDateString("pt-BR");
    }

    const d = new Date(data);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("pt-BR");
  }

  function abrirCliente(empresa: Empresa) {
    setClienteSelecionado(empresa);
  }

  function novoCliente() {
    setClienteForm({
      ...EMPTY_CLIENTE,
      updatedAt: Date.now(),
    });

    setEditandoClienteId(null);

    setModalClienteAberto(true);
  }

  function editarCliente(empresa: Empresa) {
    setClienteForm(empresa);

    setEditandoClienteId(empresa.id || null);

    setModalClienteAberto(true);
  }

  async function salvarCliente() {
    if (!clienteForm.nomeEmpresa.trim()) {
      return;
    }

    await salvarEmpresas({
      ...clienteForm,

      nomeEmpresa: clienteForm.nomeEmpresa.trim(),

      id: editandoClienteId || undefined,

      updatedAt: Date.now(),
    });

    const lista = await listarEmpresas();

    setEmpresas(lista);

    setModalClienteAberto(false);
    setClienteSelecionado(null);
  }

  useEffect(() => {
    async function carregarDados() {
      setLoading(true);

      const [empresasLista, ocorrenciasLista] = await Promise.all([
        listarEmpresas(),
        listarOcorrencias(),
      ]);

      setEmpresas(empresasLista);

      setHistorico(ocorrenciasLista);

      setLoading(false);
    }

    carregarDados();
  }, []);

  const dados = useMemo(() => {
    return empresas.map((empresa) => {
      const ultimoTreinamento = obterUltimoTreinamento(
        historico,
        empresa.nomeEmpresa,
      );

      const dataBase =
        ultimoTreinamento?.dataOcorrencia ?? ultimoTreinamento?.createdAt;

      const tme = calcularTME(dataBase);

      const totalFases = calcularTotalFases(empresa.temaText);

      const progresso = calcularProgressoPorFases(
        empresa.currentPhase,
        totalFases,
      );

      const farol = calcularFarol({
        progresso,
        tme,
        alerta: empresa.alerta,
      });

      return {
        ...empresa,
        tme,
        progresso,
        farol,
        dias: calcularDiasNaEsteira(empresa.dataEntrada, progresso, dataBase),
      };
    });
  }, [empresas, historico]);

  const dadosFiltrados = useMemo(() => {
    return dados
      .filter((e) => {
        const clienteOk = !filtroCliente || e.nomeEmpresa === filtroCliente;
        const responsavelOk =
          !filtroResponsavel || e.responsavel === filtroResponsavel;
        const tipoOk = !filtroTipo || e.tipo === filtroTipo;
        const progressoOk =
          !filtroProgresso ||
          (filtroProgresso === "0-25" && e.progresso <= 25) ||
          (filtroProgresso === "26-50" &&
            e.progresso > 25 &&
            e.progresso <= 50) ||
          (filtroProgresso === "51-75" &&
            e.progresso > 50 &&
            e.progresso <= 75) ||
          (filtroProgresso === "76-100" && e.progresso > 75);

        return clienteOk && responsavelOk && tipoOk && progressoOk;
      })
      .sort((a, b) => {
        const ordem = { vermelho: 0, amarelo: 1, verde: 2, none: 3 };
        const farolDiff = (ordem[a.farol] ?? 3) - (ordem[b.farol] ?? 3);
        if (farolDiff !== 0) return farolDiff; // ← primeiro ordena por farol
        return a.nomeEmpresa.localeCompare(b.nomeEmpresa, "pt-BR"); // ← depois alfabético
      });
  }, [dados, filtroCliente, filtroResponsavel, filtroTipo, filtroProgresso]);

  return (
    <div className="monitoramento-page">
      <header>
        <h1>Página principal</h1>

        <p>Acompanhe o progresso dos clientes na esteira de capacitação.</p>
      </header>

      <div className="home-actions">
        <button className="btn-primary" onClick={novoCliente}>
          + Novo cliente
        </button>
      </div>

      <div className="home-filtros">
        <select
          value={filtroCliente}
          onChange={(e) => setFiltroCliente(e.target.value)}
        >
          <option value="">Todos os clientes</option>
          {[...new Set(dados.map((e) => e.nomeEmpresa))].sort().map((nome) => (
            <option key={nome} value={nome}>
              {nome}
            </option>
          ))}
        </select>

        <select
          value={filtroResponsavel}
          onChange={(e) => setFiltroResponsavel(e.target.value)}
        >
          <option value="">Todos os responsáveis</option>
          {[...new Set(dados.map((e) => e.responsavel))]
            .filter(Boolean)
            .sort()
            .map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
        </select>

        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
        >
          <option value="">Todos os tipos</option>
          <option value="Fast">Fast</option>
          <option value="Safety">Safety</option>
        </select>

        <select
          value={filtroProgresso}
          onChange={(e) => setFiltroProgresso(e.target.value)}
        >
          <option value="">Qualquer progresso</option>
          <option value="0-25">0% – 25%</option>
          <option value="26-50">26% – 50%</option>
          <option value="51-75">51% – 75%</option>
          <option value="76-100">76% – 100%</option>
        </select>

        {(filtroCliente ||
          filtroResponsavel ||
          filtroTipo ||
          filtroProgresso) && (
          <button
            onClick={() => {
              setFiltroCliente("");
              setFiltroResponsavel("");
              setFiltroTipo("");
              setFiltroProgresso("");
            }}
          >
            Limpar filtros
          </button>
        )}
      </div>

      <table>
        <colgroup>
          <col style={{ width: "1.5%" }} />
          <col style={{ width: "5%" }} />
          <col style={{ width: "5%" }} />
          <col style={{ width: "5%" }} />
          <col style={{ width: "5%" }} />
          <col style={{ width: "5%" }} />
          <col style={{ width: "5%" }} />
          <col style={{ width: "5%" }} />
        </colgroup>
        <thead>
          <tr>
            <th>Status</th>

            <th>Cliente</th>

            <th>Responsável</th>

            <th>Tipo</th>

            <th>Data de entrada</th>

            <th>Dias</th>

            <th>TME</th>

            <th>Progresso</th>
          </tr>
        </thead>

        <tbody>
          {!loading &&
            dadosFiltrados.map((empresa) => (
              <tr
                key={empresa.id}
                className="linha-cliente"
                onClick={() => abrirCliente(empresa)}
              >
                <td>
                  <StatusFarol status={empresa.farol} />
                </td>

                <td>
                  {empresa.nomeEmpresa}
                  {empresa.alerta && " 🔥"}
                </td>

                <td>{empresa.responsavel}</td>

                <td>
                  {empresa.tipo && (
                    <span
                      style={{
                        padding: "2px 10px",
                        borderRadius: "999px",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        background:
                          empresa.tipo === "Fast" ? "#16a34a" : "#dc2626",
                        color: "white",
                      }}
                    >
                      {empresa.tipo}
                    </span>
                  )}
                </td>

                <td>{formatarData(empresa.dataEntrada)}</td>

                <td>{empresa.dias}</td>

                <td>{empresa.tme !== null ? `${empresa.tme} dias` : "-"}</td>

                <td>
                  <ProgressBar value={empresa.progresso} />
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {clienteSelecionado && (
        <div
          className="cliente-overlay"
          onClick={() => setClienteSelecionado(null)}
        >
          <div className="cliente-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{clienteSelecionado.nomeEmpresa}</h2>

            <button onClick={() => editarCliente(clienteSelecionado)}>
              Editar cliente
            </button>

            <button
              onClick={() => navigate(`/esteira/${clienteSelecionado.id}`)}
            >
              Ver esteira
            </button>

            <button
              onClick={() =>
                navigate(`/historico?empresa=${clienteSelecionado.nomeEmpresa}`)
              }
            >
              Ver ocorrências
            </button>

            <button
              className="btn-excluir"
              onClick={() => excluirCliente(clienteSelecionado.id!)}
            >
              Excluir cliente
            </button>
          </div>
        </div>
      )}

      {modalClienteAberto && (
        <div
          className="cliente-overlay"
          onClick={() => setModalClienteAberto(false)}
        >
          <div className="cliente-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cliente-modal-header">
              <span className="cliente-modal-icon">
                {editandoClienteId ? "✏️" : "🏢"}
              </span>
              <h2>{editandoClienteId ? "Editar cliente" : "Novo cliente"}</h2>
            </div>

            <div className="form-group">
              <label>Nome da empresa</label>
              <input
                placeholder="Ex: Greensat"
                value={clienteForm.nomeEmpresa}
                onChange={(e) =>
                  setClienteForm({
                    ...clienteForm,
                    nomeEmpresa: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Responsável</label>
              <select
                value={clienteForm.responsavel}
                onChange={(e) =>
                  setClienteForm({
                    ...clienteForm,
                    responsavel: e.target.value as Empresa["responsavel"],
                  })
                }
              >
                <option value="">Selecione...</option>
                <option value="Pedro">Pedro</option>
                <option value="Jean">Jean</option>
                <option value="Jeff">Jeff</option>
                <option value="Natalia">Natalia</option>
              </select>
            </div>

            <div className="form-group">
              <label>Tipo</label>
              <select
                value={clienteForm.tipo}
                onChange={(e) =>
                  setClienteForm({
                    ...clienteForm,
                    tipo: e.target.value as Empresa["tipo"],
                  })
                }
              >
                <option value="">Selecione...</option>
                <option value="Fast">Fast</option>
                <option value="Safety">Safety</option>
              </select>
            </div>

            <div className="form-group">
              <label>Data de entrada</label>
              <input
                type="date"
                value={clienteForm.dataEntrada}
                onChange={(e) =>
                  setClienteForm({
                    ...clienteForm,
                    dataEntrada: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Alerta</label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={clienteForm.alerta ?? false}
                  onChange={(e) =>
                    setClienteForm({ ...clienteForm, alerta: e.target.checked })
                  }
                />
                Cliente em alerta 🔥
              </label>
            </div>

            <button className="btn-primary" onClick={salvarCliente}>
              Salvar cliente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
