import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken } from "../utils/token";
import {
  FaArrowLeft, FaTrophy, FaMedal, FaAward, FaChevronDown
} from "react-icons/fa";
import RankingAlunoModal from "../components/RankingAlunoModal"; 

export default function RankingMentor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ranking, setRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAll, setShowAll] = useState(false);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAluno] = useState<any>(null);
  const [selectedPos] = useState<number>(0);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const token = getToken();
        if (!token) {
          setError('Usuário não autenticado');
          setLoading(false);
          return;
        }
        const response = await axios.get(`${API_URL}/api/avaliacoes/${id}/ranking/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.data && Array.isArray(response.data)) {
          setRanking(response.data);
        } else {
          setError('Formato de dados inválido');
        }
      } catch (err: any) {
        if (err.response?.status === 401) {
          setError('Sessão expirada. Por favor, faça login novamente.');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          setError('Erro ao carregar o ranking. Tente novamente mais tarde.');
        }
      } finally {
        setLoading(false);
      }
    };

    // Carrega o ranking inicialmente
    fetchRanking();

    // Atualiza a cada 30 segundos
    const intervalId = setInterval(fetchRanking, 30000);

    // Limpa o intervalo quando o componente for desmontado
    return () => clearInterval(intervalId);
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400 text-lg">
        Carregando ranking...
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

  if (!ranking || ranking.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-10 bg-white rounded-lg shadow border border-gray-200">
        <button className="text-gray-500 hover:text-gray-700 mb-6 flex items-center" onClick={() => navigate(-1)}>
          <FaArrowLeft className="mr-2" /> Voltar
        </button>
        <div className="text-gray-700 text-center">Nenhum resultado disponível</div>
      </div>
    );
  }

  // Nome da avaliação (ajuste para o campo do seu backend)
  const nomeAvaliacao = ranking[0]?.avaliacao_titulo || "Avaliação";

  const mostraQtd = 10;
  const rankingMostrado = showAll ? ranking : ranking.slice(0, mostraQtd);

  function renderLinha(item: any, idx: number) {
    const pos = idx + 1;
    let bgColor = "", icon = null, txt = "";
    if (pos === 1) {
      bgColor = "bg-yellow-100";
      icon = <div className="flex items-center justify-center w-12 h-12 bg-yellow-500 rounded-full shadow-lg"><FaTrophy className="text-white text-lg" /></div>;
      txt = "text-yellow-600";
    } else if (pos === 2) {
      bgColor = "bg-blue-100";
      icon = <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full shadow-lg"><FaMedal className="text-white text-lg" /></div>;
      txt = "text-blue-600";
    } else if (pos === 3) {
      bgColor = "bg-orange-100";
      icon = <div className="flex items-center justify-center w-12 h-12 bg-orange-500 rounded-full shadow-lg"><FaAward className="text-white text-lg" /></div>;
      txt = "text-orange-600";
    } else {
      icon = (
        <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full">
          <span className="text-lg font-bold text-gray-700">{pos}</span>
        </div>
      );
      txt = "text-gray-900";
    }

    return (
      <div
        key={item.aluno || idx}
        className={`p-4 ${bgColor || "bg-white"}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {icon}
            <div>
              <p className={`font-semibold text-gray-900 ${pos < 4 ? "text-lg" : "font-medium"}`}>
                {item.aluno_nome || item.aluno || item.apelido}
              </p>
              <p className="text-sm text-gray-600">
                Colocação: {pos}º lugar
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${txt || "text-gray-900"}`}>{Math.round(item.pontuacao)}</p>
            <p className="text-sm text-gray-600">pontos</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button className="text-gray-500 hover:text-gray-700 transition-colors mr-4" onClick={() => navigate(-1)}>
              <FaArrowLeft className="text-lg" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <FaTrophy className="text-2xl text-accent" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Ranking da Avaliação</h1>
                <p className="text-sm text-gray-500">{nomeAvaliacao}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Classificação Geral</h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {ranking.length} participantes
                </span>
              </div>
              {/* <p className="text-sm text-gray-600 mt-2">
                Clique em um aluno para ver detalhes das respostas
              </p> */}
            </div>
            <div className="divide-y divide-gray-100">
              {rankingMostrado.map(renderLinha)}
            </div>
            {(!showAll && ranking.length > mostraQtd) && (
              <div className="p-4 border-t border-gray-200 text-center" id="show-more-section">
                <button
                  className="text-primary hover:text-blue-700 font-medium flex items-center mx-auto"
                  onClick={() => setShowAll(true)}
                >
                  <FaChevronDown className="mr-2" />
                  Ver mais {ranking.length - mostraQtd} participantes
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
      <RankingAlunoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        aluno={selectedAluno}
        pos={selectedPos}
      />
    </div>
  );
}