import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// COMPONENTES DE LAYOUT
import Header from './components/Header';
import Footer from './components/Footer';

// Login e Cadastro
import Login from './pages/Login';
import RegisterUser from './pages/RegisterUser';

// Mentor
import DashboardMentor from './pages/DashboardMentor';
import CriarAvaliacao from './pages/CriarAvaliacao';
import DetalheAvaliacaoMentor from './pages/DetalheAvaliacaoMentor';
import EditarAvaliacao from './pages/EditarAvaliacao';
import RankingMentor from './pages/RankingMentor';
import GerenciarAcesso from './pages/GerenciarAcesso';
import RankingGeral from './pages/RankingGeral';

// Aluno
import DashboardAluno from './pages/DashboardAluno';
import ResponderAvaliacao from './pages/ResponderAvaliacao';
import ResultadoAvaliacao from './pages/ResultadoAvaliacao';
import RankingAluno from './pages/RankingAluno';

function getPerfil() {
  try {
    const token = sessionStorage.getItem('access');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.perfil || null;
  } catch {
    return null;
  }
}

// Rotas protegidas
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const perfil = getPerfil();
  return perfil ? <>{children}</> : <Navigate to="/login" />;
}

function MentorRoute({ children }: { children: React.ReactNode }) {
  return getPerfil() === 'mentor' ? <>{children}</> : <Navigate to="/" />;
}

function AlunoRoute({ children }: { children: React.ReactNode }) {
  return getPerfil() === 'aluno' ? <>{children}</> : <Navigate to="/" />;
}

function HomeRedirect() {
  const perfil = getPerfil();
  if (perfil === 'mentor') return <Navigate to="/mentor/dashboard" />;
  if (perfil === 'aluno') return <Navigate to="/dashboard" />;
  return <Navigate to="/login" />;
}

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isCadastroPage = location.pathname === '/cadastro-usuario';

  return (
    <>
      {!(isLoginPage || isCadastroPage) && <Header />}
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro-usuario" element={<RegisterUser />} />

        {/* Rotas do mentor */}
        <Route path="/mentor/dashboard" element={
          <ProtectedRoute>
            <MentorRoute>
              <DashboardMentor />
            </MentorRoute>
          </ProtectedRoute>
        } />
        <Route path="/mentor/criar-avaliacao" element={
          <ProtectedRoute>
            <MentorRoute>
              <CriarAvaliacao />
            </MentorRoute>
          </ProtectedRoute>
        } />
        <Route path="/mentor/avaliacao/:id" element={
          <ProtectedRoute>
            <MentorRoute>
              <DetalheAvaliacaoMentor />
            </MentorRoute>
          </ProtectedRoute>
        } />
        <Route path="/mentor/editar-avaliacao/:id" element={
          <ProtectedRoute>
            <MentorRoute>
              <EditarAvaliacao />
            </MentorRoute>
          </ProtectedRoute>
        } />
        <Route path="/mentor/ranking/:id" element={
          <ProtectedRoute>
            <MentorRoute>
              <RankingMentor />
            </MentorRoute>
          </ProtectedRoute>
        } />
        <Route path="/mentor/ranking-geral" element={
          <ProtectedRoute>
            <MentorRoute>
              <RankingGeral />
            </MentorRoute>
          </ProtectedRoute>
        } />

        <Route path="/mentor/gerenciar-acesso/:id" element={
          <ProtectedRoute>
            <MentorRoute>
              <GerenciarAcesso />
            </MentorRoute>
          </ProtectedRoute>
        } />  
        {/* Rotas do aluno */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AlunoRoute>
              <DashboardAluno />
            </AlunoRoute>
          </ProtectedRoute>
        } />
        <Route path="/avaliacao/:id/responder" element={
          <ProtectedRoute>
            <AlunoRoute>
              <ResponderAvaliacao />
            </AlunoRoute>
          </ProtectedRoute>
        } />
        <Route path="/resultado/:id" element={
          <ProtectedRoute>
            <AlunoRoute>
              <ResultadoAvaliacao />
            </AlunoRoute>
          </ProtectedRoute>
        } />
        <Route path="/avaliacao/:id/ranking" element={
          <ProtectedRoute>
            <AlunoRoute>
              <RankingAluno />
            </AlunoRoute>
          </ProtectedRoute>
        } />
      </Routes>
      {!(isLoginPage || isCadastroPage) && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}