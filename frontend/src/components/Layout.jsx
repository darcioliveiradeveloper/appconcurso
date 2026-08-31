import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <NavLink to="/" className="flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                <span className="font-bold text-xl text-primary-600 dark:text-primary-400">Concurso TI</span>
              </NavLink>
              <nav className="hidden md:flex items-center gap-6">
                <NavLink to="/" className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-primary-600' : 'text-gray-600 dark:text-gray-400 hover:text-primary-600'}`}>
                  Início
                </NavLink>
                <NavLink to="/simulado/novo" className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-primary-600' : 'text-gray-600 dark:text-gray-400 hover:text-primary-600'}`}>
                  Novo Simulado
                </NavLink>
                <NavLink to="/prova-oficial" className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-primary-600' : 'text-gray-600 dark:text-gray-400 hover:text-primary-600'}`}>
                  Prova Oficial
                </NavLink>
                <NavLink to="/historico" className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-primary-600' : 'text-gray-600 dark:text-gray-400 hover:text-primary-600'}`}>
                  Histórico
                </NavLink>
                <NavLink to="/estatisticas" className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-primary-600' : 'text-gray-600 dark:text-gray-400 hover:text-primary-600'}`}>
                  Estatísticas
                </NavLink>
                {user?.role === 'admin' && (
                  <NavLink to="/admin/codigos" className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-primary-600' : 'text-gray-600 dark:text-gray-400 hover:text-primary-600'}`}>
                    Códigos
                  </NavLink>
                )}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                    {user.name}
                  </span>
                  <button onClick={handleLogout} className="btn-secondary text-sm">
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}