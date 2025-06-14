import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../utils/token";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft, FaSave, FaCheck, FaTrash, FaBan, FaUndo, FaSlidersH, FaPlus, FaSearch
} from "react-icons/fa";
import Toast from "../components/Toast";

// Modal de pontuação personalizada (mesmo que você já tem)
function ScoringModal({ open, onClose, blocos, onAddBloco, onRemoveBloco, onSave, maxQuestoes = 20 }: any) {
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
            <button type="button" className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium" onClick={onClose}>
              Cancelar
            </button>
            <button type="button" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 font-medium" onClick={onSave}>
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const ALTERNATIVAS = ["A", "B", "C", "D", "E"];

export default function EditarAvaliacao() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [avaliacao, setAvaliacao] = useState<any>(null);
  const [questoes, setQuestoes] = useState<any[]>([]);
  const [blocos, setBlocos] = useState<any[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scoringModalOpen, setScoringModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [alteracoes, setAlteracoes] = useState<{id: number, updates: any}[]>([]);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [ava, qs, bl] = await Promise.all([
          axios.get(`http://127.0.0.1:8000/api/avaliacoes/${id}/`, {
            headers: { Authorization: `Bearer ${getToken()}` },
          }),
          axios.get(`http://127.0.0.1:8000/api/questoes/?avaliacao=${id}`, {
            headers: { Authorization: `Bearer ${getToken()}` },
          }),
          axios.get(`http://127.0.0.1:8000/api/gruposvalor/?avaliacao=${id}`, {
            headers: { Authorization: `Bearer ${getToken()}` },
          }),
        ]);
        setAvaliacao(ava.data);
        setQuestoes(qs.data);
        setBlocos(bl.data);
      } catch (err) {
        setMsg("Erro ao carregar avaliação.");
      }
      setLoading(false);
    }
    load();
  }, [id]);

  // Alteração local só no estado, envio real só ao salvar
  const handleUpdateQuestao = (qid: number, updates: any) => {
    setAlteracoes(prev => {
      const existingIndex = prev.findIndex(a => a.id === qid);
      if (existingIndex >= 0) {
        const newAlteracoes = [...prev];
        newAlteracoes[existingIndex] = {
          id: qid,
          updates: { ...newAlteracoes[existingIndex].updates, ...updates }
        };
        return newAlteracoes;
      }
      return [...prev, { id: qid, updates }];
    });
    setQuestoes(prev => prev.map(q => q.id === qid ? { ...q, ...updates } : q));
  };

  const handleAnularQuestao = (qid: number, anulada: boolean) => {
    setAlteracoes(prev => {
      const existingIndex = prev.findIndex(a => a.id === qid);
      if (existingIndex >= 0) {
        const newAlteracoes = [...prev];
        newAlteracoes[existingIndex] = {
          id: qid,
          updates: { ...newAlteracoes[existingIndex].updates, anulada: !anulada }
        };
        return newAlteracoes;
      }
      return [...prev, { id: qid, updates: { anulada: !anulada } }];
    });
    setQuestoes(prev => prev.map(q => q.id === qid ? { ...q, anulada: !anulada } : q));
  };

  // const handleDeleteQuestao = async (qid: number) => {
  //   if (!window.confirm("Excluir esta questão?")) return;
  //   setSaving(true);
  //   try {
  //     await axios.delete(
  //       `http://127.0.0.1:8000/api/questoes/${qid}/`,
  //       { headers: { Authorization: `Bearer ${getToken()}` } }
  //     );
  //     setQuestoes(questoes.filter(q => q.id !== qid));
  //   } catch {
  //     setMsg("Erro ao excluir questão.");
  //     setTimeout(() => setMsg(""), 3000);
  //   }
  //   setSaving(false);
  // };

  const handleSave = async () => {
    if (alteracoes.length === 0) {
      setMsg("Nenhuma alteração para salvar.");
      setTimeout(() => setMsg(""), 3000);
      return;
    }

    setSaving(true);
    try {
      // PATCH em lote (endpoint customizado, se disponível)
      // Caso não tenha, use Promise.all de PATCHs individuais:
      await Promise.all(
        alteracoes.map(({ id, updates }) =>
          axios.patch(
            `http://127.0.0.1:8000/api/questoes/${id}/`,
            updates,
            { headers: { Authorization: `Bearer ${getToken()}` } }
          )
        )
      );

      // Atualiza
      const [qs] = await Promise.all([
        axios.get(`http://127.0.0.1:8000/api/questoes/?avaliacao=${id}`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        })
      ]);
      setQuestoes(qs.data);
      setAlteracoes([]);
      
      // Mostra o toast e navega de volta
      setShowToast(true);
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (error) {
      setMsg("Erro ao salvar alterações.");
      setTimeout(() => setMsg(""), 3000);
    }
    setSaving(false);
  };

  // Novo GRID de gabarito (lista)
  const renderGabaritoGrid = () => {
    const filteredQuestoes = questoes.filter(q =>
      q.numero.toString().includes(searchTerm)
    );
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Selecione a Resposta Correta para Cada Questão</h2>
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Pesquisar questão..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <div className="max-h-[600px] overflow-y-auto pr-2 space-y-4">
          {filteredQuestoes.map((q) => (
            <div key={q.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="font-semibold text-primary text-lg">{q.numero}</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Questão {q.numero}</h3>
                  <p className="text-sm text-gray-500">Selecione a alternativa correta</p>
                </div>
              </div>
              <div className="flex space-x-2">
                {(q.alternativas?.length ? q.alternativas : ALTERNATIVAS).map((alt: string) => (
                  <button
                    key={alt}
                    type="button"
                    className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center font-semibold text-lg transition-colors ${
                      q.alternativa_correta === alt
                        ? "bg-primary text-white border-primary"
                        : "bg-white border-gray-300 text-primary hover:border-primary"
                    }`}
                    onClick={() => handleUpdateQuestao(q.id, { alternativa_correta: alt })}
                    disabled={saving || q.anulada}
                  >
                    {alt}
                  </button>
                ))}
                {/* Botão de anular/desanular */}
                <button
                  type="button"
                  className={`ml-3 w-12 h-12 border-2 rounded-lg flex items-center justify-center font-semibold text-lg transition-colors
                    ${q.anulada ? "bg-danger/10 border-danger text-danger" : "bg-white border-gray-300 text-danger hover:border-danger"}`}
                  title={q.anulada ? "Desanular questão" : "Anular questão"}
                  onClick={() => handleAnularQuestao(q.id, q.anulada)}
                  disabled={saving}
                >
                  {q.anulada ? <FaUndo /> : <FaBan />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-gray-400">Carregando...</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 transition-colors">
                <FaArrowLeft className="text-lg" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FaCheck className="text-primary text-xl" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Editar Avaliação
                </h1>
              </div>
            </div>
            <button
              className="text-primary hover:text-blue-700 font-medium text-sm flex items-center"
              onClick={() => setScoringModalOpen(true)}
            >
              <FaSlidersH className="inline mr-1" />
              Pontuação Personalizada
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mensagem */}
        {msg && (
          <div className="mb-6 p-4 rounded-lg border bg-green-50 border-green-200 text-green-700 flex items-center">
            <FaCheck className="mr-2" />
            {msg}
          </div>
        )}

        {/* Form */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Informações da Avaliação</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título da Avaliação</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
                  value={avaliacao?.titulo || ""}
                  readOnly
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo da Avaliação</label>
                <div className="flex items-center space-x-4">
                  <span className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg font-medium">
                    Múltipla Escolha
                  </span>
                  <span className="text-sm text-gray-500">(Não editável após criação)</span>
                </div>
              </div>
              {blocos.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pontuação Personalizada</label>
                  <div className="space-y-2">
                    {blocos.map((bloco, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span>
                          Questões de {bloco.inicio} a {bloco.fim} valem {" "}
                          <span className="font-semibold text-primary">{bloco.valor} pontos</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Novo GRID de Gabarito */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {renderGabaritoGrid()}
          </div>
        </section>

        {/* Botões de ação */}
        <section className="flex flex-col sm:flex-row gap-4">
          <button
            className="flex-1 bg-primary text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            onClick={handleSave}
            disabled={saving || alteracoes.length === 0}
          >
            <FaSave className="mr-2 text-lg" />
            <span>Salvar Alterações {alteracoes.length > 0 && `(${alteracoes.length})`}</span>
          </button>
          <button
            className="flex-1 bg-danger text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
            onClick={() => { /* lógica de exclusão da avaliação aqui */ }}
          >
            <FaTrash className="mr-2 text-lg" />
            <span>Excluir Avaliação</span>
          </button>
        </section>
      </main>
      {/* Modal de Pontuação Personalizada */}
      <ScoringModal
        open={scoringModalOpen}
        onClose={() => setScoringModalOpen(false)}
        blocos={blocos}
        onAddBloco={(bloco: any) => setBlocos(b => [...b, bloco])}
        onRemoveBloco={(idx: number) => setBlocos(b => b.filter((_, i) => i !== idx))}
        onSave={() => setScoringModalOpen(false)}
        maxQuestoes={questoes.length || 20}
      />

      {/* Toast */}
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        message="Alterações salvas com sucesso!"
        type="success"
      />
    </div>
  );
}