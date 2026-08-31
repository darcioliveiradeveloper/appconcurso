import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import api from '../api/axios';
import { Card, Button } from '../components';
import { simuladosApi } from '../api/endpoints';

export default function StatsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topicStats, setTopicStats] = useState({}); // topic -> {correct,total}
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await api.get('/simulados/history', { params: { limit: 50, page: 1 } });
      const list = res.data.sessions;
      setSessions(list);

      // Agrega desempenho por tópico a partir das sessões detalhadas (limitado às 10 últimas p/ não pesar)
      const detailSessions = await Promise.all(
        list.slice(0, 10).map(s => api.get(`/simulados/${s._id}`).catch(() => null))
      );

      const stats = {};
      for (const res2 of detailSessions.filter(Boolean)) {
        const session = res2.data.session;
        const questions = session.answers?.question ?? [];
        // answers.question populado com topic
        for (const ans of session.answers || []) {
          const q = ans.question;
          if (!q?.topic) continue;
          if (!stats[q.topic]) stats[q.topic] = { correct: 0, total: 0 };
          stats[q.topic].total++;
          if (ans.correct) stats[q.topic].correct++;
        }
      }
      setTopicStats(stats);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    } finally {
      setLoading(false);
    }
  };

  // Dados do gráfico de evolução (cronológico)
  const evolutionData = [...sessions]
    .reverse()
    .map((s, i) => ({
      name: `#${i + 1}`,
      nota: s.result?.score ?? 0,
      data: new Date(s.finishedAt).toLocaleDateString('pt-BR'),
      modo: s.mode
    }));

  // Tópicos ordenados por taxa de erro (piores primeiro)
  const topicData = Object.entries(topicStats)
    .filter(([, v]) => v.total >= 1)
    .map(([topic, v]) => ({
      topic,
      taxaAcerto: Math.round((v.correct / v.total) * 100),
      erros: v.total - v.correct,
      total: v.total
    }))
    .sort((a, b) => a.taxaAcerto - b.taxaAcerto)
    .slice(0, 10);

  const avgScore = sessions.length > 0
    ? Math.round(sessions.reduce((acc, s) => acc + (s.result?.score ?? 0), 0) / sessions.length)
    : 0;

  const bestScore = sessions.length > 0 ? Math.max(...sessions.map(s => s.result?.score ?? 0)) : 0;
  const examCount = sessions.filter(s => s.mode === 'exam').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  const handleClear = async () => {
    if (!window.confirm('Limpar histórico e estatísticas? Esta ação não pode ser desfeita.')) return;
    setClearing(true);
    try {
      await simuladosApi.clearHistory();
      setSessions([]);
      setTopicStats({});
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao limpar');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">📈 Estatísticas</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Sua evolução e pontos fracos</p>
        </div>
        {sessions.length > 0 && (
          <Button variant="danger" size="sm" onClick={handleClear} loading={clearing}>
            🗑️ Limpar
          </Button>
        )}
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="!p-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Simulados</p>
          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{sessions.length}</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Média geral</p>
          <p className={`text-3xl font-bold ${avgScore >= 70 ? 'text-green-600' : avgScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>{avgScore}%</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Melhor nota</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{bestScore}%</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Provas oficiais</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">{examCount}</p>
        </Card>
      </div>

      {/* Evolução */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Evolução das notas</h2>
        {evolutionData.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">Faça simulados para ver sua evolução aqui.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#8884" />
              <XAxis dataKey="name" stroke="#888" fontSize={12} />
              <YAxis domain={[0, 100]} stroke="#888" fontSize={12} unit="%" />
              <Tooltip
                formatter={(value) => [`${value}%`, 'Nota']}
                labelFormatter={(label, payload) => payload?.[0]?.payload?.data || label}
              />
              <Line type="monotone" dataKey="nota" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Pontos fracos por tópico */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">🎓 Tópicos que você mais erra</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Baseado nos últimos 10 simulados. Priorize os da esquerda (menor % de acerto).
        </p>
        {topicData.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">Sem dados suficientes ainda.</p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(280, topicData.length * 40)}>
            <BarChart data={topicData} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#8884" />
              <XAxis type="number" domain={[0, 100]} unit="%" stroke="#888" fontSize={12} />
              <YAxis type="category" dataKey="topic" stroke="#888" fontSize={11} width={140} />
              <Tooltip formatter={(value, name) => [`${value}%`, 'Taxa de acerto']} />
              <Bar dataKey="taxaAcerto" radius={[0, 4, 4, 0]}>
                {topicData.map((entry, i) => (
                  <Cell key={i} fill={entry.taxaAcerto >= 70 ? '#22c55e' : entry.taxaAcerto >= 50 ? '#eab308' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}