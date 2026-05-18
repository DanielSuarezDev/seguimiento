"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type Plantilla = { id: string; nombre: string; descripcion: string | null; activo: boolean };
type Pregunta = { id: string; orden: number; tipo: string; pregunta: string; placeholder: string | null; requerida: boolean; opciones: string[] | null };

const tipoLabel: Record<string, string> = {
  texto: "Texto corto",
  textarea: "Texto largo",
  escala: "Escala 1–5",
  opciones: "Opciones",
  checkbox: "Casilla de verificación",
  info: "Texto informativo (sin respuesta)",
  firma: "Firma",
};

const tipoIcono: Record<string, string> = {
  texto: "—",
  textarea: "≡",
  escala: "★",
  opciones: "◉",
  checkbox: "☑",
  info: "ⓘ",
  firma: "✍",
};

const preguntaVacia = {
  tipo: "texto",
  pregunta: "",
  placeholder: "",
  requerida: false,
  opciones_texto: "",
};

export default function EditarPlantillaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const supabase = createClient();

  const [plantilla, setPlantilla] = useState<Plantilla | null>(null);
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [form, setForm] = useState(preguntaVacia);
  const [agregando, setAgregando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [editandoNombre, setEditandoNombre] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");

  useEffect(() => {
    Promise.all([
      supabase.from("form_plantillas").select("id, nombre, descripcion, activo").eq("id", id).single(),
      supabase.from("form_preguntas").select("id, orden, tipo, pregunta, placeholder, requerida, opciones").eq("plantilla_id", id).order("orden"),
    ]).then(([{ data: p }, { data: q }]) => {
      setPlantilla(p as Plantilla | null);
      setPreguntas((q as Pregunta[] | null) ?? []);
      setLoadingData(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function agregarPregunta(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    const opciones = form.tipo === "opciones"
      ? form.opciones_texto.split(",").map((o) => o.trim()).filter(Boolean)
      : null;

    const { data, error } = await supabase
      .from("form_preguntas")
      .insert({
        plantilla_id: id,
        orden: preguntas.length,
        tipo: form.tipo,
        pregunta: form.pregunta,
        placeholder: form.placeholder || null,
        requerida: form.requerida,
        opciones: opciones,
      })
      .select("id, orden, tipo, pregunta, placeholder, requerida, opciones")
      .single();

    if (!error && data) {
      setPreguntas((p) => [...p, data as Pregunta]);
      setForm(preguntaVacia);
      setAgregando(false);
    }
    setGuardando(false);
  }

  async function eliminarPregunta(preguntaId: string) {
    await supabase.from("form_preguntas").delete().eq("id", preguntaId);
    setPreguntas((p) => p.filter((q) => q.id !== preguntaId));
  }

  async function moverPregunta(index: number, dir: "up" | "down") {
    const newList = [...preguntas];
    const swapWith = dir === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= newList.length) return;
    [newList[index], newList[swapWith]] = [newList[swapWith], newList[index]];
    const updates = newList.map((q, i) => supabase.from("form_preguntas").update({ orden: i }).eq("id", q.id));
    await Promise.all(updates);
    setPreguntas(newList.map((q, i) => ({ ...q, orden: i })));
  }

  async function guardarNombre() {
    if (!nuevoNombre.trim()) return;
    await supabase.from("form_plantillas").update({ nombre: nuevoNombre.trim() }).eq("id", id);
    setPlantilla((p) => p ? { ...p, nombre: nuevoNombre.trim() } : p);
    setEditandoNombre(false);
  }

  if (loadingData) return <div className="text-stone-400 text-sm p-8">Cargando...</div>;
  if (!plantilla) return <div className="text-stone-400 text-sm p-8">Plantilla no encontrada.</div>;

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/configuracion/formularios" className="text-stone-400 hover:text-stone-600 text-sm">← Plantillas</Link>
          </div>
          {editandoNombre ? (
            <div className="flex items-center gap-2">
              <input
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                className="input text-xl font-semibold py-1"
                autoFocus
              />
              <button onClick={guardarNombre} className="text-sm text-amber-700 hover:text-amber-800 font-medium">Guardar</button>
              <button onClick={() => setEditandoNombre(false)} className="text-sm text-stone-400 hover:text-stone-600">Cancelar</button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-stone-800">{plantilla.nombre}</h1>
              <button
                onClick={() => { setNuevoNombre(plantilla.nombre); setEditandoNombre(true); }}
                className="text-xs text-stone-400 hover:text-amber-700 transition-colors"
              >
                Editar nombre
              </button>
            </div>
          )}
          {plantilla.descripcion && <p className="text-stone-400 text-sm mt-1">{plantilla.descripcion}</p>}
        </div>
        <Link
          href="/formularios/nuevo"
          className="bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Enviar formulario
        </Link>
      </div>

      {/* Lista de preguntas */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide">
            Preguntas ({preguntas.length})
          </h2>
        </div>

        {preguntas.length === 0 && !agregando && (
          <div className="bg-white border border-dashed border-stone-300 rounded-xl p-8 text-center">
            <p className="text-stone-400 text-sm mb-3">Este formulario no tiene preguntas aún</p>
            <button
              onClick={() => setAgregando(true)}
              className="text-amber-700 hover:text-amber-800 text-sm font-medium"
            >
              + Agregar primera pregunta
            </button>
          </div>
        )}

        {preguntas.map((q, i) => (
          <div key={q.id} className="bg-white border border-stone-200 rounded-xl p-4 flex items-start gap-4">
            <div className="flex flex-col gap-1 shrink-0 mt-0.5">
              <button
                onClick={() => moverPregunta(i, "up")}
                disabled={i === 0}
                className="text-stone-300 hover:text-stone-500 disabled:opacity-20 text-xs leading-none"
              >
                ▲
              </button>
              <button
                onClick={() => moverPregunta(i, "down")}
                disabled={i === preguntas.length - 1}
                className="text-stone-300 hover:text-stone-500 disabled:opacity-20 text-xs leading-none"
              >
                ▼
              </button>
            </div>
            <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center text-sm text-stone-500 shrink-0 font-mono">
              {tipoIcono[q.tipo]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-800">
                {q.pregunta}
                {q.requerida && <span className="text-red-400 ml-1 text-xs">*requerida</span>}
              </p>
              <p className="text-xs text-stone-400 mt-0.5">
                {tipoLabel[q.tipo]}
                {q.placeholder && ` · "${q.placeholder}"`}
                {q.opciones && q.opciones.length > 0 && ` · ${q.opciones.join(", ")}`}
              </p>
            </div>
            <button
              onClick={() => eliminarPregunta(q.id)}
              className="text-stone-300 hover:text-red-400 transition-colors shrink-0"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Formulario para agregar pregunta */}
      {agregando ? (
        <form onSubmit={agregarPregunta} className="bg-white border border-amber-200 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-stone-700">Nueva pregunta</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Tipo de respuesta</label>
              <select value={form.tipo} onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value }))} className="input">
                <option value="texto">Texto corto</option>
                <option value="textarea">Texto largo</option>
                <option value="escala">Escala del 1 al 5</option>
                <option value="opciones">Opciones (selección única)</option>
                <option value="checkbox">Casilla (Sí/No)</option>
                <option value="info">Texto informativo (sin respuesta)</option>
                <option value="firma">Firma</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer pb-2">
                <input
                  type="checkbox"
                  checked={form.requerida}
                  onChange={(e) => setForm((p) => ({ ...p, requerida: e.target.checked }))}
                  className="w-4 h-4 accent-amber-600"
                />
                <span className="text-sm text-stone-600">Respuesta requerida</span>
              </label>
            </div>
          </div>

          <div>
            <label className="label">Pregunta *</label>
            <input
              value={form.pregunta}
              onChange={(e) => setForm((p) => ({ ...p, pregunta: e.target.value }))}
              required
              className="input"
              placeholder="Escribe aquí tu pregunta..."
            />
          </div>

          {(form.tipo === "texto" || form.tipo === "textarea") && (
            <div>
              <label className="label">Texto de ayuda (placeholder)</label>
              <input
                value={form.placeholder}
                onChange={(e) => setForm((p) => ({ ...p, placeholder: e.target.value }))}
                className="input"
                placeholder="Texto de ejemplo que aparece en el campo..."
              />
            </div>
          )}

          {form.tipo === "info" && (
            <div>
              <label className="label">Contenido informativo</label>
              <textarea
                value={form.placeholder}
                onChange={(e) => setForm((p) => ({ ...p, placeholder: e.target.value }))}
                rows={4}
                className="input resize-none"
                placeholder="Texto que verá el aconsejado (ej: términos, instrucciones, explicación...)"
              />
            </div>
          )}

          {form.tipo === "opciones" && (
            <div>
              <label className="label">Opciones (separadas por coma)</label>
              <input
                value={form.opciones_texto}
                onChange={(e) => setForm((p) => ({ ...p, opciones_texto: e.target.value }))}
                className="input"
                placeholder="Ej: Sí, No, A veces, Nunca"
                required
              />
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={guardando}
              className="bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {guardando ? "Guardando..." : "Agregar pregunta"}
            </button>
            <button
              type="button"
              onClick={() => { setAgregando(false); setForm(preguntaVacia); }}
              className="text-stone-500 text-sm px-4 py-2 rounded-lg hover:bg-stone-100 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAgregando(true)}
          className="w-full py-3 border-2 border-dashed border-stone-300 hover:border-amber-400 text-stone-400 hover:text-amber-700 text-sm font-medium rounded-xl transition-colors"
        >
          + Agregar pregunta
        </button>
      )}
    </div>
  );
}
