import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button } from '../components';

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

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Olá, {user?.name?.split(' ')[0] || 'Estudante'}! 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Escolha como quer estudar hoje
        </p>
      </div>

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

      <div className="mt-10">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Estrutura da Prova Oficial (Edital)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <th className="pb-2 font-medium">Disciplina</th>
                <th className="pb-2 font-medium text-center">Questões</th>
                <th className="pb-2 font-medium text-center">Pontos</th>
                <th className="pb-2 font-medium text-center">Mínimo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="py-3 font-medium text-gray-900 dark:text-gray-100">Língua Portuguesa</td>
                <td className="py-3 text-center">5</td>
                <td className="py-3 text-center">12,50</td>
                <td className="py-3 text-center">2,50 (1 acerto)</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="py-3 font-medium text-gray-900 dark:text-gray-100">Matemática</td>
                <td className="py-3 text-center">5</td>
                <td className="py-3 text-center">12,50</td>
                <td className="py-3 text-center">2,50 (1 acerto)</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="py-3 font-medium text-gray-900 dark:text-gray-100">Informática Básica</td>
                <td className="py-3 text-center">5</td>
                <td className="py-3 text-center">12,50</td>
                <td className="py-3 text-center">2,50 (1 acerto)</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="py-3 font-medium text-gray-900 dark:text-gray-100">Conhecimentos Gerais</td>
                <td className="py-3 text-center">5</td>
                <td className="py-3 text-center">12,50</td>
                <td className="py-3 text-center">2,50 (1 acerto)</td>
              </tr>
              <tr className="bg-primary-50 dark:bg-primary-900/20 font-semibold">
                <td className="py-3 text-gray-900 dark:text-gray-100">Conhecimentos Específicos</td>
                <td className="py-3 text-center text-primary-600 dark:text-primary-400">20</td>
                <td className="py-3 text-center text-primary-600 dark:text-primary-400">50,00</td>
                <td className="py-3 text-center text-primary-600 dark:text-primary-400">17,50 (7 acertos)</td>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-800/50 font-bold">
                <td className="py-3 text-gray-900 dark:text-gray-100">TOTAL</td>
                <td className="py-3 text-center">40</td>
                <td className="py-3 text-center">100,00</td>
                <td className="py-3 text-center">≥ 50,00 pontos</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-800 dark:text-yellow-300">
          <strong>⚠️ Regras de Eliminação:</strong> Você precisa acertar pelo menos 1 questão em <strong>CADA</strong> disciplina básica e 7 questões em Específicos, além de nota geral ≥ 50 pontos. Não zere nenhuma matéria!
        </div>
      </div>
    </div>
  );
}