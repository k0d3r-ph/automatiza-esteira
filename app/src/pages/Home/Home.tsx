import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Home.css";

import ProgressBar from "../../components/ProgressBar";
import StatusFarol from "../../components/StatusFarol";

import { listarOcorrencias } from "../../services/ocorrencias";

import { listarEmpresas, salvarEmpresas } from "../../services/empresas";

import {
  calcularDiasNaEsteira,
  calcularFarol,
  calcularProgressoPorFases,
  calcularTME,
  calcularTotalFases,
  obterUltimoTreinamento,
} from "../../utils/monitoramento";
import type { Empresa, Ocorrencia, OcorrenciaForm } from "../../types";

export default function Home() {
  const navigate = useNavigate();

  const [clienteSelecionado, setClienteSelecionado] = useState<Empresa | null>(
    null,
  );

  const [form, setForm] = useState<OcorrenciaForm>(EMPTY);

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

  function formatDateForInput(date?: number | string) {
    if (!date) return "";

    const d = new Date(date);

    if (isNaN(d.getTime())) return "";

    return d.toISOString().split("T")[0];
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

      id: editandoClienteId || undefined,

      updatedAt: Date.now(),
    });

    const lista = await listarEmpresas();

    setEmpresas(lista);

    setModalClienteAberto(false);
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

  const [agora] = useState(() => Date.now());

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

        dias: calcularDiasNaEsteira(empresa.dataEntrada),
      };
    });
  }, [empresas, historico]);

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

      <table>
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
            dados.map((empresa) => (
              <tr
                key={empresa.id}
                className="linha-cliente"
                onClick={() => abrirCliente(empresa)}
              >
                <td>
                  <StatusFarol status={empresa.farol} />
                </td>

                <td>{empresa.nomeEmpresa}</td>

                <td>{empresa.responsavel}</td>

                <td>
                  <span>{empresa.tipo}</span>
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
          </div>
        </div>
      )}
      {modalClienteAberto && (
        <div
          className="cliente-overlay"
          onClick={() => setModalClienteAberto(false)}
        >
          <div className="cliente-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editandoClienteId ? "Editar cliente" : "Novo cliente"}</h2>

            <input
              placeholder="Nome da empresa"
              value={clienteForm.nomeEmpresa}
              onChange={(e) =>
                setClienteForm({
                  ...clienteForm,
                  nomeEmpresa: e.target.value,
                })
              }
            />

            <select
              value={clienteForm.responsavel}
              onChange={(e) =>
                setClienteForm({
                  ...clienteForm,
                  responsavel: e.target.value as Empresa["responsavel"],
                })
              }
            >
              <option value="Pedro">Pedro</option>
              <option value="Jean">Jean</option>
              <option value="Jeff">Jeff</option>
              <option value="Natalia">Natalia</option>
            </select>

            <select
              value={clienteForm.tipo}
              onChange={(e) =>
                setClienteForm({
                  ...clienteForm,
                  tipo: e.target.value as Empresa["tipo"],
                })
              }
            >
              <option value="Fast">Fast</option>
              <option value="Safety">Safety</option>
            </select>

            <input
              type="date"
              value={form.dataOcorrencia ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  dataOcorrencia: e.target.value,
                })
              }
            />

            <button className="btn-primary" onClick={salvarCliente}>
              Salvar cliente
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
            <h2>{editandoClienteId ? "Editar cliente" : "Novo cliente"}</h2>

            <input
              placeholder="Nome da empresa"
              value={clienteForm.nomeEmpresa}
              onChange={(e) =>
                setClienteForm({
                  ...clienteForm,
                  nomeEmpresa: e.target.value,
                })
              }
            />

            <select
              value={clienteForm.responsavel}
              onChange={(e) =>
                setClienteForm({
                  ...clienteForm,
                  responsavel: e.target.value as Empresa["responsavel"],
                })
              }
            >
              <option value="Pedro">Pedro</option>
              <option value="Jean">Jean</option>
              <option value="Jeff">Jeff</option>
              <option value="Natalia">Natalia</option>
            </select>

            <select
              value={clienteForm.tipo}
              onChange={(e) =>
                setClienteForm({
                  ...clienteForm,
                  tipo: e.target.value as Empresa["tipo"],
                })
              }
            >
              <option value="Fast">Fast</option>
              <option value="Safety">Safety</option>
            </select>

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

            <button className="btn-primary" onClick={salvarCliente}>
              Salvar cliente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
