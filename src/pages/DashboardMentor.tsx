import React, { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../utils/token";
import {useNavigate } from "react-router-dom";
import {
  FaClipboardList, FaUsers, FaPlus, FaEdit, FaTrash, FaEye, FaUserCheck, FaSearch
} from "react-icons/fa";

export default function DashboardMentor() {
  const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalAvaliacoes: 0, alunosInscritos: 0 });
  const [estatisticasAvaliacoes, setEstatisticasAvaliacoes] = useState<any[]>([]);
  const [rankingGeral, setRankingGeral] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const resp = await axios.get("http://127.0.0.1:8000/api/dashboard-mentor/", {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        setAvaliacoes(resp.data.avaliacoes || []);
        setStats({
          totalAvaliacoes: resp.data.totalAvaliacoes || 0,
          alunosInscritos: resp.data.totalAlunos || 0,
        });
        setEstatisticasAvaliacoes(resp.data.estatisticas_avaliacoes || []);
        setRankingGeral(resp.data.ranking_geral || []);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleExcluirAvaliacao = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Tem certeza que deseja excluir esta avaliação?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/avaliacoes/${id}/`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        setAvaliacoes(avaliacoes.filter(av => av.id !== id));
        setStats(prev => ({
          ...prev,
          totalAvaliacoes: prev.totalAvaliacoes - 1
        }));
      } catch (error) {
        console.error("Erro ao excluir avaliação:", error);
        alert("Erro ao excluir avaliação. Tente novamente.");
      }
    }
  };

  const formatarData = (dataString: string) => {
    if (!dataString) return "--";
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  // Filtrar avaliações baseado no termo de busca
  const filteredAvaliacoes = avaliacoes.filter(av => 
    av.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <FaClipboardList className="text-2xl text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Avaliações</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalAvaliacoes}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-secondary/10 rounded-lg">
                  <FaUsers className="text-2xl text-secondary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Alunos</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.alunosInscritos}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Create New Assessment CTA */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-primary to-blue-600 rounded-lg shadow-sm p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaPlus className="text-2xl text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Criar Nova Avaliação</h2>
              <p className="text-blue-100 mb-6">Adicione uma nova avaliação para seus alunos</p>
              <button
                className="bg-white text-primary font-semibold px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => navigate('/mentor/criar-avaliacao')}
              >
                Criar Avaliação
              </button>
            </div>
          </div>
        </section>

        {/* Assessments List */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Minhas Avaliações</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar avaliação..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Ordenar por:</span>
                <select className="text-sm border border-gray-300 rounded-md px-3 py-2">
                <option>Mais recentes</option>
                <option>Mais antigas</option>
                <option>Alfabética</option>
              </select>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {loading ? (
              <div className="col-span-2 text-center text-gray-400">Carregando...</div>
            ) : filteredAvaliacoes.length === 0 ? (
              <div className="col-span-2 text-center text-gray-400">
                {searchTerm ? "Nenhuma avaliação encontrada com esse termo." : "Nenhuma avaliação criada ainda."}
              </div>
            ) : (
              filteredAvaliacoes.map((av: any) => (
                <div
                  key={av.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/mentor/avaliacao/${av.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{av.titulo}</h3>
                      <p className="text-sm text-gray-500">Criada em {formatarData(av.data_criacao)}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${av.ativa ? "bg-secondary/10 text-secondary" : "bg-gray-100 text-gray-600"}`}>
                      {av.ativa ? "Ativa" : "Inativa"}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <FaUserCheck className="mr-2" />
                    <span>{typeof av.alunos_que_responderam === 'number' ? av.alunos_que_responderam : 0} alunos responderam</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3" onClick={e => e.stopPropagation()}>
                      <button
                        className="text-primary hover:text-blue-700 transition-colors"
                        title="Editar"
                        onClick={() => navigate(`/mentor/editar-avaliacao/${av.id}`)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                        title="Visualizar"
                        onClick={() => navigate(`/mentor/avaliacao/${av.id}`)}
                      >
                        <FaEye />
                      </button>
                      <button
                        className="text-danger hover:text-red-700 transition-colors"
                        title="Excluir"
                        onClick={(e) => handleExcluirAvaliacao(av.id, e)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                    <span className="text-xs text-gray-500">ID: #{String(av.id).padStart(3, '0')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* General Statistics */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Estatísticas Gerais</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Desempenho por Avaliação</h3>
              <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2">
                {estatisticasAvaliacoes.map((est, idx) => (
                  <div key={est.id || idx} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">{est.titulo}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full`}
                          style={{
                            width: `${est.percentual}%`,
                            background: ["#1976d2", "#43a047", "#ff9800", "#a855f7"][idx % 4]
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{est.percentual}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Alunos</h3>
              <div className="space-y-4">
                {rankingGeral.slice(0, 5).map((al, idx) => (
                  <div key={al.nome_completo || al.nome || idx} className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${idx === 0 ? "bg-accent" : idx === 1 ? "bg-gray-400" : idx === 2 ? "bg-amber-600" : "bg-gray-300"}`}>
                      <span className={`text-sm font-bold ${idx < 3 ? "text-white" : "text-gray-600"}`}>{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{al.nome_completo || al.nome}</p>
                      <p className="text-xs text-gray-500">Total: {al.totalPontuacao || 0} pontos</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button 
                  className="w-full text-sm text-primary hover:text-blue-700 font-medium flex items-center justify-center gap-1 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => navigate('/mentor/ranking-geral')}
                >
                  Ver ranking geral
                  <FaEye className="text-sm" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

