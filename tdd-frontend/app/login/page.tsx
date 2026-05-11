"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../lib/axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("/sessions", { email, password });
      
      if (response.status === 200) {
        localStorage.setItem("token", response.data.token);
        router.push("/dashboard");
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("E-mail ou senha inválidos");
      } else {
        setError("Ocorreu um erro ao fazer login.");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-900 px-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-zinc-800 p-8 shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">Entrar</h2>
          <p className="mt-2 text-sm text-zinc-400">Acesse sua conta para continuar</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 sm:text-sm"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm font-medium text-red-500 text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-amber-400 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-colors"
            >
              Entrar
            </button>
          </div>
          
          <p className="mt-4 text-center text-sm text-zinc-400">
            Não possui uma conta?{' '}
            <Link href="/register" className="text-amber-400 hover:text-amber-300 transition-colors">
              Registre-se
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
