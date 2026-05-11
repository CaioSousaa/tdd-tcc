'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import axios from '../../lib/axios';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await axios.post('/users', { name, email, password });
      router.push('/login');
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) {
        setError('E-mail já cadastrado');
      } else {
        setError('Campos inválidos');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-zinc-800 rounded-2xl p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-amber-400 mb-6 text-center">Criar conta</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-zinc-300 text-sm">
              Nome
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Seu nome"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-zinc-300 text-sm">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="seu@email.com"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-zinc-300 text-sm">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-amber-400 hover:bg-amber-500 text-zinc-900 font-semibold rounded-lg py-2 mt-2 transition-colors disabled:opacity-60"
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>
      </div>
    </main>
  );
}
