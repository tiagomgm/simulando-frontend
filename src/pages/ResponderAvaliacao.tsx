import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listarQuestoes, enviarRespostas } from '../api/avaliacao';
import { getToken } from '../utils/token';
import {
  FaArrowLeft, FaCheck, FaPaperPlane, FaListOl, FaClock
} from 'react-icons/fa';
import logo from '../assets/logo.png';

export default function ResponderAvaliacao() {
  const { id } = useParams(); // id da avaliação
  const navigate = useNavigate();
  const [questoes, setQuestoes] = useState<any[]>([]);
  const [avaliacao, setAvaliacao] = useState<any>(null);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function carregarQuestoes() {
      setLoading(true);
      try {
        const token = getToken();
        if (!token) {
          navigate('/login');
          return;
        }
        const data = await listarQuestoes(id, token);
        if (Array.isArray(data)) {
          setQuestoes(data);
          setAvaliacao({});
        } else if (data && data.questoes) {
          setQuestoes(data.questoes);
          setAvaliacao(data.avaliacao || {});
        } else {
          setMsg('Erro ao carregar questões. Formato de dados inválido.');
        }
      } catch (error) {
        setMsg('Erro ao carregar questões. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    }
    carregarQuestoes();
  }, [id, navigate]);

  const handleChange = (questaoId: number, alternativa: string) => {
    setRespostas(prev => ({ ...prev, [questaoId]: alternativa }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setMsg('');
    
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }
    const respostasQuestoes = questoes.map(q => ({
      questao: q.id,
      alternativa_marcada: respostas[q.id]
    }));

    try {
      await enviarRespostas(id, respostasQuestoes, token);
      setShowSuccess(true);
      setTimeout(() => navigate(`/dashboard`), 1800);
    } catch (err) {
      setMsg('Erro ao enviar respostas! Por favor, tente novamente.');
    }
    setEnviando(false);
  };

  // Progresso
  const respondidas = Object.keys(respostas).length;
  const totalQuestoes = questoes.length;
  const perc = totalQuestoes ? Math.round((respondidas / totalQuestoes) * 100) : 0;

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen text-gray-400 text-lg">
      Carregando questões...
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  if (window.confirm('Tem certeza que deseja voltar? Suas respostas serão perdidas.')) {
                    navigate(-1);
                  }
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-lg hover:bg-gray-100"
              >
                <FaArrowLeft className="text-lg" />
              </button>
              <div className="flex items-center space-x-3">
                <FaCheck className="text-primary text-xl" />
                <h1 className="text-xl font-semibold text-gray-900">Responder Avaliação</h1>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              <span>{respondidas} de {totalQuestoes} respondidas</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info da Avaliação */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <img src={logo} alt="Logo" className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{avaliacao?.titulo || "Avaliação"}</h2>
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <FaListOl className="mr-2" />
                    <span>{questoes.length} questões</span>
                  </div>
                  <div className="flex items-center">
                    <FaClock className="mr-2" />
                    <span>Sem limite de tempo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Barra de Progresso Fixa */}
        <div className="sticky top-16 z-40 bg-gray-50 py-2 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progresso</span>
              <span>{perc}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${perc}%` }}
              ></div>
            </div>
          </div>
        </div>

        {questoes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Nenhuma questão encontrada para esta avaliação.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              {questoes.map((q, idx) => (
                <div
                  key={q.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                  id={`question-${idx + 1}`}
                >
                  <div className="mb-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="bg-primary text-white text-sm font-semibold px-3 py-1 rounded-full">{idx + 1}</span>
                      <span className="text-sm text-gray-500">
                        Questão {idx + 1} de {questoes.length}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900">{q.enunciado}</p>
                  </div>
                  <div className="space-y-3">
                    {q.alternativas && q.alternativas.map((alt: string, i: number) => (
                      <label
                        key={i}
                        className={`
                          flex items-center p-4 border rounded-lg cursor-pointer transition-colors
                          ${respostas[q.id] === alt[0] ? "border-primary bg-primary/5" : "border-gray-200 hover:bg-gray-50"}
                        `}
                      >
                        <input
                          type="radio"
                          name={`question-${q.id}`}
                          value={alt[0]}
                          className="sr-only"
                          checked={respostas[q.id] === alt[0]}
                          onChange={() => handleChange(q.id, alt[0])}
                          required
                        />
                        <div className={`radio-custom w-5 h-5 border-2 rounded-full mr-4 flex items-center justify-center ${respostas[q.id] === alt[0] ? "border-primary" : "border-gray-300"}`}>
                          <div className={`w-2.5 h-2.5 bg-primary rounded-full ${respostas[q.id] === alt[0] ? "" : "hidden"}`}></div>
                        </div>
                        <span className="text-gray-900 font-medium">{alt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Mensagem */}
            {msg && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-6 text-danger text-center font-medium">
                {msg}
              </div>
            )}

            <section className="mt-12 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <div className="mb-4">
                    <p className="text-gray-600 mb-2">Você pode deixar questões sem resposta se necessário.</p>
                    <p className="text-sm text-gray-500">Algumas avaliações podem ter questões onde uma resposta errada anula uma certa.</p>
                  </div>
                  <button
                    type="submit"
                    className="bg-primary text-white font-semibold py-4 px-8 rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center mx-auto"
                    disabled={enviando}
                  >
                    {enviando ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                        </svg>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane className="mr-3" />
                        Enviar Respostas
                      </>
                    )}
                  </button>
                </div>
              </div>
            </section>
          </form>
        )}

        {/* Modal de sucesso */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-4 text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheck className="text-3xl text-success" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Respostas Enviadas!</h3>
              <p className="text-gray-600 mb-6">Suas respostas foram enviadas com sucesso. Você será redirecionado em instantes.</p>
              <button
                className="bg-primary text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => {
                  setShowSuccess(false);
                  navigate('/dashboard');
                }}
              >
                Continuar
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}