import { FaTimes, FaMedal, FaAward, FaTrophy } from "react-icons/fa";

const medalColors = [
  { bg: "bg-gold", icon: <FaTrophy className="text-white" />, txt: "1º lugar" },
  { bg: "bg-silver", icon: <FaMedal className="text-white" />, txt: "2º lugar" },
  { bg: "bg-bronze", icon: <FaAward className="text-white" />, txt: "3º lugar" }
];

type Props = {
  open: boolean;
  onClose: () => void;
  aluno: any;
  pos: number;
};

export default function RankingAlunoModal({ open, onClose, aluno, pos }: Props) {
  if (!open || !aluno) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 shadow-xl">
        <div className="p-6 relative">
          <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
            <FaTimes size={22} />
          </button>
          <div className="flex flex-col items-center justify-center pb-2">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg mb-2 ${
              pos <= 3 ? medalColors[pos-1].bg : "bg-gray-200"
            }`}>
              {pos === 1 && <FaTrophy className="text-white text-3xl" />}
              {pos === 2 && <FaMedal className="text-white text-3xl" />}
              {pos === 3 && <FaAward className="text-white text-3xl" />}
              {pos > 3 && <span className="text-xl font-bold text-gray-700">{pos}</span>}
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900">
                {aluno.aluno_nome || aluno.aluno || aluno.apelido}
              </h3>
              <div className="text-gray-500 mb-2">
                Colocação: {pos}º lugar
              </div>
              <div className="text-2xl font-bold text-primary">{Math.round(aluno.pontuacao)} <span className="text-gray-700 text-sm font-normal">pontos</span></div>
            </div>
          </div>
          {/* Exemplo: expandir aqui com detalhes das respostas, gráficos etc */}
          <div className="mt-4 text-center text-sm text-gray-500">
            {/* Coloque aqui mais detalhes se quiser */}
            Detalhes do aluno em breve...
          </div>
        </div>
      </div>
    </div>
  );
}