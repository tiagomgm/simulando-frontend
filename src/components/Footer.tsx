import React from "react";
import { FaHammer } from "react-icons/fa";

const FooterGabaritei: React.FC = () => (
  <footer className="bg-white border-t border-gray-200 mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="text-center">
        <p className="text-sm text-gray-500 flex items-center justify-center">
          <FaHammer className="mr-2" />
          Sistema em desenvolvimento - Versão Beta - Tiago Mota
        </p>        
      </div>
    </div>
  </footer>
);

export default FooterGabaritei;