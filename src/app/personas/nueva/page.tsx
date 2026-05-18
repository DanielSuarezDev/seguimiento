"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NuevaPersonaPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    email: "",
    fecha_nacimiento: "",
    estado_civil: "",
    notas_generales: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }

    const { error } = await supabase.from("personas").insert({
      nombre: form.nombre,
      apellido: form.apellido,
      telefono: form.telefono || null,
      email: form.email || null,
      fecha_nacimiento: form.fecha_nacimiento || null,
      estado_civil: form.estado_civil || null,
      notas_generales: form.notas_generales || null,
      activo: true,
      user_id: user.id,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/personas");
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/personas" className="text-stone-400 hover:text-stone-600 text-sm">← Personas</Link>
        <span className="text-stone-300">/</span>
        <h1 className="text-xl font-semibold text-stone-800">Nueva persona</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-xl p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Nombre *</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} required className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Apellido *</label>
            <input name="apellido" value={form.apellido} onChange={handleChange} required className="input" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Teléfono</label>
            <input name="telefono" value={form.telefono} onChange={handleChange} type="tel" className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Correo</label>
            <input name="email" value={form.email} onChange={handleChange} type="email" className="input" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Fecha de nacimiento</label>
            <input name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={handleChange} type="date" className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Estado civil</label>
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

        <div>
          <label className="block text-sm font-medium text-stone-600 mb-1">Notas generales</label>
          <textarea
            name="notas_generales"
            value={form.notas_generales}
            onChange={handleChange}
            rows={4}
            placeholder="Contexto inicial, motivos de consulta, antecedentes..."
            className="input resize-none"
          />
        </div>

        {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            {loading ? "Guardando..." : "Guardar persona"}
          </button>
          <Link
            href="/personas"
            className="bg-white border border-stone-300 hover:border-stone-400 text-stone-700 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
