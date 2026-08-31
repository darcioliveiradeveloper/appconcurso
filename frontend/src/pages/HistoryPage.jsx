import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { simuladosApi } from '../api/endpoints';
import { Card, Button } from '../components';

const MODE_LABELS = {
  study: { label: '📝 Estudo', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
  exam: { label: '📋 Prova Oficial', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' },
  focus: { label: '🎯 Focado', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' }
};

export default function HistoryPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [modeFilter, setModeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, modeFilter]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await simuladosApi.getHistory({
        page: pagination.page,
        limit: 10,
        mode: modeFilter || undefined
      });
      setSessions(res.data.sessions);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Tem certeza que deseja limpar todo o histórico? Esta ação não pode ser desfeita.')) return;
    setClearing(true);
    try {
      await simuladosApi.clearHistory();
      setSessions([]);
      setPagination({ page: 1, pages: 1, total: 0 });
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao limpar histórico');
    } finally {
      setClearing(false);
    }
  };

  const scoreColor = (score) =>
    score >= 70 ? 'text-green-600 dark:text-green-400' : score >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400';

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">📊 Histórico</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Todos os seus simulados finalizados</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={modeFilter}
            onChange={(e) => { setModeFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            className="input w-auto"
          >
            <option value="">Todos os modos</option>
            <option value="study">Estudo Livre</option>
            <option value="exam">Prova Oficial</option>
            <option value="focus">Focado nas Difíceis</option>
          </select>
          {sessions.length > 0 && (
            <Button variant="danger" size="sm" onClick={handleClear} loading={clearing}>
              🗑️ Limpar
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : sessions.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-5xl mb-4">🗂️</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Nenhum simulado ainda</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Comece seu primeiro simulado agora!</p>
          <Link to="/simulado/novo">
            <Button size="lg">🚀 Criar primeiro simulado</Button>
          </Link>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {sessions.map((s) => {
              const modeInfo = MODE_LABELS[s.mode] || MODE_LABELS.study;
              return (
                <Card key={s._id} className="!p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/simulado/${s._id}/resultado`)}>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${modeInfo.color}`}>
                      {modeInfo.label}
                    </span>
                    {s.subject && (
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{s.subject.name}</span>
                    )}
                    <div className="flex-1 min-w-[100px]">
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden max-w-xs">
                        <div
                          className={`h-full ${s.result?.score >= 70 ? 'bg-green-500' : s.result?.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${s.result?.score || 0}%` }}
                        />
                      </div>
                    </div>
                    <span className={`text-xl font-bold tabular-nums ${scoreColor(s.result?.score || 0)}`}>
                      {s.result?.score ?? 0}%
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(s.finishedAt).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(s.finishedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Paginação */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button variant="secondary" disabled={pagination.page <= 1}
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>
                ← Anterior
              </Button>
              <span className="text-sm text-gray-500 dark:text-gray-400 px-4">
                Página {pagination.page} de {pagination.pages} ({pagination.total} simulados)
              </span>
              <Button variant="secondary" disabled={pagination.page >= pagination.pages}
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>
                Próxima →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}