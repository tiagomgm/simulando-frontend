import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaArrowLeft, FaCheck, FaTimes, FaClock, FaTrophy
} from 'react-icons/fa';
import { getToken } from '../utils/token';

// Estilos personalizados para a barra de rolagem
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

// Helpers
const API_URL = 'http://localhost:8000';

function getMeuId() {
  try {
    const token = getToken();
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.user_id;
  } catch {
    return null;
  }
}
function getMeuUsername() {
  try {
    const token = getToken();
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.username;
  } catch {
    return null;
  }
}
function getStatusIcon(status: string) {
  switch (status) {
    case 'acerto': return <FaCheck className="text-success mr-2" />;
    case 'erro': return <FaTimes className="text-danger mr-2" />;
    default: return <FaClock className="text-gray-500 mr-2" />;
  }
}
function getStatusText(status: string) {
  if (status === 'acerto') return "Acertou";
  if (status === 'erro') return "Errou";
  return "Pendente";
}

export default function ResultadoAvaliacao() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResultado = async () => {
      try {
        const token = getToken();
        if (!token) {
          navigate('/login');
          return;
        }
        const resp = await axios.get(`${API_URL}/api/respostas/?aluno=${getMeuId()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const minhaResposta = resp.data.find((r: any) => r.avaliacao === Number(id));
        if (!minhaResposta) {
          setError('Você ainda não respondeu esta avaliação.');
          setLoading(false);
          return;
        }
        const questoesResp = await axios.get(`${API_URL}/api/questoes/?avaliacao=${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const rankingResp = await axios.get(`${API_URL}/api/avaliacoes/${id}/ranking/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const minhaPos = rankingResp.data.find((r: any) => r.aluno === getMeuUsername());
        const acertos = minhaResposta.respostas_questoes.filter((rq: any) =>
          questoesResp.data.find((q: any) => q.id === rq.questao)?.alternativa_correta === rq.alternativa_marcada
        ).length;
        const erros = minhaResposta.respostas_questoes.filter((rq: any) =>
          questoesResp.data.find((q: any) => q.id === rq.questao)?.alternativa_correta !== rq.alternativa_marcada
        ).length;
        const pendentes = questoesResp.data.length - minhaResposta.respostas_questoes.length;
        const questoes = questoesResp.data.map((q: any) => {
          const r = minhaResposta.respostas_questoes.find((rq: any) => rq.questao === q.id);
          const status = !r
            ? 'pendente'
            : r.alternativa_marcada === q.alternativa_correta ? 'acerto' : 'erro';
          return {
            id: q.id,
            texto: q.texto || q.enunciado,
            status,
            resposta: r ? r.alternativa_marcada : null,
            resposta_correta: q.alternativa_correta
          };
        });
        setResultado({
          titulo: minhaResposta.avaliacao_titulo,
          pontuacao: minhaResposta.pontuacao,
          posicao: minhaPos ? minhaPos.posicao || minhaPos.rank || rankingResp.data.findIndex((r: any) => r.aluno === getMeuUsername()) + 1 : null,
          acertos,
          erros,
          pendentes,
          questoes,
          total: questoesResp.data.length,
          respondidas: minhaResposta.respostas_questoes.length,
          taxa: Math.round((acertos / questoesResp.data.length) * 100),
          tempo_medio: "2m 15s", // mock
          tempo_total: "51m 45s", // mock
          dificuldade: 3,         // mock (1-5)
        });
      } catch (err: any) {
        if (err.response?.status === 401) {
          navigate('/login');
        } else if (err.response?.status === 404) {
          setError('Avaliação não encontrada.');
        } else {
          setError('Erro ao carregar resultado. Tente novamente.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchResultado();
    // eslint-disable-next-line
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400 text-lg">
        Carregando resultado...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-10 bg-white rounded-lg shadow border border-gray-200">
        <button className="text-gray-500 hover:text-gray-700 mb-6 flex items-center" onClick={() => navigate(-1)}>
          <FaArrowLeft className="mr-2" /> Voltar
        </button>
        <div className="text-danger text-center font-bold">{error}</div>
      </div>
    );
  }

  if (!resultado) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-10 bg-white rounded-lg shadow border border-gray-200">
        <button className="text-gray-500 hover:text-gray-700 mb-6 flex items-center" onClick={() => navigate(-1)}>
          <FaArrowLeft className="mr-2" /> Voltar
        </button>
        <div className="text-gray-700 text-center">Nenhum resultado disponível</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <style>{scrollbarStyles}</style>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-lg hover:bg-gray-100"
              >
                <FaArrowLeft className="text-lg" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Resultado da Avaliação</h1>
                <span className="text-sm text-gray-500">{resultado.titulo}</span>
              </div>
            </div>
            {resultado.posicao && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center text-amber-600">
                  <FaTrophy className="mr-2" />
                  <span className="font-semibold">Posição: {resultado.posicao}º</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Result Summary */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <FaTrophy className="text-2xl text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Resultado Final</h2>
              <p className="text-gray-600">Veja seu desempenho na avaliação</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Gráfico de Taxa de Acerto */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative inline-flex items-center justify-center mb-4">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle cx="80" cy="80" r="70" stroke="#e5e7eb" strokeWidth="12" fill="none"></circle>
                    <circle cx="80" cy="80" r="70" stroke="#43a047" strokeWidth="12" fill="none"
                      strokeDasharray={439.6}
                      strokeDashoffset={439.6 - (439.6 * (resultado.taxa ?? 0) / 100)}
                      strokeLinecap="round"
                    ></circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-3xl font-bold text-secondary">{resultado.taxa ?? 0}%</span>
                      <p className="text-sm text-gray-600 mt-1">Taxa de Acerto</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{Math.round(resultado.pontuacao)}</div>
                  <div className="text-sm text-gray-600">Pontuação</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-500">{resultado.pendentes}</div>
                  <div className="text-sm text-gray-600">Pendentes</div>
                </div>
                <div className="text-center p-4 bg-secondary/5 rounded-lg">
                  <div className="text-2xl font-bold text-secondary">{resultado.acertos}</div>
                  <div className="text-sm text-gray-600">Acertos</div>
                </div>
                <div className="text-center p-4 bg-danger/5 rounded-lg">
                  <div className="text-2xl font-bold text-danger">{resultado.erros}</div>
                  <div className="text-sm text-gray-600">Erros</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Revisão das Questões */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Revisão das Questões</h3>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {resultado.questoes?.map((questao: any, index: number) => (
                <div key={questao.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900">Questão {index + 1}</span>
                    <div className={
                      questao.status === 'acerto'
                        ? "flex items-center text-secondary"
                        : questao.status === 'erro'
                        ? "flex items-center text-danger"
                        : "flex items-center text-gray-500"
                    }>
                      {getStatusIcon(questao.status)}
                      <span className="text-sm font-medium">{getStatusText(questao.status)}</span>
                    </div>
                  </div>
                  <div className="text-gray-700 mb-3">{questao.texto}</div>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-gray-600">Sua resposta: </span>
                      <span className={`
                        font-medium
                        ${questao.status === 'acerto' ? "text-secondary"
                          : questao.status === 'erro' ? "text-danger"
                          : "text-gray-500"}
                      `}>
                        {questao.resposta || "Não respondida"}
                      </span>
                    </div>
                  </div>
                  {questao.status === 'erro' && (
                    <div className="mt-1 text-sm">
                      <span className="text-gray-600">Resposta correta: </span>
                      <span className="font-medium text-secondary">{questao.resposta_correta}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}