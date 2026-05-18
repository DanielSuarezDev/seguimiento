"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { TipoConsejeria } from "@/types/database";

export default function NuevaPersonaPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tipos, setTipos] = useState<TipoConsejeria[]>([]);

  const [form, setForm] = useState({
    nombre: "", apellido: "", telefono: "", email: "",
    fecha_nacimiento: "", estado_civil: "", tipo_consejeria_id: "",
    ocupacion: "", iglesia: "", motivo_inicial: "", notas_generales: "",
  });

  useEffect(() => {
    supabase.from("tipos_consejeria").select("*").then(({ data }) => setTipos(data ?? []));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }

    const { data, error } = await supabase.from("personas").insert({
      nombre: form.nombre, apellido: form.apellido,
      telefono: form.telefono || null, email: form.email || null,
      fecha_nacimiento: form.fecha_nacimiento || null,
      estado_civil: form.estado_civil || null,
      tipo_consejeria_id: form.tipo_consejeria_id || null,
      ocupacion: form.ocupacion || null, iglesia: form.iglesia || null,
      motivo_inicial: form.motivo_inicial || null,
      notas_generales: form.notas_generales || null,
      activo: true, user_id: user.id,
    }).select("id").single();

    if (error) { setError(error.message); setLoading(false); }
    else router.push(`/personas/${data.id}`);
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-7">
        <Link href="/personas" className="text-stone-400 hover:text-stone-600 text-sm">← Personas</Link>
        <span className="text-stone-300">/</span>
        <h1 className="text-xl font-semibold text-stone-800">Nueva persona</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos personales */}
        <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide">Datos personales</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">Nombre *</label><input name="nombre" value={form.nombre} onChange={handleChange} required className="input" /></div>
            <div><label className="label">Apellido *</label><input name="apellido" value={form.apellido} onChange={handleChange} required className="input" /></div>
            <div><label className="label">Teléfono</label><input name="telefono" value={form.telefono} onChange={handleChange} type="tel" className="input" /></div>
            <div><label className="label">Correo</label><input name="email" value={form.email} onChange={handleChange} type="email" className="input" /></div>
            <div><label className="label">Fecha de nacimiento</label><input name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={handleChange} type="date" className="input" /></div>
            <div>
              <label className="label">Estado civil</label>
              <select name="estado_civil" value={form.estado_civil} onChange={handleChange} className="input">
                <option value="">Seleccionar...</option>
                <option value="soltero">Soltero/a</option>
                <option value="casado">Casado/a</option>
                <option value="divorciado">Divorciado/a</option>
                <option value="viudo">Viudo/a</option>
                <option value="union_libre">Unión libre</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contexto de consejería */}
        <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide">Consejería</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Tipo de consejería</label>
              <select name="tipo_consejeria_id" value={form.tipo_consejeria_id} onChange={handleChange} className="input">
                <option value="">Seleccionar...</option>
                {tipos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </select>
            </div>
            <div><label className="label">Ocupación</label><input name="ocupacion" value={form.ocupacion} onChange={handleChange} className="input" /></div>
            <div className="col-span-2"><label className="label">Iglesia / Comunidad</label><input name="iglesia" value={form.iglesia} onChange={handleChange} className="input" /></div>
          </div>
          <div><label className="label">Motivo inicial de consulta</label><textarea name="motivo_inicial" value={form.motivo_inicial} onChange={handleChange} rows={3} placeholder="¿Por qué busca consejería?" className="input resize-none" /></div>
          <div><label className="label">Notas generales</label><textarea name="notas_generales" value={form.notas_generales} onChange={handleChange} rows={2} placeholder="Observaciones adicionales..." className="input resize-none" /></div>
        </div>

        {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
            {loading ? "Guardando..." : "Guardar persona"}
          </button>
          <Link href="/personas" className="bg-white border border-stone-300 hover:border-stone-400 text-stone-600 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
