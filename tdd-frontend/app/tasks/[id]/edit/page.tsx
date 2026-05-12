"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/axios";

interface Tag {
  id: string;
  _id?: string;
  name: string;
  color: string;
}

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("low");
  const [dueDate, setDueDate] = useState("");
  const [alertValue, setAlertValue] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [tags, setTags] = useState<Tag[]>([]);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [taskRes, tagsRes] = await Promise.all([
          api.get(`/tasks/${id}`),
          api.get("/tags"),
        ]);

        const task = taskRes.data;
        setTitle(task.title);
        setDescription(task.description || "");
        setStatus(task.status);
        setPriority(task.priority);
        setSelectedTags(task.tags.map((t: any) => t._id || t.id));
        
        if (task.dueDate) {
          setDueDate(new Date(task.dueDate).toISOString().split("T")[0]);
        }
        if (task.alert) {
          setAlertValue(task.alert);
        }

        setTags(tagsRes.data);
        setLoading(false);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError("Tarefa não encontrada");
        } else if (err.response?.status === 403) {
          setError("Sem permissão");
        } else {
          setError("Erro ao carregar os dados.");
        }
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

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
        tags: selectedTags,
      };

      if (description.trim()) payload.description = description;
      if (dueDate) payload.dueDate = new Date(dueDate).toISOString();
      if (alertValue) payload.alert = alertValue;

      await api.put(`/tasks/${id}`, payload);
      router.push("/tasks");
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError("Sem permissão");
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Erro ao atualizar a tarefa.");
      }
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await api.delete(`/tasks/${id}`);
      router.push("/tasks");
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError("Tarefa não encontrada");
      } else if (err.response?.status === 403) {
        setError("Sem permissão");
      } else {
        setError(err.response?.data?.message || "Erro ao excluir a tarefa.");
      }
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-amber-400 animate-pulse">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center py-10 px-4 text-zinc-100 font-sans">
      <div className="w-full max-w-2xl bg-zinc-800 p-8 rounded-lg shadow-xl border border-amber-400/20">
        <h1 className="text-3xl font-bold text-amber-400 mb-6 text-center">Editar Tarefa</h1>

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
                <option value="todo">todo</option>
                <option value="in_progress">in_progress</option>
                <option value="done">done</option>
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
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
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
                  key={tag.id || tag._id}
                  onClick={() => handleTagToggle(tag.id || tag._id!)}
                  className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors ${
                    selectedTags.includes(tag.id || tag._id!)
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
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-amber-400 hover:bg-amber-500 text-zinc-900 font-bold py-3 px-4 rounded-md transition-colors"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-md transition-colors"
            >
              Excluir
            </button>
          </div>
        </form>
      </div>

      {showDeleteModal && (
        <div role="dialog" className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-800 border border-zinc-700 p-6 rounded-lg max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Confirmar Exclusão</h2>
            <p className="text-zinc-300 mb-6">
              Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Excluindo..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
