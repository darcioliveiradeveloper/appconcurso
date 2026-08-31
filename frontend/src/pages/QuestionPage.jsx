import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { simuladosApi } from '../api/endpoints';
import { Card, Button, RadioOption } from '../components';

export default function QuestionPage() {
  const { sessionId, questionIndex } = useParams();
  const navigate = useNavigate();
  const index = parseInt(questionIndex);

  const [question, setQuestion] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const questionStartRef = useRef(Date.now());
  const maxReachedRef = useRef(parseInt(sessionStorage.getItem(`max_${sessionId}`) || '0'));

  useEffect(() => {
    // Bloqueia voltar para questão anterior
    if (index < maxReachedRef.current) {
      navigate(`/simulado/${sessionId}/questao/${maxReachedRef.current}`, { replace: true });
      return;
    }
    if (index > maxReachedRef.current) {
      maxReachedRef.current = index;
      sessionStorage.setItem(`max_${sessionId}`, String(index));
    }
    loadQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, index]);

  // Bloqueia voltar do navegador/celular durante o simulado
  useEffect(() => {
    const handlePopState = (e) => {
      e.preventDefault();
      window.history.pushState(null, '', window.location.href);
      if (index < maxReachedRef.current) {
        navigate(`/simulado/${sessionId}/questao/${maxReachedRef.current}`, { replace: true });
      }
    };
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [index, sessionId, navigate]);

  const loadQuestion = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await simuladosApi.getQuestion(sessionId, index);
      setQuestion(res.data.question);
      setSessionInfo({ totalQuestions: res.data.totalQuestions });
      setSelected(null);
      setFeedback(null);
      questionStartRef.current = Date.now();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar questão');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = useCallback(async () => {
    if (selected === null || feedback) return;
    setSubmitting(true);
    try {
      const timeMs = Date.now() - questionStartRef.current;
      const res = await simuladosApi.submitAnswer(sessionId, index, selected);
      setFeedback({
        correct: res.data.correct,
        correctIndex: res.data.correctIndex,
        explanation: res.data.explanation
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao responder');
    } finally {
      setSubmitting(false);
    }
  }, [selected, feedback, sessionId, index]);

  const goNext = () => {
    const next = index + 1;
    if (next < sessionInfo.totalQuestions) {
      navigate(`/simulado/${sessionId}/questao/${next}`, { replace: true });
    } else {
      finish();
    }
  };

  const finish = async () => {
    try {
      sessionStorage.removeItem(`max_${sessionId}`);
      await simuladosApi.finish(sessionId);
      navigate(`/simulado/${sessionId}/resultado`, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message 
        || (err.message?.includes('Backend indisponível') ? err.message : 'Erro de conexão com o servidor. Verifique se o backend está rodando na porta 3000.');
      setError(msg);
    }
  };

  const optionState = (altIdx) => {
    if (!feedback) return selected === altIdx ? 'default' : 'default';
    if (altIdx === feedback.correctIndex) return 'correct';
    if (altIdx === selected && !feedback.correct) return 'incorrect';
    return 'default';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (error && !question) {
    return (
      <Card className="max-w-2xl mx-auto text-center">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <Button onClick={() => navigate('/')}>Voltar ao início</Button>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Barra de progresso */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
          <span>Questão {index + 1} de {sessionInfo?.totalQuestions}</span>
          <span>{question?.topic}</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 transition-all duration-300"
            style={{ width: `${((index + 1) / sessionInfo.totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      <Card>
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 leading-relaxed mb-6 whitespace-pre-line">
          {question?.text}
        </h2>

        <div className="space-y-3 mb-6">
          {question?.alternatives.map((alt, i) => (
            <RadioOption
              key={i}
              selected={selected === i}
              state={optionState(i)}
              disabled={!!feedback}
              onClick={() => setSelected(i)}
            >
              <span className="font-semibold mr-2">{String.fromCharCode(65 + i)})</span>
              {alt}
            </RadioOption>
          ))}
        </div>

        {feedback && (
          <div className={`p-4 rounded-lg mb-6 ${
            feedback.correct
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <p className={`font-semibold mb-1 ${feedback.correct ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
              {feedback.correct ? '✅ Resposta correta!' : `❌ Incorreto. Resposta correta: ${String.fromCharCode(65 + feedback.correctIndex)}`}
            </p>
            {feedback.explanation && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{feedback.explanation}</p>
            )}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg text-red-600 dark:text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <Button variant="secondary" onClick={finish} disabled={submitting}>
            Finalizar agora
          </Button>

          {!feedback ? (
            <Button onClick={handleAnswer} disabled={selected === null} loading={submitting} size="lg">
              Confirmar resposta
            </Button>
          ) : (
            <Button onClick={goNext} size="lg">
              {index + 1 < sessionInfo.totalQuestions ? 'Próxima →' : 'Ver resultado'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}