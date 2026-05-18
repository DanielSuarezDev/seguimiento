"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { responderFormulario } from "@/app/f/[token]/actions";

interface Tarea { id: string; titulo: string; descripcion: string | null; }
interface Props { tokenId: string; token: string; personaId: string; nombrePersona: string; tareas: Tarea[]; }

const dificultadLabel = ["", "Muy fácil", "Fácil", "Normal", "Difícil", "Muy difícil"];

export default function TareasTerapeuticasForm({ tokenId, token, personaId, tareas }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [reportes, setReportes] = useState<Record<string, { completada: boolean; dificultad: number; comentario: string }>>(() =>
    Object.fromEntries(tareas.map((t) => [t.id, { completada: false, dificultad: 3, comentario: "" }]))
  );
  const [reflexion, setReflexion] = useState("");

  function setReporte(tareaId: string, key: string, value: boolean | number | string) {
    setReportes((p) => ({ ...p, [tareaId]: { ...p[tareaId], [key]: value } }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    const respuestas = {
      reportes: tareas.map((t) => ({
        tarea_id: t.id,
        titulo: t.titulo,
        ...reportes[t.id],
      })),
      reflexion,
    };
    const result = await responderFormulario({
      token, tokenId, personaId,
      tipo: "tareas_terapeuticas",
      respuestas,
    });
    if (result.ok) router.push(`/f/${token}/enviado`);
    else { setError(result.error); setLoading(false); }
  }

  if (tareas.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center">
        <p className="text-3xl mb-3">✅</p>
        <h2 className="text-lg font-semibold text-stone-700 mb-2">Sin tareas pendientes</h2>
        <p className="text-stone-400 text-sm">Tu consejero no ha registrado tareas activas para ti en este momento.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {tareas.map((t) => {
        const rep = reportes[t.id];
        return (
          <div key={t.id} className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-stone-800">{t.titulo}</h3>
              {t.descripcion && <p className="text-sm text-stone-400 mt-0.5">{t.descripcion}</p>}
            </div>

            <div>
              <label className="label">¿Pudiste realizarla?</label>
              <div className="flex gap-3 mt-1">
                {[{ label: "Sí, la completé ✓", value: true }, { label: "No la completé", value: false }].map((op) => (
                  <button key={String(op.value)} type="button" onClick={() => setReporte(t.id, "completada", op.value)}
                    className={`px-4 py-2 rounded-lg border text-sm transition-all ${rep.completada === op.value ? "border-amber-500 bg-amber-50 text-amber-700" : "border-stone-200 text-stone-500 hover:border-stone-300"}`}>
                    {op.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Nivel de dificultad</label>
              <div className="flex items-center gap-2 mt-1">
                {[1,2,3,4,5].map((n) => (
                  <button key={n} type="button" onClick={() => setReporte(t.id, "dificultad", n)}
                    className={`w-9 h-9 rounded-full border-2 text-xs font-semibold transition-all ${rep.dificultad === n ? "border-amber-500 bg-amber-50 text-amber-700" : "border-stone-200 text-stone-400"}`}>
                    {n}
                  </button>
                ))}
                <span className="text-xs text-stone-400 ml-1">{dificultadLabel[rep.dificultad]}</span>
              </div>
            </div>

            <div>
              <label className="label">Comentario (¿cómo te fue?)</label>
              <textarea value={rep.comentario} onChange={(e) => setReporte(t.id, "comentario", e.target.value)} rows={2} className="input resize-none" placeholder="Cuéntame cómo fue el proceso, qué aprendiste..." />
            </div>
          </div>
        );
      })}

      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <label className="label">Reflexión general de la semana</label>
        <textarea value={reflexion} onChange={(e) => setReflexion(e.target.value)} rows={3} className="input resize-none" placeholder="¿Hay algo más que quieras compartir con tu consejero?" />
      </div>

      {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-lg">{error}</p>}
      <button type="submit" disabled={loading} className="w-full bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors">
        {loading ? "Enviando..." : "Enviar reporte de tareas"}
      </button>
    </form>
  );
}
