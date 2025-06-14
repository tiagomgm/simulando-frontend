import React, { useState } from "react";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";

type ScoringModalProps = {
  open: boolean;
  onClose: () => void;
  blocos: any[];
  onAddBloco: (bloco: any) => void;
  onRemoveBloco: (idx: number) => void;
  onSave: () => void;
  maxQuestoes?: number;
};

const ScoringModal: React.FC<ScoringModalProps> = ({
  open,
  onClose,
  blocos,
  onAddBloco,
  onRemoveBloco,
  onSave,
  maxQuestoes = 20
}) => {
  const [novo, setNovo] = useState({ inicio: "", fim: "", valor: "" });

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Pontuação Personalizada</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              type="button"
            >
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
                blocos.map((b, idx) => (
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
};

export default ScoringModal;