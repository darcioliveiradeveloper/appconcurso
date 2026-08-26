import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, Input, Button } from '../components';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    if (!form.email) setErrors(prev => ({ ...prev, email: 'Email é obrigatório' }));
    if (!form.password) setErrors(prev => ({ ...prev, password: 'Senha é obrigatória' }));
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Erro ao fazer login' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 mb-4">
            <span className="text-3xl">🎯</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Entrar</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Acesse sua conta para continuar estudando</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.submit && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {errors.submit}
            </div>
          )}

          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            autoComplete="email"
            placeholder="seu@email.com"
            required
          />

          <Input
            label="Senha"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete="current-password"
            placeholder="••••••••"
            required
          />

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Entrar
          </Button>
        </form>

        <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
          Não tem conta? <Link to="/register" className="text-primary-600 hover:underline font-medium">Cadastre-se</Link>
        </p>
      </Card>
    </div>
  );
}