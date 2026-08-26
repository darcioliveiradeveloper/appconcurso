import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, Input, Button } from '../components';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!form.email) newErrors.email = 'Email é obrigatório';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'Email inválido';
    if (!form.password) newErrors.password = 'Senha é obrigatória';
    else if (form.password.length < 6) newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Senhas não coincidem';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Erro ao cadastrar' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 mb-4">
            <span className="text-3xl">🎯</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Criar Conta</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Comece a estudar para o concurso agora</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.submit && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {errors.submit}
            </div>
          )}

          <Input
            label="Nome completo"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
            autoComplete="name"
            placeholder="Seu nome"
            required
          />

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
            autoComplete="new-password"
            placeholder="Mínimo 6 caracteres"
            required
          />

          <Input
            label="Confirmar senha"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            autoComplete="new-password"
            placeholder="Repita a senha"
            required
          />

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Criar conta
          </Button>
        </form>

        <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
          Já tem conta? <Link to="/login" className="text-primary-600 hover:underline font-medium">Entrar</Link>
        </p>
      </Card>
    </div>
  );
}