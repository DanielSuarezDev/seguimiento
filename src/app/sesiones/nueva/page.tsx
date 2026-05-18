"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Persona } from "@/types/database";

export default function NuevaSesionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);

  const [form, setForm] = useState({
    persona_id: searchParams.get("persona_id") ?? "",
    fecha: new Date().toISOString().split("T")[0],
    motivo_consulta: "",
    contenido: "",
    versiculos: "",
    compromisos: "",
    proxima_sesion: "",
    estado: "pendiente" as "pendiente" | "completada" | "cancelada",
  });

  useEffect(() => {
    supabase
      .from("personas")
      .select("*")
      .eq("activo", true)
      .order("nombre")
      .then(({ data }) => setPersonas(data ?? []));
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }

    const { count } = await supabase
      .from("sesiones")
      .select("*", { count: "exact", head: true })
      .eq("persona_id", form.persona_id);

    const { error } = await supabase.from("sesiones").insert({
      persona_id: form.persona_id,
      fecha: form.fecha,
      numero_sesion: (count ?? 0) + 1,
      motivo_consulta: form.motivo_consulta || null,
      contenido: form.contenido || null,
      versiculos: form.versiculos || null,
      compromisos: form.compromisos || null,
      proxima_sesion: form.proxima_sesion || null,
      estado: form.estado,
      user_id: user.id,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/sesiones");
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/sesiones" className="text-stone-400 hover:text-stone-600 text-sm">← Sesiones</Link>
        <span className="text-stone-300">/</span>
        <h1 className="text-xl font-semibold text-stone-800">Nueva sesión</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-xl p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Persona *</label>
            <select name="persona_id" value={form.persona_id} onChange={handleChange} required className="input">
              <option value="">Seleccionar persona...</option>
              {personas.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Fecha *</label>
            <input name="fecha" value={form.fecha} onChange={handleChange} type="date" required className="input" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-600 mb-1">Motivo de consulta</label>
          <input name="motivo_consulta" value={form.motivo_consulta} onChange={handleChange} className="input" placeholder="¿Qué trajo a esta persona?" />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-600 mb-1">Contenido de la sesión</label>
          <textarea
            name="contenido"
            value={form.contenido}
            onChange={handleChange}
            rows={5}
            placeholder="Resumen de lo hablado, observaciones, progreso..."
            className="input resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-600 mb-1">Versículos trabajados</label>
          <input name="versiculos" value={form.versiculos} onChange={handleChange} className="input" placeholder="Ej: Salmos 23, Juan 3:16, Filipenses 4:6-7" />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-600 mb-1">Compromisos / Tareas asignadas</label>
          <textarea
            name="compromisos"
            value={form.compromisos}
            onChange={handleChange}
            rows={3}
            placeholder="Compromisos que la persona asumió para la próxima sesión..."
            className="input resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Próxima sesión</label>
            <input name="proxima_sesion" value={form.proxima_sesion} onChange={handleChange} type="date" className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Estado</label>
            <select name="estado" value={form.estado} onChange={handleChange} className="input">
              <option value="pendiente">Pendiente</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            {loading ? "Guardando..." : "Guardar sesión"}
          </button>
          <Link
            href="/sesiones"
            className="bg-white border border-stone-300 hover:border-stone-400 text-stone-700 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
