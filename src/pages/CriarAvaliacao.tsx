import React, { useState } from "react";
import { criarAvaliacao, criarQuestao, criarGrupoValor } from "../api/avaliacao";
import {
  FaArrowLeft, FaSlidersH, FaCheckCircle, FaPlus, FaTrash
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";

// Modal de pontuação personalizada
function ScoringModal({
  open,
  onClose,
  blocos,
  onAddBloco,
  onRemoveBloco,
  onSave,
  maxQuestoes
}: any) {
  const [novo, setNovo] = useState({ inicio: "", fim: "", valor: "" });
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Pontuação Personalizada</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600" type="button">
              <FaArrowLeft size={24} />
            </button>
          </div>
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Questão Inicial</label>
                <input
                  type="number"
                  min="1"
                  max={maxQuestoes}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={novo.inicio}
                  onChange={e => setNovo(n => ({ ...n, inicio: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Questão Final</label>
                <input
                  type="number"
                  min="1"
                  max={maxQuestoes}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={novo.fim}
                  onChange={e => setNovo(n => ({ ...n, fim: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pontos</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={novo.valor}
                  onChange={e => setNovo(n => ({ ...n, valor: e.target.value }))}
                />
              </div>
            </div>
            <button
              className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-orange-600 mb-4"
              type="button"
              onClick={() => {
                if (!novo.inicio || !novo.fim || !novo.valor) return;
                if (parseInt(novo.inicio) > parseInt(novo.fim)) return;
                onAddBloco({
                  inicio: parseInt(novo.inicio),
                  fim: parseInt(novo.fim),
                  valor: parseFloat(novo.valor)
                });
                setNovo({ inicio: "", fim: "", valor: "" });
              }}
            >
              <FaPlus className="inline mr-2" />
              Adicionar Bloco
            </button>
            <div className="space-y-2">
              {blocos.length > 0 &&
                blocos.map((b: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>
                      Questões de {b.inicio} a {b.fim} valem {" "}
                      <span className="font-semibold text-primary">{b.valor} pontos</span>
                    </span>
                    <button
                      type="button"
                      className="text-danger hover:text-red-700"
                      onClick={() => onRemoveBloco(idx)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 font-medium"
              onClick={onSave}
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


export default function CriarAvaliacao() {
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState("multipla_escolha");
  const [alternativasQtd, setAlternativasQtd] = useState("5");
  const [qtdQuestoes, setQtdQuestoes] = useState("");
  const [, setGabaritoPronto] = useState(false);
  const [questoes, setQuestoes] = useState<any[]>([]);
  const [regraErradaAnulaCerta, setRegraErradaAnulaCerta] = useState(false);
  const [usarPontuacaoPersonalizada, setUsarPontuacaoPersonalizada] = useState(false);
  const [blocos, setBlocos] = useState<any[]>([]);
  const [msg, setMsg] = useState("");
  const [valorModalOpen, setValorModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Gera as questões e o array de alternativas
  const gerarQuestoes = () => {
    if (!qtdQuestoes || +qtdQuestoes < 1) return;
    let novasQuestoes = [];
    for (let i = 1; i <= +qtdQuestoes; i++) {
      if (tipo === "multipla_escolha") {
        const alts =
          +alternativasQtd === 4
            ? ["A", "B", "C", "D"]
            : ["A", "B", "C", "D", "E"];
        novasQuestoes.push({
          numero: i,
          alternativas: alts,
          alternativa_correta: "",
        });
      } else {
        novasQuestoes.push({
          numero: i,
          alternativas: ["C", "E"],
          alternativa_correta: "",
        });
      }
    }
    setQuestoes(novasQuestoes);
    setMsg("");
    setGabaritoPronto(false);
  };

  // Marca a alternativa correta clicada
  const marcarCorreta = (idx: number, letra: string) => {
    setQuestoes((qs) =>
      qs.map((q, i) =>
        i === idx ? { ...q, alternativa_correta: letra } : q
      )
    );
    setGabaritoPronto(false);
  };

  // Envio da avaliação com as chamadas de API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    if (!titulo || !qtdQuestoes || !tipo) {
      setMsg("Preencha todos os campos obrigatórios.");
      return;
    }
    if (questoes.length === 0) {
      gerarQuestoes();
      setMsg("Gere as questões e marque o gabarito antes de salvar!");
      return;
    }
    if (questoes.some((q) => !q.alternativa_correta)) {
      setMsg("Marque a resposta correta de todas as questões!");
      return;
    }
    try {
      const avaliacao = await criarAvaliacao({
        titulo,
        tipo,
        regra_errada_anula_certa: tipo === "certo_errado" ? regraErradaAnulaCerta : false,
      });
      if (usarPontuacaoPersonalizada) {
        for (let bloco of blocos) {
          await criarGrupoValor({
            avaliacao: avaliacao.id,
            questao_inicio: bloco.inicio,
            questao_fim: bloco.fim,
            valor: bloco.valor,
          });
        }
      }
      for (let q of questoes) {
        await criarQuestao({
          avaliacao: avaliacao.id,
          numero: q.numero,
          alternativas: q.alternativas,
          alternativa_correta: q.alternativa_correta,
        });
      }
      setToastMessage("Avaliação criada com sucesso!");
      setToastType("success");
      setShowToast(true);
      setTimeout(() => navigate(`/mentor/avaliacao/${avaliacao.id}`), 1500);
    } catch {
      setToastMessage("Erro ao criar avaliação!");
      setToastType("error");
      setShowToast(true);
    }
  };

  // Modal handlers
  const handleAddBloco = (bloco: any) => setBlocos((b) => [...b, bloco]);
  const handleRemoveBloco = (idx: number) =>
    setBlocos((b) => b.filter((_, i) => i !== idx));
  const handleSaveBlocos = () => {
    setValorModalOpen(false);
    setUsarPontuacaoPersonalizada(true);
  };

  // Progresso do gabarito
  const progresso = questoes.length
    ? (questoes.filter((q) => q.alternativa_correta).length / questoes.length) * 100
    : 0;

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 transition-colors">
                <FaArrowLeft className="text-lg" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Criar Nova Avaliação</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Formulário */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Informações Básicas
            </h2>
            <form autoComplete="off" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Avaliação
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
                    placeholder="Ex: Prova de Matemática - Álgebra"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantidade de Questões
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
                      placeholder="20"
                      value={qtdQuestoes}
                      onChange={(e) => setQtdQuestoes(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Avaliação
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value)}
                    >
                      <option value="">Selecione o tipo</option>
                      <option value="multipla_escolha">Múltipla Escolha</option>
                      <option value="certo_errado">Certo/Errado</option>
                    </select>
                  </div>
                </div>
                {tipo === "multipla_escolha" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Alternativas
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="alternatives"
                          value="4"
                          checked={alternativasQtd === "4"}
                          onChange={() => setAlternativasQtd("4")}
                          className="text-primary focus:ring-primary"
                        />
                        <span className="ml-2">4 alternativas (A-D)</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="alternatives"
                          value="5"
                          checked={alternativasQtd === "5"}
                          onChange={() => setAlternativasQtd("5")}
                          className="text-primary focus:ring-primary"
                        />
                        <span className="ml-2">5 alternativas (A-E)</span>
                      </label>
                    </div>
                  </div>
                )}
                {tipo === "certo_errado" && (
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={regraErradaAnulaCerta}
                        onChange={(e) => setRegraErradaAnulaCerta(e.target.checked)}
                        className="text-primary focus:ring-primary"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Uma resposta errada anula uma certa
                      </span>
                    </label>
                  </div>
                )}
                <button
                  type="button"
                  className="w-full bg-primary text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  onClick={gerarQuestoes}
                  disabled={!titulo || !qtdQuestoes || !tipo}
                >
                  <FaCheckCircle className="mr-2 inline" />
                  Marcar Gabarito
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Gabarito (LISTA, não modal!) */}
        {questoes.length > 0 && (
          <>
            {/* Progresso */}
            <section className="mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Progresso do Gabarito
                  </h2>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      {questoes.filter((q) => q.alternativa_correta).length} de {qtdQuestoes || "--"} questões marcadas
                    </span>
                    <button
                      type="button"
                      className="text-primary hover:text-blue-700 font-medium text-sm"
                      onClick={() => setValorModalOpen(true)}
                    >
                      <FaSlidersH className="inline mr-1" />
                      Pontuação Personalizada
                    </button>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progresso}%` }}
                  ></div>
                </div>
              </div>
            </section>
            {/* Lista de Questões */}
            <section className="mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Selecione a Resposta Correta para Cada Questão
                </h2>
                <div className="space-y-6">
                  {questoes.map((q, idx) => (
                    <div
                      key={q.numero}
                      className="flex items-center justify-between bg-gray-50 rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="font-semibold text-primary text-lg">{q.numero}</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            Questão {q.numero}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Selecione a alternativa correta
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {q.alternativas.map((alt: string) => (
                          <button
                            key={alt}
                            type="button"
                            className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center font-semibold text-lg transition-colors ${
                              q.alternativa_correta === alt
                                ? "bg-primary text-white border-primary"
                                : "bg-white border-gray-300 text-primary hover:border-primary"
                            }`}
                            onClick={() => marcarCorreta(idx, alt)}
                          >
                            {alt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            {/* Mensagem */}
            {msg && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 text-danger text-center font-medium">
                {msg}
              </div>
            )}
            {/* Ações */}
            <section className="mb-8 flex justify-end">
              <button
                type="button"
                className="px-8 py-3 bg-secondary text-white font-semibold rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                onClick={() => {
                  if (questoes.some((q) => !q.alternativa_correta)) {
                    setMsg("Marque a resposta correta de todas as questões!");
                    setGabaritoPronto(false);
                    return;
                  }
                  setMsg("");
                  setGabaritoPronto(true);
                  handleSubmit({ preventDefault: () => {} } as React.FormEvent);
                }}
                disabled={questoes.some((q) => !q.alternativa_correta)}
              >
                Gerar Avaliação
              </button>
            </section>
          </>
        )}
        {/* Modal de pontuação personalizada */}
        <ScoringModal
          open={valorModalOpen}
          onClose={() => setValorModalOpen(false)}
          blocos={blocos}
          onAddBloco={handleAddBloco}
          onRemoveBloco={handleRemoveBloco}
          onSave={handleSaveBlocos}
          maxQuestoes={qtdQuestoes || 20}
        />
      </main>

      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        message={toastMessage}
        type={toastType}
      />
    </div>
  );
}