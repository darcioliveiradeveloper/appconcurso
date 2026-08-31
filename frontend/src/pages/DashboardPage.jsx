import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button } from '../components';
import { cargosApi } from '../api/endpoints';

const QUICK_ACTIONS = [
  { 
    title: 'Novo Simulado', 
    desc: 'Escolha a matéria e quantidade de questões', 
    icon: '📝', 
    href: '/simulado/novo',
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
  },
  { 
    title: 'Prova Oficial', 
    desc: 'Simulado completo: 40 questões, 3 horas (conforme edital)', 
    icon: '📋', 
    href: '/prova-oficial',
    color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
  },
  { 
    title: 'Histórico', 
    desc: 'Veja todos os seus simulados anteriores', 
    icon: '📊', 
    href: '/historico',
    color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
  },
  { 
    title: 'Estatísticas', 
    desc: 'Acompanhe sua evolução e pontos fracos', 
    icon: '📈', 
    href: '/estatisticas',
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
  }
];

const CARGO_ORDER = ['PREF_TI', 'DEL_PCPR', 'AGENTE_PCPR', 'PAPILO_PCPR'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [cargos, setCargos] = useState([]);
  const [selectedCargo, setSelectedCargo] = useState(() => localStorage.getItem('selectedCargo') || null);

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
    }).catch(() => {});
  }, []);

  const handleSelectCargo = (code) => {
    setSelectedCargo(code);
    localStorage.setItem('selectedCargo', code);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Olá, {user?.name?.split(' ')[0] || 'Estudante'}! 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Escolha o cargo e como quer estudar hoje
        </p>
      </div>

      {cargos.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Escolha o cargo para estudar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cargos.map(cargo => {
              const isSelected = selectedCargo === cargo.code;
              return (
                <button
                  key={cargo.code}
                  onClick={() => handleSelectCargo(cargo.code)}
                  className={`card text-left transition-all ${isSelected ? 'ring-2 ring-primary-500 border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'hover:shadow-md'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{cargo.code}</span>
                    {isSelected && <span className="text-xs bg-primary-500 text-white px-2 py-1 rounded-full">✓ Selecionado</span>}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{cargo.nome}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{cargo.orgao}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{cargo.totalQuestoes} questões • {cargo.distribuicao.length} disciplinas</p>
                  <p className={`text-xs mt-2 ${cargo.disponivel < cargo.total ? 'text-yellow-600' : 'text-green-600'}`}>
                    {cargo.disponivel}/{cargo.total} questões disponíveis
                  </p>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Cargo selecionado será usado em "Novo Simulado" e "Prova Oficial". Monte seu próprio estudo filtrando matérias do cargo escolhido.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {QUICK_ACTIONS.map((action) => (
          <Link key={action.title} to={action.href} className="block">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${action.color} group-hover:scale-110 transition-transform`}>
                  <span className="text-2xl">{action.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {action.desc}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {(() => {
        const sel = cargos.find(c => c.code === selectedCargo);
        if (!sel) {
          return (
            <div className="mt-10 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg text-center text-gray-500 dark:text-gray-400">
              👆 Selecione um cargo acima para ver a estrutura da prova oficial
            </div>
          );
        }
        const isPref = sel.code === 'PREF_TI';
        return (
          <div className="mt-10">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Estrutura da Prova Oficial — {sel.nome} ({sel.orgao})
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Conforme edital • {sel.totalQuestoes} questões • {isPref ? '2,5 pts por questão' : '1 ponto por questão'}</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-2 font-medium">Disciplina</th>
                    <th className="pb-2 font-medium text-center">Questões</th>
                    <th className="pb-2 font-medium text-center">Pontos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {sel.distribuicao.map(item => (
                    <tr key={item.subjectCode} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-2.5 font-medium text-gray-900 dark:text-gray-100">
                        {item.subjectName}
                        <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500">{item.bloco}</span>
                      </td>
                      <td className="py-2.5 text-center">{item.quantidade}</td>
                      <td className="py-2.5 text-center">{(item.quantidade * (isPref ? 2.5 : 1)).toFixed(2).replace('.', ',')}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 dark:bg-gray-800/50 font-bold">
                    <td className="py-3 text-gray-900 dark:text-gray-100">TOTAL</td>
                    <td className="py-3 text-center">{sel.totalQuestoes}</td>
                    <td className="py-3 text-center">100,00</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {isPref && (
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-800 dark:text-yellow-300">
                <strong>⚠️ Regras de Eliminação (Prefeitura):</strong> ≥ 1 acerto em cada básica, 7 em Específicos e ≥ 50 pontos no total.
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}