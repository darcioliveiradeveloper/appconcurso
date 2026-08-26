import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { subjectsApi } from '../api/endpoints';
import { Card, Button, Input } from '../components';

const SUBJECT_INFO = {
  PORT: { name: 'Língua Portuguesa', icon: '📝', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', examWeight: 5 },
  MAT: { name: 'Matemática', icon: '🔢', color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400', examWeight: 5 },
  INF: { name: 'Informática Básica', icon: '💻', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400', examWeight: 5 },
  GER: { name: 'Conhecimentos Gerais', icon: '🌍', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400', examWeight: 5 },
  ESP: { name: 'Conhecimentos Específicos', icon: '⚙️', color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400', examWeight: 20 }
};

export default function SubjectSelectPage() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [questionCount, setQuestionCount] = useState(20);
  const [mode, setMode] = useState('study');

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const res = await subjectsApi.getAll();
      // Ordena: ESP por último (específicas)
      const ordered = [...res.data.subjects].sort((a, b) => {
        if (a.code === 'ESP') return 1;
        if (b.code === 'ESP') return -1;
        return 0;
      });
      setSubjects(ordered);
    } catch (error) {
      console.error('Erro ao carregar matérias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    if (!selectedSubject) return;
    
    try {
      const res = await subjectsApi.getAll(); // reuse to get API
      // Actually call simulados start
      const startRes = await fetch('/api/simulados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: selectedSubject,
          mode,
          totalQuestions: parseInt(questionCount)
        })
      });
      const data = await startRes.json();
      if (data.session) {
        navigate(`/simulado/${data.session.id}/questao/0`);
      }
    } catch (error) {
      console.error('Erro ao iniciar simulado:', error);
      alert('Erro ao iniciar simulado');
    }
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Novo Simulado</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Escolha a matéria e configure seu simulado</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {subjects.map((subject) => {
          const info = SUBJECT_INFO[subject.code] || { name: subject.name, icon: '📚', color: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' };
          const isSelected = selectedSubject === subject._id;
          
          return (
            <button
              key={subject._id}
              onClick={() => setSelectedSubject(isSelected ? null : subject._id)}
              className={`card relative transition-all ${
                isSelected 
                  ? 'ring-2 ring-primary-500 border-primary-500' 
                  : 'hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 bg-primary-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  ✓
                </div>
              )}
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${info.color}`}>
                  <span className="text-2xl">{info.icon}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{info.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {subject.questionCount || 0} questões disponíveis
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedSubject && (
        <Card className="max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Configurar Simulado</h2>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="label">Modo</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value="study"
                    checked={mode === 'study'}
                    onChange={(e) => setMode(e.target.value)}
                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Estudo Livre</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value="focus"
                    checked={mode === 'focus'}
                    onChange={(e) => setMode(e.target.value)}
                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Focar nas Difíceis</span>
                </label>
              </div>
            </div>

            <div>
              <label className="label">Quantidade de questões</label>
              <Input
                type="number"
                name="questionCount"
                value={questionCount}
                onChange={(e) => setQuestionCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                min="1"
                max="100"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setSelectedSubject(null)} className="flex-1">
              Voltar
            </Button>
            <Button onClick={handleStart} className="flex-1" size="lg">
              Iniciar Simulado
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}