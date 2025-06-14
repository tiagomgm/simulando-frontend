import React, { useState } from "react";
import {
  FaUser, FaAt, FaPhone, FaEnvelope, FaLock,
  FaEye, FaEyeSlash, FaUserGraduate, FaChalkboardTeacher, FaSignInAlt
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from '../assets/logo.png';

// Máscara de telefone
function maskPhone(value: string) {
  value = value.replace(/\D/g, "");
  if (value.length > 11) value = value.slice(0, 11);
  if (value.length > 10) return value.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  if (value.length > 6) return value.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  if (value.length > 2) return value.replace(/(\d{2})(\d{0,5})/, "($1) $2");
  return value;
}

export default function RegisterUser() {
  const [form, setForm] = useState({
    fullname: "",
    username: "",
    phone: "",
    email: "",
    password: "",
    type: "aluno",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value } = e.target;
    if (name === "phone") {
      setForm(f => ({ ...f, [name]: maskPhone(value) }));
    } else if (type === "radio") {
      setForm(f => ({ ...f, type: value }));
    } else {
      setForm(f => ({
        ...f,
        [name]: value,
      }));
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.parentElement?.classList.add("ring-2", "ring-primary");
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.parentElement?.classList.remove("ring-2", "ring-primary");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    setOk(false);
    setLoading(true);

    let payload = {
      username: form.username,
      email: form.email,
      perfil: form.type,
      password: form.password,
      nome_completo: form.fullname,
      telefone: form.phone.replace(/\D/g, ''),
    };

    try {
      await axios.post('http://127.0.0.1:8000/api/register/', payload);
      setOk(true);
      setMsg('Cadastro realizado com sucesso! Faça login.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      if (err.response && err.response.data) {
        if (err.response.data.email) {
          setMsg('E-mail já cadastrado.');
        } else if (err.response.data.username) {
          setMsg('Nome de usuário já em uso.');
        } else {
          setMsg('Erro no cadastro. Verifique os campos.');
        }
      } else {
        setMsg('Erro no cadastro. Tente novamente.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-sans px-2 py-2">
      {/* Brand/top */}
      <div className="text-center mb-2">
        <div className="flex justify-center">
          <img src={logo} alt="Logo" className="h-24" />
        </div>
      </div>

      {/* Card de cadastro */}
      <form
        className="bg-white max-w-md w-full mx-auto rounded-2xl border border-gray-200 shadow-sm px-6 py-4 space-y-3"
        onSubmit={handleSubmit}
        autoComplete="off"
      >
        {msg && (
          <div className={`mb-2 text-center py-1.5 px-3 rounded text-sm ${ok ? "bg-green-100 border border-green-300 text-green-700" : "bg-red-100 border border-red-300 text-red-700"}`}>
            {msg}
          </div>
        )}
        {/* <h1 className="text-3xl font-bold text-gray-900 mb-2">Simulando</h1>
        <p className="text-gray-600">Crie sua conta de mentor</p> */}

        {/* Nome Completo */}
        <div>
          <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-0.5">
            Nome Completo
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <FaUser />
            </span>
            <input
              id="fullname"
              name="fullname"
              type="text"
              placeholder="Digite seu nome completo"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition"
              value={form.fullname}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              required
            />
          </div>
        </div>
        {/* Usuário */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-0.5">
            Usuário
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <FaAt />
            </span>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Digite seu usuário"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition"
              value={form.username}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              required
            />
          </div>
        </div>
        {/* Telefone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-0.5">
            Telefone
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <FaPhone />
            </span>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="(00) 00000-0000"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition"
              value={form.phone}
              onChange={handleChange}
              maxLength={15}
              onFocus={handleFocus}
              onBlur={handleBlur}
              required
            />
          </div>
        </div>
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-0.5">
            Email
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <FaEnvelope />
            </span>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Digite seu email"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition"
              value={form.email}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              required
            />
          </div>
        </div>
        {/* Senha */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-0.5">
            Senha
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <FaLock />
            </span>
            <input
              id="password"
              name="password"
              type={showPass ? "text" : "password"}
              placeholder="Digite sua senha"
              className="w-full pl-10 pr-12 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition"
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
        {/* Tipo de conta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-0.5 text-center">Tipo de Conta</label>
          <div className="flex items-center justify-center gap-6 mt-0.5">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="type"
                value="aluno"
                checked={form.type === "aluno"}
                onChange={handleChange}
                className="form-radio text-primary focus:ring-primary"
              />
              <FaUserGraduate className="ml-2 mr-1 text-gray-500" />
              <span className="text-gray-700 text-sm">Aluno</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="type"
                value="mentor"
                checked={form.type === "mentor"}
                onChange={handleChange}
                className="form-radio text-primary focus:ring-primary"
              />
              <FaChalkboardTeacher className="ml-2 mr-1 text-gray-500" />
              <span className="text-gray-700 text-sm">Mentor</span>
            </label>
          </div>
        </div>
        {/* Botão criar conta */}
        <button
          type="submit"
          className="relative bg-primary text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center w-full group"
          disabled={loading}
        >
          {loading && (
            <div className="absolute inset-0 bg-primary/80 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <span className={loading ? "opacity-0" : "opacity-100"}>
            {loading ? "Criando conta..." : "Cadastrar"}
          </span>
        </button>
      </form>

      {/* Login */}
      <div className="max-w-md w-full mx-auto mt-4 text-center">
        <p className="text-gray-600 mb-2">Já tem uma conta?</p>
        <button
          className="w-full border-2 border-primary text-primary font-semibold py-2 px-4 rounded-lg bg-white hover:bg-primary hover:text-white focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors flex items-center justify-center text-base"
          onClick={() => navigate("/login")}
        >
          <FaSignInAlt className="mr-2" />
          Fazer Login
        </button>
      </div>
    </div>
  );
}