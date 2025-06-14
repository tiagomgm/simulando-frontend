import { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken } from '../utils/token';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaClipboardList, FaCheckCircle, FaCheck, FaClock, FaCalendar, FaPlay, FaEye, FaTrophy, FaStar
} from 'react-icons/fa';

interface Avaliacao {
  id: number;
  titulo: string;
  data_liberacao: string;
  prazo: string;
}

interface Resposta {
  id: number;
  avaliacao: number;
  pontuacao: number;
  data_resposta: string;
}

// UTIL: extrai user_id do JWT
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

export default function DashboardAluno() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [respostas, setRespostas] = useState<Resposta[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('Todas');
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [posicaoRanking, setPosicaoRanking] = useState<number | null>(null);
  const API_URL = import.meta.env.VITE_API_URL;

  const meuId = getMeuId();
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        console.log("Carregando dados do dashboard...");
        const [avs, resps, ranking] = await Promise.all([
          axios.get('${API_URL}/api/avaliacoes/', {
            headers: { Authorization: `Bearer ${getToken()}` }
          }),
          axios.get(`${API_URL}/api/respostas/?aluno=${meuId}`, {
            headers: { Authorization: `Bearer ${getToken()}` }
          }),
          axios.get('${API_URL}/api/ranking-geral/', {
            headers: { Authorization: `Bearer ${getToken()}` }
          })
        ]);
        console.log("Avaliações recebidas:", avs.data);
        console.log("Respostas recebidas:", resps.data);
        setAvaliacoes(avs.data);
        setRespostas(resps.data);
        
        // Encontra a posição do aluno no ranking geral
        const minhaPosicao = ranking.data.findIndex((r: any) => r.aluno_uuid === meuId) + 1;
        setPosicaoRanking(minhaPosicao);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
      setLoading(false);
    }
    load();
  }, [meuId]);

  function jaRespondeu(avaliacaoId: number) {
    return respostas.some(r => r.avaliacao === avaliacaoId);
  }

  function notaDaAvaliacao(avaliacaoId: number) {
    const r = respostas.find(r => r.avaliacao === avaliacaoId);
    return r ? Math.round(r.pontuacao) : null;
  }

  // Progresso e média
  const totalDisponiveis = avaliacoes.length;
  const totalRespondidas = respostas.length;
  const progresso = totalDisponiveis === 0 ? 0 : Math.round((totalRespondidas / totalDisponiveis) * 100);
  
  // Filtro e ordenação
  const avaliacoesFiltradas = avaliacoes
    .filter(av => {
      if (filtro === 'Todas') return true;
      if (filtro === 'Pendentes') return !jaRespondeu(av.id);
      if (filtro === 'Respondidas') return jaRespondeu(av.id);
      return true;
    })
    .sort((a, b) => {
      // Primeiro as pendentes
      const aRespondida = jaRespondeu(a.id);
      const bRespondida = jaRespondeu(b.id);
      if (aRespondida !== bRespondida) {
        return aRespondida ? 1 : -1;
      }
      // Depois por data de liberação
      return new Date(b.data_liberacao).getTime() - new Date(a.data_liberacao).getTime();
    });

  function handleResponder(id: number) {
    setLoadingId(id);
    setTimeout(() => {
      setLoadingId(null);
      navigate(`/avaliacao/${id}/responder`);
    }, 700);
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <FaClipboardList className="text-2xl text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avaliações Disponíveis</p>
                  <p className="text-3xl font-bold text-gray-900">{totalDisponiveis}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-success/10 rounded-lg">
                  <FaCheckCircle className="text-2xl text-success" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avaliações Respondidas</p>
                  <p className="text-3xl font-bold text-gray-900">{totalRespondidas}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Progresso */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Seu Progresso</h2>
              <span className="text-sm text-gray-500">{totalRespondidas} de {totalDisponiveis} concluídas</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-success h-3 rounded-full transition-all duration-300"
                style={{ width: `${progresso}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>0%</span>
              <span className="font-medium">{progresso}%</span>
              <span>100%</span>
            </div>
          </div>
        </section>

        {/* Avaliações */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Minhas Avaliações</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Filtrar:</span>
              <select
                className="text-sm border border-gray-300 rounded-md px-3 py-1"
                value={filtro}
                onChange={e => setFiltro(e.target.value)}
              >
                <option>Todas</option>
                <option>Pendentes</option>
                <option>Respondidas</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[600px] overflow-y-auto pr-2">
            {loading ? (
              <div className="col-span-2 text-center text-gray-500 py-12">
                Carregando avaliações...
              </div>
            ) : avaliacoesFiltradas.length === 0 ? (
              <div className="col-span-2 text-center text-gray-500 py-12">
                Nenhuma avaliação encontrada.
              </div>
            ) : (
              avaliacoesFiltradas.map(av => {
                const respondeu = jaRespondeu(av.id);
                return (
                  <div
                    key={av.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{av.titulo}</h3>
                        {/* <p className="text-sm text-gray-500">
                          Liberada em {av.data_liberacao ? new Date(av.data_liberacao).toLocaleDateString() : '--'}
                        </p> */}
                      </div>
                      {respondeu ? (
                        <span className="px-3 py-1 bg-success/10 text-success text-xs font-medium rounded-full flex items-center">
                          <FaCheck className="mr-1" />
                          Respondida
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full flex items-center">
                          <FaClock className="mr-1" />
                          Pendente
                        </span>
                      )}
                    </div>
                    {respondeu ? (
                      <div className="flex items-center text-sm text-gray-600 mb-4">
                        <FaStar className="mr-2" />
                        <span>Nota: {notaDaAvaliacao(av.id) ?? "--"}</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-sm text-gray-600 mb-4">
                        <FaCalendar className="mr-2" />
                        <span>Prazo: {av.prazo ? new Date(av.prazo).toLocaleDateString() : "--"}</span>
                      </div>
                    )}
                    {/* Botões de ação */}
                    {respondeu ? (
                      <div className="grid grid-cols-2 gap-3">
                        <Link
                          to={`/resultado/${av.id}`}
                          className="bg-gray-100 text-gray-700 font-medium py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center text-sm"
                        >
                          <FaEye className="mr-1" />
                          Ver Resultado
                        </Link>
                        <Link
                          to={`/avaliacao/${av.id}/ranking`}
                          className="bg-gray-100 text-gray-700 font-medium py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center text-sm"
                        >
                          <FaTrophy className="mr-1" />
                          Ver Ranking
                        </Link>
                      </div>
                    ) : (
                      <button
                        className="w-full bg-primary text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                        onClick={() => handleResponder(av.id)}
                        disabled={loadingId === av.id}
                      >
                        {loadingId === av.id ? (
                          <>
                            <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                            </svg>
                            Carregando...
                          </>
                        ) : (
                          <>
                            <FaPlay className="mr-2" />
                            Responder Avaliação
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Motivação */}
        <section>
          <div className="bg-gradient-to-r from-success to-green-600 rounded-lg shadow-sm p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrophy className="text-2xl text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Continue assim!</h2>
              <p className="text-green-100 mb-4">
                Você já respondeu {totalRespondidas} de {totalDisponiveis} avaliações. Faltam apenas {totalDisponiveis - totalRespondidas} para completar todas!
              </p>
              <div className="bg-white/20 rounded-lg p-4">
                <p className="text-white font-semibold">
                  Sua posição no ranking geral: {posicaoRanking ? `${posicaoRanking}º lugar` : '--'}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}