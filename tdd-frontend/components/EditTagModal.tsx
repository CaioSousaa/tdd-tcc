import React, { useState, useEffect } from "react";
import api from "../lib/axios";
import { useRouter } from "next/navigation";

export interface Tag {
  id: string;
  name: string;
  color: string;
  owner?: string;
  createdAt?: string;
}

interface EditTagModalProps {
  tag: Tag;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditTagModal({ tag, onClose, onSuccess }: EditTagModalProps) {
  const [name, setName] = useState(tag.name);
  const [color, setColor] = useState(tag.color);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setName(tag.name);
    setColor(tag.color);
  }, [tag]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await api.put(`/tags/${tag.id}`, { name, color });
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError("Você não tem permissão para esta ação");
      } else if (err.response?.status === 404) {
        setError("Tag não encontrada");
      } else if (err.response?.status === 401) {
        router.push("/");
      } else {
        setError("Erro ao editar tag");
      }
    }
  };

  const handleDelete = async () => {
    setError(null);
    try {
      await api.delete(`/tags/${tag.id}`);
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError("Você não tem permissão para esta ação");
      } else if (err.response?.status === 404) {
        setError("Tag não encontrada");
      } else if (err.response?.status === 401) {
        router.push("/");
      } else {
        setError("Erro ao excluir tag");
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-zinc-900 rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Editar Tag</h2>
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded-md text-sm border border-red-500/50">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-1">
                Nome da Tag
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                placeholder="Ex: Trabalho"
              />
            </div>
            <div>
              <label htmlFor="color" className="block text-sm font-medium text-zinc-300 mb-1">
                Cor
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-12 p-1 bg-zinc-800 border border-zinc-700 rounded-md cursor-pointer"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                  placeholder="#000000"
                  pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                />
              </div>
            </div>
            <div className="mt-8 flex justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 font-semibold hover:bg-red-500/20 transition-colors"
              >
                Excluir
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-md text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-md bg-amber-400 text-black font-semibold hover:bg-amber-500 active:bg-amber-600 transition-colors shadow-lg shadow-amber-400/20"
                >
                  Salvar
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
