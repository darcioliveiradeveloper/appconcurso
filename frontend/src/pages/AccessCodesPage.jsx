import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Input } from '../components';
import api from '../api/axios';

export default function AccessCodesPage() {
  const [codes, setCodes] = useState([]);
  const [quantity, setQuantity] = useState('1');
  const [newCodes, setNewCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, available: 0, used: 0 });

  const loadCodes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/access-codes');
      setCodes(res.data.codes);
      setPagination(res.data.pagination);
    } catch (e) {
      setError(e.response?.data?.message || 'Erro ao carregar códigos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCodes();
  }, [loadCodes]);

  const generate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const qty = parseInt(quantity) || 1;
      const res = await api.post('/access-codes/generate', { quantity: qty });
      setNewCodes(res.data.codes);
      await loadCodes();
    } catch (e) {
      setError(e.response?.data?.message || 'Erro ao gerar códigos');
    } finally {
      setGenerating(false);
    }
  };

  const copyAll = () => {
    if (newCodes.length === 0) return;
    navigator.clipboard.writeText(newCodes.join('\n'));
    alert('Códigos copiados!');
  };

  const revoke = async (id, isUsed) => {
    const msg = isUsed
      ? 'Excluir este código e BLOQUEAR o usuário? (cadastro mantido, mas não poderá usar o app)'
      : 'Revogar este código?';
    if (!window.confirm(msg)) return;
    try {
      await api.delete(`/access-codes/${id}`);
      await loadCodes();
    } catch (e) {
      setError(e.response?.data?.message || 'Erro ao revogar');
    }
  };

  const generateForUser = async (userId, userName) => {
    if (!window.confirm(`Gerar novo código para ${userName}? O usuário será desbloqueado se estava bloqueado.`)) return;
    try {
      const res = await api.post('/access-codes/for-user', { userId });
      setNewCodes([res.data.code]);
      await loadCodes();
    } catch (e) {
      setError(e.response?.data?.message || 'Erro ao gerar código para usuário');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Códigos de Liberação</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          Gere códigos de uso único para permitir novos cadastros.
        </p>

        <div className="flex items-end gap-4 flex-wrap">
          <div className="w-32">
            <Input
              label="Quantidade"
              name="quantity"
              type="number"
              min="1"
              max="100"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <Button onClick={generate} loading={generating}>
            Gerar códigos
          </Button>
          {newCodes.length > 0 && (
            <Button variant="secondary" onClick={copyAll}>
              Copiar todos ({newCodes.length})
            </Button>
          )}
        </div>

        {newCodes.length > 0 && (
          <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Códigos gerados:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {newCodes.map((c, i) => (
                <code key={i} className="font-mono text-primary-700 dark:text-primary-300 bg-white dark:bg-gray-800 p-2 rounded border border-primary-200 dark:border-gray-700 text-sm">
                  {c}
                </code>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100">Códigos existentes</h2>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {pagination.available} disponíveis • {pagination.used} usados • {pagination.total} total
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : codes.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhum código ainda.</p>
        ) : (
          <div className="space-y-2">
            {codes.map(c => (
              <div key={c._id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                <div>
                  <code className="font-mono text-sm font-semibold text-gray-800 dark:text-gray-200">{c.code}</code>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {c.used
                      ? `Usado por ${c.usedBy?.name || 'usuário'} (${c.usedBy?.email || ''}) em ${new Date(c.usedAt).toLocaleString()}`
                      : 'Disponível'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {c.used ? (
                    <>
                      <button onClick={() => generateForUser(c.usedBy?._id, c.usedBy?.name || 'usuário')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                        Gerar novo
                      </button>
                      <button onClick={() => revoke(c._id, true)} className="text-xs text-red-600 dark:text-red-400 hover:underline">
                        Excluir (bloquear)
                      </button>
                    </>
                  ) : (
                    <button onClick={() => revoke(c._id, false)} className="text-xs text-red-600 dark:text-red-400 hover:underline">
                      Revogar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
