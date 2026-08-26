import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { simuladosApi } from '../api/endpoints';
import { Card, Button, RadioOption, Modal } from '../components';

const EXAM_DURATION_MIN = 180;

export default function ExamModePage() {
  const navigate = useNavigate();

  const [phase, setPhase] = useState('intro'); // intro | running | submitting
  const [sessionId, setSessionId] = useState(null);
  const [questionsCache, setQuestionsCache] = useState({}); // idx -> question
  const [answers, setAnswers] = useState({}); // idx -> selectedIndex
  const [marked, setMarked] = useState(new Set());
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_MIN * 60);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  // Carrega questão atual quando navega
  useEffect(() => {
    if (phase !== 'running' || !sessionId) return;
    if (questionsCache[current]) return;

    simuladosApi.getQuestion(sessionId, current)
      .then(res => {
        setQuestionsCache(prev => ({ ...prev, [current]: res.data.question }));
      })
      .catch(err => setError(err.response?.data?.message || 'Erro ao carregar questão'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, phase, sessionId]);

  const submitExam = useCallback(async () => {
    if (!sessionId) return;
    setPhase('submitting');
    clearInterval(timerRef.current);

    try {
      // Envia todas as respostas em sequência
      const indices = Object.keys(answers).map(Number).sort((a, b) => a - b);
      for (const idx of indices) {
        await simuladosApi.submitAnswer(sessionId, idx, answers[idx]);
      }
      await simuladosApi.finish(sessionId);
      localStorage.removeItem(`exam_timer_${sessionId}`);
      navigate(`/simulado/${sessionId}/resultado`);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao entregar prova');
      setPhase('running');
    }
  }, [sessionId, answers, navigate]);

  // Timer
  useEffect(() => {
    if (phase !== 'running') return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(timerRef.current);
          submitExam();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [phase, submitExam]);

  // Persiste timer ao mudar
  useEffect(() => {
    if (sessionId && phase === 'running') {
      localStorage.setItem(`exam_timer_${sessionId}`, String(timeLeft));
    }
  }, [timeLeft, sessionId, phase]);

  const startExam = async () => {
    try {
      const res = await simuladosApi.start({
        mode: 'exam',
        totalQuestions: 40,
        timeLimitMinutes: EXAM_DURATION_MIN
      });
      setSessionId(res.data.session.id);
      setQuestionsCache({ 0: res.data.question });
      setCurrent(0);
      setAnswers({});
      setMarked(new Set());
      setTimeLeft(EXAM_DURATION_MIN * 60);
      setPhase('running');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao iniciar prova');
    }
  };

  const selectAnswer = (altIdx) => {
    setAnswers(prev => ({ ...prev, [current]: altIdx }));
  };

  const toggleMark = () => {
    setMarked(prev => {
      const next = new Set(prev);
      next.has(current) ? next.delete(current) : next.add(current);
      return next;
    });
  };

  const goToQuestion = (idx) => setCurrent(idx);

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;
  const lowTime = timeLeft < 15 * 60;
  const question = questionsCache[current];

  /* ---------- INTRO ---------- */
  if (phase === 'intro') {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <div className="text-5xl mb-4">📋</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Prova Oficial</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Simulação completa conforme o edital</p>

          <div className="grid grid-cols-2 gap-4 mb-8 text-left max-w-md mx-auto">
            <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Questões</p>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">40</p>
            </div>
            <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Duração</p>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">3h</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg col-span-2 text-sm text-gray-600 dark:text-gray-300">
              Português (5) • Matemática (5) • Informática (5) • Gerais (5) • <strong>Específicos (20)</strong>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg col-span-2 text-sm text-yellow-800 dark:text-yellow-300">
              ⚠️ Eliminatório: ≥ 50 pontos no total + mínimo por disciplina (1 acerto nas básicas, 7 nos específicos)
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg col-span-2 text-sm text-blue-700 dark:text-blue-400">
              ℹ️ Sem feedback durante a prova — igual ao dia real. Você pode navegar entre questões e marcar para revisão.
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg text-red-600 dark:text-red-400 text-sm mb-4">
              {error}
            </div>
          )}

          <Button onClick={startExam} size="lg" className="w-full max-w-xs">
            🚀 Iniciar Prova
          </Button>
        </Card>
      </div>
    );
  }

  /* ---------- SUBMITTING ---------- */
  if (phase === 'submitting') {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        <p className="text-gray-500 dark:text-gray-400">Corrigindo sua prova...</p>
      </div>
    );
  }

  /* ---------- RUNNING ---------- */
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header fixo com timer */}
      <div className={`sticky top-16 z-30 card !p-4 mb-6 ${lowTime ? 'ring-2 ring-red-500' : ''}`}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-bold text-lg text-gray-900 dark:text-gray-100">Prova Oficial</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Respondidas: {answeredCount}/40 | Marcadas: {marked.size}
            </p>
          </div>
          <div className={`text-2xl font-mono font-bold tabular-nums ${lowTime ? 'text-red-600 animate-pulse' : 'text-gray-900 dark:text-gray-100'}`}>
            ⏱ {formatTime(timeLeft)}
          </div>
          <Button variant="danger" onClick={() => setShowConfirm(true)}>
            Entregar Prova
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Questão */}
        <Card>
          {!question ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Questão {current + 1} de 40 — {question.topic}
                </span>
                <button
                  onClick={toggleMark}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    marked.has(current)
                      ? 'bg-yellow-400 text-yellow-900'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                  }`}
                >
                  {marked.has(current) ? '★ Marcada' : '☆ Marcar'}
                </button>
              </div>

              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 leading-relaxed mb-6 whitespace-pre-line">
                {question.text}
              </h2>

              <div className="space-y-3">
                {question.alternatives.map((alt, i) => (
                  <RadioOption
                    key={`${current}-${i}`}
                    selected={answers[current] === i}
                    state={answers[current] === i ? 'default' : 'default'}
                    onClick={() => selectAnswer(i)}
                  >
                    <span className="font-semibold mr-2">{String.fromCharCode(65 + i)})</span>
                    {alt}
                  </RadioOption>
                ))}
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}
            </>
          )}

          {/* Navegação */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="secondary" onClick={() => goToQuestion(current - 1)} disabled={current === 0}>
              ← Anterior
            </Button>
            <Button onClick={() => goToQuestion(current + 1)} disabled={current === 39}>
              Próxima →
            </Button>
          </div>
        </Card>

        {/* Painel lateral de navegação */}
        <Card className="lg:sticky lg:top-40 h-fit">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 text-sm">Navegação</h3>
          <div className="grid grid-cols-8 gap-1.5">
            {Array.from({ length: 40 }).map((_, i) => {
              const isAnswered = answers[i] !== undefined;
              const isMarked = marked.has(i);
              const isCurrent = current === i;
              return (
                <button
                  key={i}
                  onClick={() => goToQuestion(i)}
                  className={`aspect-square rounded-md text-xs font-semibold transition-all ${
                    isCurrent
                      ? 'bg-primary-600 text-white ring-2 ring-primary-400 scale-110'
                      : isMarked
                        ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500'
                        : isAnswered
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-4 space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-green-500 inline-block" /> Respondida ({answeredCount})</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-yellow-400 inline-block" /> Marcada ({marked.size})</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-gray-200 dark:bg-gray-700 inline-block" /> Não respondida ({40 - answeredCount})</div>
          </div>

          <Button variant="danger" className="w-full mt-4" onClick={() => setShowConfirm(true)}>
            Finalizar e Entregar
          </Button>
        </Card>
      </div>

      {/* Modal de confirmação */}
      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Entregar prova?">
        <div className="space-y-4">
          {40 - answeredCount > 0 && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-800 dark:text-yellow-300 text-sm">
              ⚠️ Você tem <strong>{40 - answeredCount} questão(ões) sem responder</strong>. Lembre-se: cada disciplina zerada é eliminatória!
            </div>
          )}
          <p className="text-gray-600 dark:text-gray-400">
            Após entregar, não será possível alterar as respostas. Seu resultado será calculado imediatamente.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowConfirm(false)}>Continuar prova</Button>
            <Button variant="danger" onClick={submitExam}>Sim, entregar agora</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}