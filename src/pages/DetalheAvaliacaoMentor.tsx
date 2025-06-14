import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../utils/token";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaEdit, FaTrash, FaUserCheck, FaTrophy, FaKey, FaBan, FaUndo, FaExternalLinkAlt, FaArrowLeft, FaTimes
} from "react-icons/fa";

export default function DetalheAvaliacaoMentor() {
  const { id } = useParams();
  const [avaliacao, setAvaliacao] = useState<any>(null);
  const [questoes, setQuestoes] = useState<any[]>([]);
  const [, setRanking] = useState<any[]>([]);
  const [estatisticas, setEstatisticas] = useState<any[]>([]);
  const [estatisticaGeral, setEstatisticaGeral] = useState<any>(null);
  const [, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [selectedQuestao, setSelectedQuestao] = useState<any>(null);
  const [modal, setModal] = useState(false);
  const [novaResposta, setNovaResposta] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [
          ava, qs, rk, est, alunosAcessoResp, alunosResponderamResp, estGeral
        ] = await Promise.all([
          axios.get(`http://127.0.0.1:8000/api/avaliacoes/${id}/`, {
            headers: { Authorization: `Bearer ${getToken()}` },
          }),
          axios.get(`http://127.0.0.1:8000/api/questoes/?avaliacao=${id}`, {
            headers: { Authorization: `Bearer ${getToken()}` },
          }),
          axios.get(`http://127.0.0.1:8000/api/avaliacoes/${id}/ranking/`, {
            headers: { Authorization: `Bearer ${getToken()}` },
          }),
          axios.get(`http://127.0.0.1:8000/api/avaliacoes/${id}/estatisticas/`, {
            headers: { Authorization: `Bearer ${getToken()}` },
          }),
          axios.get(`http://127.0.0.1:8000/api/avaliacoes/${id}/alunos-com-acesso/`, {
            headers: { Authorization: `Bearer ${getToken()}` },
          }),
          axios.get(`http://127.0.0.1:8000/api/avaliacoes/${id}/alunos-que-responderam/`, {
            headers: { Authorization: `Bearer ${getToken()}` },
          }),
          axios.get(`http://127.0.0.1:8000/api/avaliacoes/${id}/estatisticas-avaliacao/`, {
            headers: { Authorization: `Bearer ${getToken()}` },
          }),
        ]);

        setAvaliacao(ava.data);
        setQuestoes(qs.data);
        setRanking(rk.data);
        setEstatisticas(est.data);
        setEstatisticaGeral(estGeral.data);

        setAvaliacao((prev: any) => ({
          ...prev,
          alunos_com_acesso: alunosAcessoResp.data.length,
          alunos_que_responderam: alunosResponderamResp.data.length
        }));
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setMsg("Erro ao carregar dados da avaliação.");
      }
      setLoading(false);
    }
    load();
  }, [id]);

  useEffect(() => {
    if (selectedQuestao) {
      setNovaResposta(selectedQuestao.resposta ?? '');
    }
  }, [selectedQuestao]);

  const handleEditarQuestao = async () => {
    if (!selectedQuestao || !novaResposta) return;
    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/questoes/${selectedQuestao.id}/`,
        { resposta: novaResposta },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      const response = await axios.get(
        `http://127.0.0.1:8000/api/questoes/?avaliacao=${id}`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setQuestoes(response.data);
      setModal(false);
      setSelectedQuestao(null);
    } catch (error) {
      setMsg("Erro ao salvar resposta.");
    }
  };

  const handleExcluirQuestao = async () => {
    if (!selectedQuestao) return;
    if (window.confirm('Excluir esta questão?')) {
      await axios.delete(
        `http://127.0.0.1:8000/api/questoes/${selectedQuestao.id}/`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setQuestoes(questoes.filter(q => q.id !== selectedQuestao.id));
      setModal(false);
      setSelectedQuestao(null);
    }
  };

  const handleAnularQuestao = async (qid: number, anulada: boolean) => {
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/questoes/${qid}/${anulada ? 'desanular' : 'anular'}/`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      await axios.post(
        `http://127.0.0.1:8000/api/avaliacoes/${id}/recalcular-pontuacoes/`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      const [qs, est, rk, estGeral, alunosAcessoResp, alunosResponderamResp] = await Promise.all([
        axios.get(`http://127.0.0.1:8000/api/questoes/?avaliacao=${id}`, { headers: { Authorization: `Bearer ${getToken()}` } }),
        axios.get(`http://127.0.0.1:8000/api/avaliacoes/${id}/estatisticas/`, { headers: { Authorization: `Bearer ${getToken()}` } }),
        axios.get(`http://127.0.0.1:8000/api/avaliacoes/${id}/ranking/`, { headers: { Authorization: `Bearer ${getToken()}` } }),
        axios.get(`http://127.0.0.1:8000/api/avaliacoes/${id}/estatisticas-avaliacao/`, { headers: { Authorization: `Bearer ${getToken()}` } }),
        axios.get(`http://127.0.0.1:8000/api/avaliacoes/${id}/alunos-com-acesso/`, { headers: { Authorization: `Bearer ${getToken()}` } }),
        axios.get(`http://127.0.0.1:8000/api/avaliacoes/${id}/alunos-que-responderam/`, { headers: { Authorization: `Bearer ${getToken()}` } })
      ]);
      setQuestoes(qs.data);
      setEstatisticas(est.data);
      setRanking(rk.data);
      setEstatisticaGeral(estGeral.data);
      setAvaliacao((prev: any) => ({
        ...prev,
        alunos_com_acesso: alunosAcessoResp.data.length,
        alunos_que_responderam: alunosResponderamResp.data.length
      }));
      setModal(false);
      setSelectedQuestao(null);
      setMsg(`Questão ${anulada ? "desanulada" : "anulada"} com sucesso!`);
      setTimeout(() => setMsg(""), 3000);
    } catch (error) {
      setMsg("Erro ao (des)anular questão.");
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const excluirAvaliacao = async () => {
    if (window.confirm("Excluir esta avaliação? Todas as questões e respostas serão removidas.")) {
      await axios.delete(`http://127.0.0.1:8000/api/avaliacoes/${id}/`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      navigate("/mentor/dashboard");
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-gray-400 text-lg">Carregando...</div>;
  }

  // Badge do tipo
  const tipoBadge = avaliacao?.tipo === 'multipla_escolha' ? 'Múltipla Escolha' : 'Certo/Errado';

  // Estatísticas por questão: tabela
  function renderEstatisticasTable() {
    if (!estatisticas || estatisticas.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          Nenhuma estatística disponível ainda
        </div>
      );
    }
    return (
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Questão</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">% Acerto</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Acertos</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Performance</th>
          </tr>
        </thead>
        <tbody>
          {estatisticas.map(q => (
            <tr key={q.questao_numero} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4 font-medium">{q.questao_numero}</td>
              <td className="py-3 px-4">{q.percentual_acerto}%</td>
              <td className="py-3 px-4">{q.acertos}/{q.total_alunos}</td>
              <td className="py-3 px-4">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full`}
                    style={{
                      width: `${q.percentual_acerto}%`,
                      background: q.percentual_acerto >= 80
                        ? "#43a047"
                        : q.percentual_acerto >= 60
                        ? "#ff9800"
                        : "#f44336"
                    }}
                  ></div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  // Gabarito grid
  const cols = 10;
  const rows = Math.ceil(questoes.length / cols);
  const grid: React.ReactElement[] = [];
  for (let r = 0; r < rows; r++) {
    const rowQuestoes = questoes.slice(r * cols, (r + 1) * cols);
    if (r === rows - 1 && rowQuestoes.length < cols) {
      const emptyCells = cols - rowQuestoes.length;
      for (let i = 0; i < emptyCells; i++) {
        rowQuestoes.push(null);
      }
    }
    grid.push(
      <div key={r} className="grid grid-cols-5 md:grid-cols-10 gap-2 mb-2">
        {rowQuestoes.map((q, idx) =>
          q ? (
            <div
              key={q.id}
              className={`bg-${q.anulada ? "red-50" : "gray-50"} border ${q.anulada ? "border-red-200" : "border-gray-200"} rounded p-2 text-center min-w-[50px]`}
            >
              <div className={`text-xs font-medium ${q.anulada ? "text-red-600" : "text-gray-600"}`}>{q.numero}</div>
              <div className={`text-sm font-bold ${q.anulada ? "text-red-600" : "text-primary"}`}>
                {q.anulada ? "ANU" : q.alternativa_correta}
              </div>
            </div>
          ) : (
            <div key={"empty-" + idx} className="bg-gray-50 border border-gray-200 rounded p-2 min-w-[50px]"></div>
          )
        )}
      </div>
    );
  }

  // Totais gabarito
  const totalAnuladas = questoes.filter(q => q.anulada).length;
  const totalValidas = questoes.length - totalAnuladas;

  return (
    <div className="min-h-screen font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 transition-colors">
                <FaArrowLeft className="text-lg" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{avaliacao?.titulo || ""}</h1>
                <span className="text-sm text-gray-500 bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{tipoBadge}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                className="text-primary hover:text-blue-700 transition-colors p-2"
                onClick={() => navigate(`/mentor/editar-avaliacao/${avaliacao?.id}`)}
                title="Editar avaliação"
              >
                <FaEdit className="text-xl" />
              </button>
              <button
                className="text-danger hover:text-red-700 transition-colors p-2"
                onClick={excluirAvaliacao}
                title="Excluir avaliação"
              >
                <FaTrash className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Estatística geral da avaliação */}
        {estatisticaGeral && (
          <section className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Estatística da Avaliação</h3>
              <div className="flex items-center space-x-8">
                <div>
                  <p className="text-2xl font-bold text-primary">{estatisticaGeral.media_pontuacao?.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Média de Pontuação</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-700">{estatisticaGeral.total_questoes}</p>
                  <p className="text-sm text-gray-600">Questões</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-secondary">{estatisticaGeral.total_alunos}</p>
                  <p className="text-sm text-gray-600">Alunos responderam</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Summary Stats */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alunos Responderam</p>
                <p className="text-3xl font-bold text-gray-900">{avaliacao?.alunos_que_responderam || 0}</p>
                <p className="text-sm text-gray-500">de {avaliacao?.alunos_com_acesso || 0} com acesso</p>
              </div>
              <div className="p-3 bg-secondary/10 rounded-lg">
                <FaUserCheck className="text-2xl text-secondary" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ranking Completo</p>
                <button
                  className="text-primary hover:text-blue-700 font-semibold mt-2 flex items-center"
                  onClick={() => navigate(`/mentor/ranking/${avaliacao?.id}`)}
                >
                  Ver Ranking <FaExternalLinkAlt className="ml-1" />
                </button>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg">
                <FaTrophy className="text-2xl text-accent" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Liberar Acesso</p>
                <button
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => navigate(`/mentor/gerenciar-acesso/${avaliacao?.id}`)}
                >
                  <FaUserCheck className="mr-2 inline" />
                  Liberar
                </button>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <FaKey className="text-2xl text-primary" />
              </div>
            </div>
          </div>
        </section>

        {/* Estatísticas por Questão */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Estatísticas por Questão</h2>
            <div className="overflow-x-auto">
              <div className="max-h-[400px] overflow-y-auto">
                {renderEstatisticasTable()}
              </div>
            </div>
          </div>
        </section>

        {/* Gabarito Oficial */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Gabarito Oficial</h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Total: {questoes.length} questões</span>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-200 rounded"></div>
                <span className="text-xs text-gray-500">Normal</span>
                <div className="w-3 h-3 bg-red-200 rounded"></div>
                <span className="text-xs text-gray-500">Anulada</span>
              </div>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto border border-gray-100 rounded-lg p-4">
            {grid}
            <div className="mt-4 text-center">
              <div className="inline-flex items-center space-x-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
                <span className="text-lg"><FaExternalLinkAlt /></span>
                <span>Exibindo {questoes.length} questões</span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>Questões válidas: <strong className="text-gray-900">{totalValidas}</strong></span>
              <span>Questões anuladas: <strong className="text-red-600">{totalAnuladas}</strong></span>
            </div>
            <button className="text-primary hover:text-blue-700 font-medium flex items-center">
              <FaExternalLinkAlt className="mr-1" /> Exportar Gabarito
            </button>
          </div>
        </div>
      </main>
      {/* Modal Questão */}
      {modal && selectedQuestao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Ações da Questão</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setModal(false)}>
                <FaTimes className="text-xl" />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-600">Questão: <span className="font-semibold">{selectedQuestao.numero}</span></p>
              <p className="text-gray-600">
                Resposta Correta:{" "}
                <span className={`font-semibold ${selectedQuestao.anulada ? "text-red-600" : "text-primary"}`}>
                  {selectedQuestao.anulada ? "ANULADA" : selectedQuestao.alternativa_correta}
                </span>
              </p>
            </div>
            <div className="space-y-3">
              <button
                className="w-full bg-accent text-white py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center"
                onClick={() => handleAnularQuestao(selectedQuestao.id, selectedQuestao.anulada)}
              >
                {selectedQuestao.anulada ? <FaUndo className="mr-2" /> : <FaBan className="mr-2" />}
                {selectedQuestao.anulada ? "Desanular Questão" : "Anular Questão"}
              </button>
              <button
                className="w-full bg-primary text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                onClick={handleEditarQuestao}
              >
                <FaEdit className="mr-2" /> Editar Questão
              </button>
              <button
                className="w-full bg-danger text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                onClick={handleExcluirQuestao}
              >
                <FaTrash className="mr-2" /> Excluir Questão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}