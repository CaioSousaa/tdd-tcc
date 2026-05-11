"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../lib/axios";

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  tags: Tag[];
  dueDate?: string;
}

const statusLabels = {
  todo: "A Fazer",
  in_progress: "Em Progresso",
  done: "Concluído",
};

const priorityLabels = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
};

const priorityColors = {
  low: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/50",
  high: "bg-red-500/20 text-red-400 border-red-500/50",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/tasks");
      setTasks(response.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push("/");
      } else {
        setError("Erro ao carregar tarefas");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Minhas Tarefas</h1>
            <p className="text-zinc-400 mt-1">Gerencie suas atividades diárias</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/tags"
              className="px-4 py-2 bg-zinc-800 text-white font-semibold rounded-md border border-zinc-700 hover:bg-zinc-700 transition-colors"
            >
              Gerenciar Tags
            </Link>
            <Link
              href="/tasks/new"
              className="px-4 py-2 bg-amber-400 text-black font-semibold rounded-md shadow hover:bg-amber-500 transition-colors"
            >
              Nova Tarefa
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 text-red-400 rounded-md border border-red-500/50">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900 rounded-lg border border-zinc-800">
            <p className="text-zinc-400 text-lg mb-4">Nenhuma tarefa encontrada</p>
            <Link
              href="/tasks/new"
              className="text-amber-400 hover:underline"
            >
              Criar minha primeira tarefa
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col hover:border-zinc-700 transition-colors shadow-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2 py-0.5 text-xs font-bold rounded border uppercase ${priorityColors[task.priority]}`}>
                    {priorityLabels[task.priority]}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {statusLabels[task.status]}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{task.title}</h3>
                <p className="text-zinc-400 text-sm mb-4 line-clamp-2">
                  {task.description || "Sem descrição"}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {task.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-2 py-1 rounded text-[10px] font-bold text-black flex items-center gap-1"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-4 border-t border-zinc-800 flex justify-between items-center">
                  {task.dueDate ? (
                    <span className="text-xs text-zinc-500">
                      Vence em: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  ) : (
                    <span></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
