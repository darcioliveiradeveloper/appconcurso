import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SubjectSelectPage from './pages/SubjectSelectPage';
import QuestionPage from './pages/QuestionPage';
import ResultPage from './pages/ResultPage';
import ExamModePage from './pages/ExamModePage';
import HistoryPage from './pages/HistoryPage';
import StatsPage from './pages/StatsPage';
import AccessCodesPage from './pages/AccessCodesPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/simulado/novo" element={<SubjectSelectPage />} />
        <Route path="/simulado/:sessionId/questao/:questionIndex" element={<QuestionPage />} />
        <Route path="/simulado/:sessionId/resultado" element={<ResultPage />} />
        <Route path="/prova-oficial" element={<ExamModePage />} />
        <Route path="/historico" element={<HistoryPage />} />
        <Route path="/estatisticas" element={<StatsPage />} />
        <Route path="/admin/codigos" element={<AccessCodesPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}