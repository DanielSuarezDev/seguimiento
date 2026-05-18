"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NuevaPlantillaPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ nombre: "", descripcion: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }

    const { data, error } = await supabase
      .from("form_plantillas")
      .insert({ nombre: form.nombre, descripcion: form.descripcion || null, user_id: user.id })
      .select("id")
      .single();

    if (error) { setError(error.message); setLoading(false); }
    else router.push(`/configuracion/formularios/${data.id}`);
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-7">
        <Link href="/configuracion/formularios" className="text-stone-400 hover:text-stone-600 text-sm">← Plantillas</Link>
        <span className="text-stone-300">/</span>
        <h1 className="text-xl font-semibold text-stone-800">Nueva plantilla</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
        <div>
          <label className="label">Nombre del formulario *</label>
          <input
            value={form.nombre}
            onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
            required
            className="input"
            placeholder="Ej: Evaluación de ansiedad, Check-in semanal..."
          />
        </div>
        <div>
          <label className="label">Descripción (opcional)</label>
          <textarea
            value={form.descripcion}
            onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
            rows={3}
            className="input resize-none"
            placeholder="¿Para qué se usa este formulario?"
          />
        </div>

        {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            {loading ? "Creando..." : "Crear y agregar preguntas →"}
          </button>
          <Link href="/configuracion/formularios" className="bg-white border border-stone-300 text-stone-600 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
