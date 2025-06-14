import React, { useState } from "react";
import {
  FaUser, FaLock, FaEye, FaEyeSlash
} from "react-icons/fa";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import logo from '../assets/logo.png';

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.parentElement?.classList.add("ring-2", "ring-primary");
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.parentElement?.classList.remove("ring-2", "ring-primary");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Envio para endpoint de login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      const resp = await axios.post(
        "http://127.0.0.1:8000/api/token/",
        { email: form.email, password: form.password }
      );
      sessionStorage.setItem("access", resp.data.access);
      sessionStorage.setItem("refresh", resp.data.refresh);

      // Decodifica o JWT para pegar o perfil
      const payload = JSON.parse(atob(resp.data.access.split('.')[1]));
      const perfil = payload.perfil;

      // Redireciona conforme perfil
      if (perfil === "mentor") {
        navigate("/mentor/dashboard");
      } else if (perfil === "aluno") {
        navigate("/dashboard");
      } else {
        setMsg("Perfil inválido!");
      }
    } catch (err) {
      setMsg("Usuário, e-mail ou senha inválidos!");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50 font-sans">
      {/* Overlay de loading */}
      {loading}
      <div className="max-w-md w-full space-y-8 z-10">
        {/* Brand */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Logo" className="h-32" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* <h1 className="text-3xl font-bold text-gray-900 mb-2 font-['Poppins'] font-semibold text-center">Simulando</h1>
          <p className="text-gray-600 text-center">Acesse sua conta</p> */}
          {msg && (
            <div className="mb-4 text-center py-2 px-3 rounded bg-red-100 border border-red-300 text-red-700 text-sm">
              {msg}
            </div>
          )}
          <form className="space-y-6" autoComplete="off" onSubmit={handleSubmit}>
            {/* Email ou Usuário */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email ou Usuário
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </span>
                <input
                  type="text"
                  id="email"
                  name="email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors"
                  placeholder="Digite seu email ou usuário"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  required
                  autoFocus
                />
              </div>
            </div>
            {/* Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </span>
                <input
                  type={showPass ? "text" : "password"}
                  id="password"
                  name="password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors"
                  placeholder="Digite sua senha"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPass(s => !s)}
                  aria-label="Mostrar/ocultar senha"
                >
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            {/* Lembrar de mim */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                name="remember"
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                checked={form.remember}
                onChange={handleChange}
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                Lembrar de mim
              </label>
            </div>
            {/* Botão Entrar */}
            <div className="flex flex-col space-y-4">
              <button
                type="submit"
                className="relative bg-primary text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center w-full group"
                disabled={loading}
              >
                {loading && (
                  <div className="absolute inset-0 bg-primary/80 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <span className={loading ? "opacity-0" : "opacity-100"}>
                  {loading ? "Entrando..." : "Entrar"}
                </span>
              </button>
              <p className="text-center text-sm text-gray-600">
                Não tem uma conta?{" "}
                <Link to="/cadastro-usuario" className="text-primary hover:text-blue-700 font-medium">
                  Registre-se
                </Link>
              </p>
            </div>
          </form>
        </div>
        {/* Rodapé */}
        <div className="text-center text-xs text-gray-400 mt-8">
          <p>
            Esqueceu a senha? Fale com seu mentor.<br />
            &copy; Projeto em desenvolvimento — {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}