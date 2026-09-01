import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cargosApi } from '../api/endpoints';

const CARGO_ORDER = ['PREF_TI', 'DEL_PCPR', 'AGENTE_PCPR', 'PAPILO_PCPR'];

export default function CargoSelectPage() {
  const navigate = useNavigate();
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargosApi.getAll().then(res => {
      const sorted = [...res.data.cargos].sort((a, b) => {
        const ia = CARGO_ORDER.indexOf(a.code);
        const ib = CARGO_ORDER.indexOf(b.code);
        if (ia === -1 && ib === -1) return a.code.localeCompare(b.code);
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      });
      setCargos(sorted);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSelect = (code) => {
    localStorage.setItem('selectedCargo', code);
    navigate('/inicio');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Bem vindo ao Vou Passar
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Sua plataforma de simulados para concursos
        </p>
      </div>

      <div className="card mb-6 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border-primary-200 dark:border-primary-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">📚 O que é este app?</h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3">
          Plataforma de estudos com <strong>simulados por matéria</strong>, <strong>foco nas suas dificuldades</strong> e <strong>Prova Oficial</strong> conforme o edital — com timer, navegação e correção detalhada.
        </p>
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3">
          Crie simulados personalizados escolhendo a matéria e a quantidade de questões, ou encare a prova completa no tempo real. Ao final, veja <strong>histórico, estatísticas e recomendações</strong> do que estudar mais.
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-xs">
          Escolha abaixo o cargo para começar. Você poderá trocar a qualquer momento voltando em <strong>Início</strong>.
        </p>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Cargos disponíveis</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cargos.map(cargo => (
          <button
            key={cargo.code}
            onClick={() => handleSelect(cargo.code)}
            className="card text-left hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{cargo.code}</span>
              <span className="text-xs text-primary-600 dark:text-primary-400 opacity-0 group-hover:opacity-100">Selecionar →</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600">{cargo.nome}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{cargo.orgao}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{cargo.totalQuestoes} questões • {cargo.distribuicao.length} disciplinas</p>
            <p className={`text-xs mt-2 ${cargo.disponivel < cargo.total ? 'text-yellow-600' : 'text-green-600'}`}>
              {cargo.disponivel}/{cargo.total} questões disponíveis
            </p>
            <div className="mt-3 text-xs text-gray-400 dark:text-gray-500 line-clamp-2">
              {cargo.distribuicao.map(d => d.subjectCode).join(' • ')}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
