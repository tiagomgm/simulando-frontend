import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken } from "../utils/token";
import {
  FaArrowLeft, FaTrophy, FaMedal, FaAward, FaChevronDown, FaUsers, FaChartLine, FaStar
} from "react-icons/fa";

interface Avaliacao {
  id: number;
  titulo: string;
}

interface RankingItem {
  apelido: string;
  aluno_nome_completo: string;
  aluno_uuid: string;
  pontuacao: number;
  posicao: number;
}

export default function RankingAluno() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [avaliacao, setAvaliacao] = useState<Avaliacao | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  // ID do usuário atual (UUID)
  const [meuUuid, setMeuUuid] = useState<string | null>(null);
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setMeuUuid(payload.uuid);
    } catch (error) {
      console.error("Erro ao decodificar token:", error);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        if (!token) {
          setError("Usuário não autenticado");
          setLoading(false);
          return;
        }
        const headers = { Authorization: `Bearer ${token}` };
        const [rankingRes, avaliacaoRes] = await Promise.all([
          axios.get(`${API_URL}/api/avaliacoes/${id}/ranking/`, { headers }),
          axios.get(`${API_URL}/api/avaliacoes/${id}/`, { headers })
        ]);
        setRanking(rankingRes.data || []);
        setAvaliacao(avaliacaoRes.data);
      } catch (error) {
        setError("Erro ao carregar ranking.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, [id]);

  const participantes = ranking.length;
  const maiorPontuacao = ranking.length > 0 ? Math.max(...ranking.map(r => r.pontuacao)) : 0;
  const pontuacaoMedia = ranking.length > 0 ? Math.round(ranking.reduce((a, b) => a + b.pontuacao, 0) / ranking.length) : 0;

  // Posição do usuário (UUID)
  const minhaPos = ranking.findIndex(item => item.aluno_uuid === meuUuid) + 1;
  const meuItem = minhaPos > 0 ? ranking[minhaPos - 1] : null;
  const mostraQtd = 10;
  const rankingMostrado = showAll ? ranking : ranking.slice(0, mostraQtd);

  // Scroll para o card do usuário
  const minhaRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (minhaRef.current) {
      minhaRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [loading, showAll]);

  // Card "Sua Posição"
  function renderMeuCard() {
    if (!meuItem) return null;
    let medal = "", medalStr = "";
    if (minhaPos === 1) { medal = "bg-gold"; medalStr = "Ouro"; }
    else if (minhaPos === 2) { medal = "bg-silver"; medalStr = "Prata"; }
    else if (minhaPos === 3) { medal = "bg-bronze"; medalStr = "Bronze"; }
    else { medal = "bg-gray-200"; medalStr = ""; }
    return (
      <section className="mb-8">
        <div className="bg-gradient-to-r from-primary to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <FaMedal className="text-2xl" />
              </div>
              <div>
                <p className="text-sm opacity-90">Sua Posição</p>
                <p className="text-3xl font-bold">{minhaPos}º lugar</p>
                <p className="text-sm opacity-90">
                  {Math.round(meuItem.pontuacao)} pontos de {maiorPontuacao}
                </p>
              </div>
            </div>
            <div className="text-right">
              {medalStr && (
                <div className={`${medal} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
                  {medalStr}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Render linha do ranking
  function renderLinha(item: RankingItem) {
    const pos = item.posicao;
    const isMeu = item.aluno_uuid === meuUuid;
    let gradBg = "", icon = null, txt = "";
    if (pos === 1) {
      gradBg = "bg-yellow-100 hover:bg-yellow-200";
      icon = <div className="flex items-center justify-center w-12 h-12 bg-yellow-500 rounded-full shadow-lg"><FaTrophy className="text-white text-lg" /></div>;
      txt = "text-yellow-600";
    } else if (pos === 2) {
      gradBg = "bg-blue-100 hover:bg-blue-200";
      icon = <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full shadow-lg"><FaMedal className="text-white text-lg" /></div>;
      txt = "text-blue-600";
    } else if (pos === 3) {
      gradBg = "bg-orange-100 hover:bg-orange-200";
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
        key={item.aluno_uuid}
        ref={isMeu ? minhaRef : undefined}
        className={`
          p-4 transition-colors cursor-pointer
          ${gradBg || "hover:bg-gray-50"}
          ${isMeu && pos > 3 ? "border-2 border-primary shadow-md" : ""}
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {icon}
            <div>
              <p className={`font-semibold text-gray-900 text-lg flex items-center`}>
                {item.apelido || item.aluno_nome_completo}
                {isMeu && (
                  <span className="ml-2 flex items-center text-primary font-semibold text-base">
                    (Você)
                  </span>
                )}
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

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-gray-400 text-lg">Carregando ranking...</div>;
  }
  if (error) {
    return <div className="text-center text-red-500 py-10">{error}</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              className="text-gray-500 hover:text-gray-700 transition-colors mr-4"
              onClick={() => navigate(-1)}
            >
              <FaArrowLeft className="text-lg" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <FaTrophy className="text-2xl text-accent" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Ranking da Avaliação</h1>
                <p className="text-sm text-gray-500">
                  {avaliacao?.titulo || "Carregando..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderMeuCard()}

        {/* Ranking List */}
        <section>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Classificação Geral</h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{participantes} participantes</span>
              </div>
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

        {/* Summary Stats */}
        <section className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center">
              <div className="p-3 bg-primary/10 rounded-lg">
                <FaUsers className="text-2xl text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Participantes</p>
                <p className="text-2xl font-bold text-gray-900">{participantes}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center">
              <div className="p-3 bg-secondary/10 rounded-lg">
                <FaChartLine className="text-2xl text-secondary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pontuação Média</p>
                <p className="text-2xl font-bold text-gray-900">{pontuacaoMedia}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <FaStar className="text-2xl text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Maior Pontuação</p>
                <p className="text-2xl font-bold text-gray-900">{maiorPontuacao}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}