"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

interface Tag {
  id: string;
  name: string;
  color: string;
}

export default function NewTaskPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("low");
  const [dueDate, setDueDate] = useState("");
  const [alertValue, setAlertValue] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [tags, setTags] = useState<Tag[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await api.get("/tags");
        setTags(response.data);
      } catch (err) {
        console.error("Failed to load tags", err);
      }
    };
    fetchTags();
  }, []);

  const handleTagToggle = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      return;
    }

    try {
      const payload: any = {
        title,
        status,
        priority,
      };

      if (description.trim()) payload.description = description;
      if (selectedTags.length > 0) payload.tags = selectedTags;
      if (dueDate) payload.dueDate = new Date(dueDate).toISOString();
      if (alertValue) payload.alert = new Date(alertValue).toISOString();

      const response = await api.post("/tasks", payload);
      if (response.status === 201) {
        router.push("/tasks");
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Erro ao criar a tarefa.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center py-10 px-4 text-zinc-100">
      <div className="w-full max-w-2xl bg-zinc-800 p-8 rounded-lg shadow-xl border border-amber-400/20">
        <h1 className="text-3xl font-bold text-amber-400 mb-6 text-center">Criar Nova Tarefa</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-amber-400 mb-1">
              Título
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 text-zinc-100"
              placeholder="Digite o título da tarefa"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-amber-400 mb-1">
              Descrição
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 text-zinc-100 min-h-[100px]"
              placeholder="Descreva os detalhes da tarefa..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-amber-400 mb-1">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 text-zinc-100"
              >
                <option value="todo">A Fazer</option>
                <option value="in_progress">Em Progresso</option>
                <option value="done">Concluído</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-amber-400 mb-1">
                Prioridade
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 text-zinc-100"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-400 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  type="button"
                  key={tag.id}
                  onClick={() => handleTagToggle(tag.id)}
                  className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors ${
                    selectedTags.includes(tag.id)
                      ? "bg-amber-400 text-zinc-900 border-amber-400"
                      : "bg-zinc-800 text-zinc-300 border-zinc-600 hover:border-amber-400"
                  }`}
                >
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: tag.color }}
                  ></span>
                  {tag.name}
                </button>
              ))}
              {tags.length === 0 && (
                <span className="text-zinc-500 text-sm">Nenhuma tag disponível</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-amber-400 mb-1">
                Data de Vencimento
              </label>
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 text-zinc-100"
              />
            </div>

            <div>
              <label htmlFor="alert" className="block text-sm font-medium text-amber-400 mb-1">
                Alerta
              </label>
              <input
                id="alert"
                type="text"
                value={alertValue}
                onChange={(e) => setAlertValue(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 text-zinc-100"
                placeholder="Ex: 2025-12-30T08:00"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-amber-400 hover:bg-amber-500 text-zinc-900 font-bold py-3 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-amber-400"
            >
              Criar Tarefa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
