"use client";

import React, { useState, useEffect } from "react";
import api from "../../lib/axios";
import { useRouter } from "next/navigation";
import CreateTagModal from "../../components/CreateTagModal";
import EditTagModal, { Tag } from "../../components/EditTagModal";

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const router = useRouter();

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/tags");
      setTags(response.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push("/");
      } else {
        setError("Erro ao carregar tags");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Minhas Tags</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-amber-400 text-black font-semibold rounded-md shadow hover:bg-amber-500 transition-colors"
          >
            Nova Tag
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 text-red-400 rounded-md border border-red-500/50">
            {error}
          </div>
        )}

        {loading ? (
          <div
            role="status"
            data-testid="loading"
            className="flex justify-center items-center py-20"
          >
            <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : tags.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900 rounded-lg border border-zinc-800">
            <p className="text-zinc-400 text-lg">Nenhuma tag cadastrada</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex items-center justify-between hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  ></div>
                  <span className="text-white font-medium">{tag.name}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingTag(tag)}
                    className="text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isCreateModalOpen && (
        <CreateTagModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            fetchTags();
          }}
        />
      )}

      {editingTag && (
        <EditTagModal
          tag={editingTag}
          onClose={() => setEditingTag(null)}
          onSuccess={() => {
            setEditingTag(null);
            fetchTags();
          }}
        />
      )}
    </div>
  );
}
