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
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [tagsFilter, setTagsFilter] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (priorityFilter) params.priority = priorityFilter;
      if (tagsFilter.length > 0) params.tags = tagsFilter.join(",");

      const response = await api.get("/tasks", { params });
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

  const fetchTags = async () => {
    try {
      const response = await api.get("/tags");
      setAvailableTags(response.data);
    } catch (err) {
      console.error("Erro ao carregar tags", err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return;

    try {
      setError(null);
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push("/");
      } else {
        setError("Erro ao excluir tarefa");
      }
    }
  };

  const toggleTagFilter = (tagId: string) => {
    setTagsFilter((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  useEffect(() => {
    fetchTasks();
  }, [priorityFilter, tagsFilter]);

  useEffect(() => {
    fetchTags();
  }, []);

  const tasksByStatus = {
    todo: tasks.filter((t) => t.status === "todo"),
    in_progress: tasks.filter((t) => t.status === "in_progress"),
    done: tasks.filter((t) => t.status === "done"),
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Quadro Kanban</h1>
            <p className="text-zinc-400 mt-1">Visualize e organize suas tarefas</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/tags"
              className="px-4 py-2 bg-zinc-800 text-white font-semibold rounded-md border border-zinc-700 hover:bg-zinc-700 transition-colors flex items-center justify-center"
            >
              Gerenciar Tags
            </Link>
            <Link
              href="/tasks/new"
              className="px-4 py-2 bg-amber-400 text-black font-semibold rounded-md shadow hover:bg-amber-500 transition-colors flex items-center justify-center"
            >
              Nova Tarefa
            </Link>
          </div>
        </div>

        {/* Painel de Filtros */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="priority-filter" className="block text-sm font-medium text-zinc-300 mb-2">
                Prioridade
              </label>
              <select
                id="priority-filter"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2.5 outline-none transition-all"
              >
                <option value="">Todas</option>
                <option value="high">Alta</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.length === 0 ? (
                  <p className="text-zinc-500 text-sm italic">Nenhuma tag criada</p>
                ) : (
                  availableTags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTagFilter(tag.id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                        tagsFilter.includes(tag.id)
                          ? "ring-2 ring-amber-400 border-transparent shadow-[0_0_10px_rgba(251,191,36,0.3)]"
                          : "border-zinc-700 opacity-60 hover:opacity-100"
                      }`}
                      style={{
                        backgroundColor: tag.color,
                        color: "#000",
                      }}
                    >
                      {tag.name}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 text-red-400 rounded-md border border-red-500/50">
            {error}
          </div>
        )}

        {/* Board Kanban */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {(["todo", "in_progress", "done"] as const).map((status) => (
            <div key={status} className="flex flex-col h-full min-h-[600px]">
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    status === "todo" ? "bg-zinc-500" : status === "in_progress" ? "bg-amber-400" : "bg-emerald-500"
                  }`}></span>
                  {statusLabels[status]}
                </h2>
                <span className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded text-xs font-mono">
                  {tasksByStatus[status].length}
                </span>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 flex-1 space-y-4 shadow-inner backdrop-blur-sm">
                {loading ? (
                  <div className="flex justify-center items-center py-10">
                    <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : tasksByStatus[status].length === 0 ? (
                  <div className="text-center py-12 px-4 border-2 border-dashed border-zinc-800 rounded-lg">
                    <p className="text-zinc-500 text-sm italic">Nenhuma tarefa aqui</p>
                  </div>
                ) : (
                  tasksByStatus[status].map((task) => (
                    <div
                      key={task.id}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 hover:border-zinc-700 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#3b82f6' }}></div>
                      
                      <div className="flex justify-between items-start mb-3 pl-2">
                        <span className={`px-2 py-0.5 text-[9px] font-black rounded border uppercase tracking-wider ${priorityColors[task.priority]}`}>
                          {priorityLabels[task.priority]}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/tasks/${task.id}/edit`}
                            className="p-1.5 text-zinc-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-md transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                          </Link>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors cursor-pointer"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                          </button>
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-white mb-2 pl-2 line-clamp-2 leading-tight group-hover:text-amber-400 transition-colors">
                        {task.title}
                      </h3>
                      
                      {task.description && (
                        <p className="text-zinc-500 text-xs mb-4 pl-2 line-clamp-2 italic">
                          {task.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-1.5 mb-4 pl-2">
                        {task.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="px-1.5 py-0.5 rounded-sm text-[9px] font-bold text-black shadow-sm"
                            style={{ backgroundColor: tag.color }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>

                      {task.dueDate && (
                        <div className="mt-4 pt-3 border-t border-zinc-800/50 flex items-center gap-2 pl-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          <span className="text-[10px] text-zinc-500 font-medium">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

