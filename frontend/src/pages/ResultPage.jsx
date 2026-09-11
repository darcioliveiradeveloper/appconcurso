import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { simuladosApi } from '../api/endpoints';
import { Card, Button, RadioOption } from '../components';

export default function ResultPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(new Set());

  useEffect(() => {
    loadResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Bloqueia voltar para as questões após finalizar
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
      navigate('/inicio', { replace: true });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate]);

  const loadResult = async () => {
    try {
      const res = await simuladosApi.getDetail(sessionId);
      setResult(res.data.session);
    } catch (err) {
      const msg = err.response?.data?.message 
        || (err.message?.includes('Backend indisponível') ? err.message : 'Erro de conexão com o servidor. Verifique se o backend está rodando na porta 3000.');
      setError(msg);
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
  const answeredCount = result.answers?.length ?? 0;
  const correct = r?.score != null ? Math.round((r.score / 100) * totalQuestions) : (result.answers?.filter(a => a.correct).length ?? 0);
  const wrongAnswered = Math.max(0, answeredCount - (correct ?? 0));
  const notAnswered = Math.max(0, totalQuestions - answeredCount);
  const wrong = mode === 'exam' && notAnswered > 0 ? wrongAnswered : totalQuestions - (correct ?? 0);
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
              const displayName = s.subjectName || s.subject?.name || s.subject?.code || 'Disciplina';
              return (
                <div key={s.subject?._id || s.subject} className="flex items-center gap-4">
                  <span className={`w-24 text-right text-sm font-medium ${passedMin ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {passedMin ? '✓ OK' : '✗ Zerou/Risco'}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-900 dark:text-gray-100">{displayName}</span>
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

      {/* Revisão detalhada por questão */}
      {result.questionOrder?.length > 0 && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">📋 Revisão das Questões — veja o que errou</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {result.answers?.length || 0} respondidas de {totalQuestions} • Toque na questão para ver a correta
          </p>
          <div className="space-y-3">
            {(() => {
              const answeredIds = new Set(result.answers?.map(a => (a.question?._id?.toString() || a.question?.toString())) || []);
              const filtered = result.questionOrder.filter(q => answeredIds.has(q._id?.toString() || q.toString()));
              if (filtered.length === 0) {
                return <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma questão respondida para revisar.</p>;
              }
              return filtered.map((q) => {
                const qId = q._id?.toString() || q.toString();
                const idx = result.questionOrder.findIndex(x => (x._id?.toString() || x.toString()) === qId);
                const ans = result.answers?.find(a => (a.question?._id?.toString() || a.question?.toString()) === qId);
                const selectedIdx = ans?.selectedIndex;
                const isCorrect = ans?.correct;
                const correctIdx = q.correctIndex;
                const isExpanded = expanded.has(qId);
                return (
                  <div key={qId} className={`rounded-lg border overflow-hidden ${isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
                    <button
                      onClick={() => {
                        const next = new Set(expanded);
                        if (next.has(qId)) next.delete(qId);
                        else next.add(qId);
                        setExpanded(next);
                      }}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Questão {idx + 1} • {q.topic || 'Geral'}</span>
                      <span className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${isCorrect ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200' : 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200'}`}>
                          {isCorrect ? '✅ Acertou' : '❌ Errou'}
                        </span>
                        <span className="text-gray-400">{isExpanded ? '▲' : '▼'}</span>
                      </span>
                    </button>
                    {isExpanded && (
                      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 whitespace-pre-line">{q.text}</p>
                        <div className="space-y-2">
                          {q.alternatives?.map((alt, i) => {
                            const isSelected = selectedIdx === i;
                            const isCorrectAlt = correctIdx === i;
                            let state = 'default';
                            if (isCorrectAlt) state = 'correct';
                            else if (isSelected && !isCorrect) state = 'incorrect';
                            return (
                              <RadioOption key={i} selected={isSelected} state={state} disabled={true} onClick={() => {}}>
                                <span className="font-semibold mr-2">{String.fromCharCode(65 + i)})</span>{alt}
                                {isSelected && <span className="ml-2 text-xs font-bold">— sua resposta</span>}
                                {isCorrectAlt && <span className="ml-2 text-xs font-bold text-green-700 dark:text-green-400">— correta</span>}
                              </RadioOption>
                            );
                          })}
                        </div>
                        {q.explanation && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-3 bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">💡 {q.explanation}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </Card>
      )}

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
      <div className="text-center pt-2">
        <Link to="/inicio" className="inline-block w-full sm:w-auto">
          <Button variant="secondary" className="w-full sm:w-auto" size="lg">🏠 Voltar ao início</Button>
        </Link>
      </div>
    </div>
  );
}