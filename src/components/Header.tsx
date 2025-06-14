import React from "react";
import { FaSignOutAlt } from "react-icons/fa";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { removeToken } from "../utils/token";

const HeaderGabaritei: React.FC = () => {
  const navigate = useNavigate();

  // Função para obter o username do token
  const getUsername = () => {
    try {
      const token = sessionStorage.getItem('access');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.username || 'Usuário';
    } catch {
      return 'Usuário';
    }
  };

  // Função para fazer logout
  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  return (
  <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center h-full">
          <img
              className="h-full w-auto object-contain py-2"
              src={logo}
            alt="police badge logo with shield design, black and white, minimalist style"
          />
        </div>
        <div className="flex-1 flex justify-center">
          <h1 className="text-2xl font-bold text-primary">Simulando</h1>
        </div>
        <div className="flex items-center space-x-4">
            <span className="text-lg font-medium text-gray-700">{getUsername()}</span>
          <button
            className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-lg hover:bg-gray-100"
            title="Sair"
              onClick={handleLogout}
          >
              <FaSignOutAlt className="text-xl" />
          </button>
        </div>
      </div>
    </div>
  </header>
);
};

export default HeaderGabaritei;