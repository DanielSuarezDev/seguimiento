"use client";

import { Suspense, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
type PersonaBasica = { id: string; nombre: string; apellido: string };

function NuevaTareaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [personas, setPersonas] = useState<PersonaBasica[]>([]);

  const [form, setForm] = useState({
    persona_id: searchParams.get("persona_id") ?? "",
    titulo: "", descripcion: "", versiculos_referencia: "",
    fecha_asignacion: new Date().toISOString().split("T")[0],
    fecha_vencimiento: "",
    estado: "pendiente" as "pendiente" | "en_progreso" | "completada" | "omitida",
  });

  useEffect(() => {
    supabase.from("personas").select("id, nombre, apellido").eq("activo", true).order("nombre")
      .then(({ data }) => setPersonas(data ?? []));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }

    const personaId = searchParams.get("persona_id") ?? form.persona_id;
    const { error } = await supabase.from("tareas").insert({
      persona_id: personaId,
      titulo: form.titulo,
      descripcion: form.descripcion || null,
      versiculos_referencia: form.versiculos_referencia || null,
      fecha_asignacion: form.fecha_asignacion,
      fecha_vencimiento: form.fecha_vencimiento || null,
      estado: form.estado,
      user_id: user.id,
    });

    if (error) { setError(error.message); setLoading(false); }
    else router.push(personaId ? `/personas/${personaId}` : "/tareas");
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
      <div>
        <label className="label">Persona *</label>
        <select name="persona_id" value={form.persona_id} onChange={handleChange} required className="input">
          <option value="">Seleccionar persona...</option>
          {personas.map((p) => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Tarea *</label>
        <input name="titulo" value={form.titulo} onChange={handleChange} required className="input" placeholder="Ej: Leer Salmos 23 cada mañana esta semana" />
      </div>
      <div>
        <label className="label">Descripción / Instrucciones</label>
        <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={3} className="input resize-none" placeholder="Instrucciones detalladas, contexto de la tarea..." />
      </div>
      <div>
        <label className="label">Versículos de referencia</label>
        <input name="versiculos_referencia" value={form.versiculos_referencia} onChange={handleChange} className="input" placeholder="Ej: Salmos 23, Filipenses 4:6-7" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Fecha de asignación</label><input name="fecha_asignacion" value={form.fecha_asignacion} onChange={handleChange} type="date" className="input" /></div>
        <div><label className="label">Fecha de vencimiento</label><input name="fecha_vencimiento" value={form.fecha_vencimiento} onChange={handleChange} type="date" className="input" /></div>
      </div>
      <div>
        <label className="label">Estado inicial</label>
        <select name="estado" value={form.estado} onChange={handleChange} className="input">
          <option value="pendiente">Pendiente</option>
          <option value="en_progreso">En progreso</option>
        </select>
      </div>
      {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
          {loading ? "Guardando..." : "Guardar tarea"}
        </button>
        <Link href="/tareas" className="bg-white border border-stone-300 text-stone-600 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
          Cancelar
        </Link>
      </div>
    </form>
  );
}

export default function NuevaTareaPage() {
  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-7">
        <Link href="/tareas" className="text-stone-400 hover:text-stone-600 text-sm">← Tareas</Link>
        <span className="text-stone-300">/</span>
        <h1 className="text-xl font-semibold text-stone-800">Nueva tarea</h1>
      </div>
      <Suspense fallback={<div className="text-stone-400 text-sm">Cargando...</div>}>
        <NuevaTareaForm />
      </Suspense>
    </div>
  );
}
