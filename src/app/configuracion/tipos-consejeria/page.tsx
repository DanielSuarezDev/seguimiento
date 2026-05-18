"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Tipo = { id: string; nombre: string; color: string };

const coloresDisponibles = [
  { value: "amber",   label: "Ámbar",   clase: "bg-amber-100 text-amber-700" },
  { value: "blue",    label: "Azul",    clase: "bg-blue-100 text-blue-700" },
  { value: "green",   label: "Verde",   clase: "bg-green-100 text-green-700" },
  { value: "rose",    label: "Rosa",    clase: "bg-rose-100 text-rose-700" },
  { value: "purple",  label: "Morado",  clase: "bg-purple-100 text-purple-700" },
  { value: "stone",   label: "Gris",    clase: "bg-stone-100 text-stone-700" },
];

const claseColor = (color: string) =>
  coloresDisponibles.find((c) => c.value === color)?.clase ?? "bg-stone-100 text-stone-700";

export default function ConfiguracionPage() {
  const supabase = createClient();
  const [tipos, setTipos] = useState<Tipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agregando, setAgregando] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState({ nombre: "", color: "amber" });

  async function cargar() {
    setLoading(true);
    const { data, error } = await supabase.from("tipos_consejeria").select("*").order("nombre");
    if (error) setError(error.message);
    else setTipos((data as Tipo[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    cargar();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (editandoId) {
      const { error } = await supabase.from("tipos_consejeria").update({ nombre: form.nombre, color: form.color }).eq("id", editandoId);
      if (error) { setError(error.message); return; }
    } else {
      const { error } = await supabase.from("tipos_consejeria").insert({ nombre: form.nombre, color: form.color });
      if (error) { setError(error.message); return; }
    }
    setForm({ nombre: "", color: "amber" });
    setAgregando(false);
    setEditandoId(null);
    cargar();
  }

  async function eliminar(id: string) {
    if (!confirm("¿Eliminar este tipo de consejería? Las personas y sesiones que lo usen quedarán sin tipo asignado.")) return;
    const { error } = await supabase.from("tipos_consejeria").delete().eq("id", id);
    if (error) setError(error.message);
    else cargar();
  }

  function empezarEditar(t: Tipo) {
    setEditandoId(t.id);
    setForm({ nombre: t.nombre, color: t.color });
    setAgregando(false);
  }

  function cancelar() {
    setAgregando(false);
    setEditandoId(null);
    setForm({ nombre: "", color: "amber" });
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-7">
        <h1 className="text-2xl font-semibold text-stone-800">Tipos de consejería</h1>
        <p className="text-stone-400 text-sm mt-0.5">Categorías que aparecen al crear personas y sesiones</p>
      </div>

      {/* Tipos de consejería */}
      <div className="bg-white border border-stone-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-medium text-stone-800">Tipos de consejería</h2>
            <p className="text-xs text-stone-400 mt-0.5">Categorías que aparecen al crear personas y sesiones</p>
          </div>
          {!agregando && !editandoId && (
            <button
              onClick={() => setAgregando(true)}
              className="text-sm text-amber-700 hover:text-amber-800 font-medium"
            >
              + Agregar tipo
            </button>
          )}
        </div>

        {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-3">{error}</p>}

        {loading ? (
          <p className="text-stone-400 text-sm">Cargando...</p>
        ) : (
          <div className="space-y-2">
            {tipos.length === 0 && !agregando && (
              <p className="text-sm text-stone-400 py-4 text-center">
                No hay tipos de consejería. Agrega el primero para empezar.
              </p>
            )}

            {tipos.map((t) => (
              editandoId === t.id ? (
                <FormRow
                  key={t.id}
                  form={form}
                  setForm={setForm}
                  onSubmit={guardar}
                  onCancel={cancelar}
                  modoEditar
                />
              ) : (
                <div key={t.id} className="flex items-center justify-between p-3 border border-stone-100 rounded-lg hover:bg-stone-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${claseColor(t.color)}`}>
                      {t.nombre}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => empezarEditar(t)}
                      className="text-xs text-stone-400 hover:text-amber-700 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => eliminar(t.id)}
                      className="text-xs text-stone-400 hover:text-red-500 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )
            ))}

            {agregando && (
              <FormRow
                form={form}
                setForm={setForm}
                onSubmit={guardar}
                onCancel={cancelar}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FormRow({
  form, setForm, onSubmit, onCancel, modoEditar,
}: {
  form: { nombre: string; color: string };
  setForm: (f: { nombre: string; color: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  modoEditar?: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="p-3 border-2 border-amber-200 bg-amber-50/30 rounded-lg space-y-3">
      <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
        <div>
          <label className="text-xs text-stone-500 mb-1 block">Nombre</label>
          <input
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            required
            autoFocus
            className="input"
            placeholder="Ej: Premarital, Duelo, Adolescentes..."
          />
        </div>
        <div>
          <label className="text-xs text-stone-500 mb-1 block">Color</label>
          <select
            value={form.color}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
            className="input"
          >
            {coloresDisponibles.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
        >
          {modoEditar ? "Guardar cambios" : "Agregar"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-stone-500 text-sm px-4 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
