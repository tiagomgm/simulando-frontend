import { useEffect, useState } from "react";
import {
  FaArrowLeft, FaSave, FaArrowRight, FaArrowLeft as FaLeft, FaUserCheck, FaUsersSlash, FaSearch, FaTimes
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { getToken } from "../utils/token";
import Toast from "../components/Toast";

interface Aluno {
  id: number;
  nome: string;
  email: string;
  avatar: string;
  acesso: boolean;
  respondeu?: boolean;
}

export default function GerenciarAcessoAlunos() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [avaliacao, setAvaliacao] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [alteracoes, setAlteracoes] = useState<{alunos: number[], tipo: 'liberar' | 'revogar'}[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [ava, allAlunos, alunosAcessoResp, alunosResponderamResp] = await Promise.all([
          axios.get(`http://127.0.0.1:8000/api/avaliacoes/${id}/`, {
            headers: { Authorization: `Bearer ${getToken()}` }
          }),
          axios.get(`http://127.0.0.1:8000/api/usuarios/?perfil=aluno`, {
            headers: { Authorization: `Bearer ${getToken()}` }
          }),
          axios.get(`http://127.0.0.1:8000/api/avaliacoes/${id}/alunos-com-acesso/`, {
            headers: { Authorization: `Bearer ${getToken()}` }
          }),
          axios.get(`http://127.0.0.1:8000/api/avaliacoes/${id}/alunos-que-responderam/`, {
            headers: { Authorization: `Bearer ${getToken()}` }
          }),
        ]);
        setAvaliacao(ava.data);
  
        const idsComAcesso = new Set(alunosAcessoResp.data.map((a: any) => a.id));
        const idsResponderam = new Set(alunosResponderamResp.data);
  
        const alunosComStatus = allAlunos.data.map((aluno: any) => ({
          id: aluno.id,
          nome: aluno.nome_completo || aluno.nome || aluno.username || aluno.email,
          email: aluno.email,
          avatar: aluno.avatar || `https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-${aluno.id % 9 + 1}.jpg`,
          acesso: idsComAcesso.has(aluno.id),
          respondeu: idsResponderam.has(aluno.id),
        }));
        setAlunos(alunosComStatus);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
      setLoading(false);
    }
    loadData();
  }, [id]);
  // Filtro de pesquisa
  const alunosFiltrados = alunos.filter(
    aluno => aluno && aluno.nome && aluno.nome.toLowerCase().includes(search.toLowerCase())
  );

  // Sem acesso e com acesso
  const semAcesso = alunosFiltrados.filter(a => !a.acesso);
  const comAcesso = alunosFiltrados.filter(a => a.acesso);
  const comAcessoRespondeu = comAcesso.filter(a => a.respondeu);

  // Liberar acesso individual
  function grantAccess(alunoId: number) {
    setAlteracoes(prev => [...prev, { alunos: [alunoId], tipo: 'liberar' }]);
    setAlunos(alunos =>
      alunos.map(a => a.id === alunoId ? { ...a, acesso: true } : a)
    );
  }

  // Revogar acesso individual
  function revokeAccess(alunoId: number) {
    setAlteracoes(prev => [...prev, { alunos: [alunoId], tipo: 'revogar' }]);
    setAlunos(alunos =>
      alunos.map(a => a.id === alunoId ? { ...a, acesso: false } : a)
    );
  }

  // Liberar todos
  function grantAll() {
    if (window.confirm("Tem certeza que deseja liberar acesso para todos os alunos?")) {
      const ids = alunos.filter(a => !a.acesso).map(a => a.id);
      setAlteracoes(prev => [...prev, { alunos: ids, tipo: 'liberar' }]);
      setAlunos(alunos => alunos.map(a => ({ ...a, acesso: true })));
    }
  }

  // Revogar todos
  function revokeAll() {
    if (window.confirm("Tem certeza que deseja revogar acesso de todos os alunos?")) {
      const ids = alunos.filter(a => a.acesso).map(a => a.id);
      setAlteracoes(prev => [...prev, { alunos: ids, tipo: 'revogar' }]);
      setAlunos(alunos => alunos.map(a => ({ ...a, acesso: false })));
    }
  }

  // Salvar todas as alterações
  async function handleSave() {
    if (alteracoes.length === 0) {
      setToastMessage("Nenhuma alteração para salvar");
      setToastType('error');
      setShowToast(true);
      return;
    }

    setSaving(true);
    try {
      // Agrupa as alterações por tipo
      const liberarIds = alteracoes
        .filter(a => a.tipo === 'liberar')
        .flatMap(a => a.alunos);
      
      const revogarIds = alteracoes
        .filter(a => a.tipo === 'revogar')
        .flatMap(a => a.alunos);

      // Aplica as alterações
      if (liberarIds.length > 0) {
        await axios.post(`http://127.0.0.1:8000/api/avaliacoes/${id}/liberar-acesso/`, {
          alunos: liberarIds
        }, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
      }

      if (revogarIds.length > 0) {
        await axios.post(`http://127.0.0.1:8000/api/avaliacoes/${id}/revogar-acesso/`, {
          alunos: revogarIds
        }, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
      }

      setAlteracoes([]);
      setToastMessage("Alterações salvas com sucesso!");
      setToastType('success');
      setShowToast(true);

      // Atualiza os dados
      const [ava, allAlunos, alunosAcessoResp, alunosResponderamResp] = await Promise.all([
        axios.get(`http://127.0.0.1:8000/api/avaliacoes/${id}/`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        }),
        axios.get(`http://127.0.0.1:8000/api/usuarios/?perfil=aluno`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        }),
        axios.get(`http://127.0.0.1:8000/api/avaliacoes/${id}/alunos-com-acesso/`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        }),
        axios.get(`http://127.0.0.1:8000/api/avaliacoes/${id}/alunos-que-responderam/`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        }),
      ]);

      setAvaliacao(ava.data);
      const idsComAcesso = new Set(alunosAcessoResp.data.map((a: any) => a.id));
      const idsResponderam = new Set(alunosResponderamResp.data);
      const alunosComStatus = allAlunos.data.map((aluno: any) => ({
        id: aluno.id,
        nome: aluno.nome_completo || aluno.nome || aluno.username || aluno.email,
        email: aluno.email,
        avatar: aluno.avatar || `https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-${aluno.id % 9 + 1}.jpg`,
        acesso: idsComAcesso.has(aluno.id),
        respondeu: idsResponderam.has(aluno.id),
      }));
      setAlunos(alunosComStatus);

      // Aguarda 1.5 segundos para mostrar o toast e então volta
      setTimeout(() => {
        navigate(-1);
      }, 1500);

    } catch (error) {
      console.error("Erro ao salvar alterações:", error);
      setToastMessage("Erro ao salvar alterações");
      setToastType('error');
      setShowToast(true);
    }
    setSaving(false);
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-gray-400 text-lg">Carregando...</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {loading}
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 transition-colors">
                <FaArrowLeft className="text-lg" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Gerenciar Acesso - {avaliacao?.titulo}</h1>
                <span className="text-sm text-gray-500">Liberar ou revogar acesso dos alunos</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                onClick={handleSave}
                disabled={saving || alteracoes.length === 0}
              >
                <FaSave className="mr-2 inline-block" />
                <span>{saving ? "Salvando..." : `Salvar Alterações ${alteracoes.length > 0 ? `(${alteracoes.length})` : ''}`}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <section className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Pesquisar alunos por nome..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              {search && (
                <button
                  className="text-gray-500 hover:text-gray-700 px-3 py-2"
                  onClick={() => setSearch("")}
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Access Management Grid */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Students Without Access */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Sem Acesso</h2>
                  <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded-full">{semAcesso.length} alunos</span>
                </div>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {semAcesso.length === 0 && (
                    <div className="text-gray-400 text-center text-sm py-6">Nenhum aluno sem acesso</div>
                  )}
                  {semAcesso.map(aluno => (
                    <div key={aluno.id} className="student-item p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{aluno.nome}</p>
                            <p className="text-xs text-gray-500">{aluno.email}</p>
                          </div>
                        </div>
                        <button
                          className="grant-access-btn text-secondary hover:text-green-600 transition-colors"
                          onClick={() => grantAccess(aluno.id)}
                          title="Liberar acesso"
                        >
                          <FaArrowRight className="text-lg" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Students With Access */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Com Acesso</h2>
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full">{comAcesso.length} alunos</span>
                </div>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {comAcesso.length === 0 && (
                    <div className="text-gray-400 text-center text-sm py-6">Nenhum aluno com acesso</div>
                  )}
                  {comAcesso.map(aluno => (
                    <div key={aluno.id} className="student-item p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{aluno.nome}</p>
                            <p className="text-xs text-gray-500">{aluno.email}</p>
                            <span className={`text-xs font-medium ${aluno.respondeu ? "text-green-600" : "text-yellow-600"}`}>
                              {aluno.respondeu ? "Respondeu" : "Pendente"}
                            </span>
                          </div>
                        </div>
                        <button
                          className="revoke-access-btn text-danger hover:text-red-600 transition-colors"
                          onClick={() => revokeAccess(aluno.id)}
                          title="Revogar acesso"
                        >
                          <FaLeft className="text-lg" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Summary Section */}
        <section className="mt-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{alunos.length}</p>
                  <p className="text-sm text-gray-600">Total de Alunos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{comAcesso.length}</p>
                  <p className="text-sm text-gray-600">Com Acesso</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{semAcesso.length}</p>
                  <p className="text-sm text-gray-600">Sem Acesso</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{comAcessoRespondeu.length}</p>
                  <p className="text-sm text-gray-600">Já Responderam</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center"
                  onClick={grantAll}
                >
                  <FaUserCheck className="mr-2" />
                  Liberar Todos
                </button>
                <button
                  className="bg-danger text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center"
                  onClick={revokeAll}
                >
                  <FaUsersSlash className="mr-2" />
                  Revogar Todos
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Toast */}
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        message={toastMessage}
        type={toastType}
      />
    </div>
  );
}