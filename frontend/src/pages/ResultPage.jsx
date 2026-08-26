import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { simuladosApi } from '../api/endpoints';
import { Card, Button } from '../components';

export default function ResultPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const loadResult = async () => {
    try {
      const res = await simuladosApi.getDetail(sessionId);
      setResult(res.data.session);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar resultado');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (error || !result) {
    return (
      <Card className="max-w-2xl mx-auto text-center">
        <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Resultado não encontrado'}</p>
        <Button onClick={() => navigate('/')}>Voltar ao início</Button>
      </Card>
    );
  }

  const { result: r, mode, totalQuestions } = result;
  const correct = r?.score != null ? Math.round((r.score / 100) * totalQuestions) : null;
  const wrong = totalQuestions - (correct ?? 0);
  const scoreColor = r?.score >= 70 ? 'text-green-600 dark:text-green-400' : r?.score >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400';

  const priorityStyles = {
    high: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
    medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    low: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
  };

  const priorityLabels = { high: '🔴 Prioridade ALTA', medium: '🟡 Prioridade MÉDIA', low: '🔵 Prioridade BAIXA' };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Score principal */}
      <Card className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          {mode === 'exam' ? '📋 Resultado da Prova Oficial' : mode === 'focus' ? '🎯 Resultado do Simulado Focado' : '📝 Resultado do Simulado'}
        </h1>

        {mode === 'exam' && (
          <div className={`inline-block px-6 py-3 rounded-xl mb-6 text-xl font-bold ${
            r.passed
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
          }`}>
            {r.passed ? '✅ APROVADO' : '❌ REPROVADO'} — mas continue estudando!
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-6">
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">Acertos</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{correct}</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">Erros</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{wrong}</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">Nota</p>
            <p className={`text-3xl font-bold ${scoreColor}`}>{r.score}%</p>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="max-w-lg mx-auto">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ${
                r.score >= 70 ? 'bg-green-500' : r.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${r.score}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Meta: ≥ 70% | Eliminatório na prova real: &lt; 50%</p>
        </div>
      </Card>

      {/* Desempenho por matéria (modo prova) */}
      {r.bySubject?.length > 0 && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">📊 Desempenho por Disciplina</h2>
          <div className="space-y-3">
            {r.bySubject.map((s) => {
              const passedMin = s.correct >= s.minRequired;
              return (
                <div key={s.subject} className="flex items-center gap-4">
                  <span className={`w-24 text-right text-sm font-medium ${passedMin ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {passedMin ? '✓ OK' : '✗ Zerou/Risco'}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-900 dark:text-gray-100">{s.subjectName || 'Disciplina'}</span>
                      <span className="text-gray-500 dark:text-gray-400">{s.correct}/{s.total} (mín. {s.minRequired})</span>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passedMin ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${s.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Recomendações de estudo */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">🎓 O que você deve estudar mais</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Baseado nos seus erros neste simulado:
        </p>

        {r.recommendations?.length > 0 ? (
          <div className="space-y-3">
            {r.recommendations.map((rec, i) => (
              <div key={i} className={`p-4 rounded-lg border ${priorityStyles[rec.priority]}`}>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-semibold">{rec.topic}</p>
                    <p className="text-sm opacity-80">{rec.reason}</p>
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap">{priorityLabels[rec.priority]}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-700 dark:text-green-400">
            🎉 Nenhum ponto fraco detectado neste simulado. Excelente trabalho!
          </div>
        )}
      </Card>

      {/* Ações */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/simulado/novo" className="block">
          <Button variant="secondary" className="w-full" size="lg">📝 Novo Simulado</Button>
        </Link>
        <Link to="/prova-oficial" className="block">
          <Button variant="primary" className="w-full" size="lg">📋 Prova Oficial</Button>
        </Link>
        <Link to="/historico" className="block">
          <Button variant="secondary" className="w-full" size="lg">📊 Ver Histórico</Button>
        </Link>
      </div>
    </div>
  );
}