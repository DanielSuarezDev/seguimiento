"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { responderFormulario } from "@/app/f/[token]/actions";
import PreguntasHistorial, { type HistorialHandle } from "./PreguntasHistorial";

interface Props { tokenId: string; token: string; personaId: string; nombrePersona: string; }

export default function ConsentimientoForm({ tokenId, token, personaId, nombrePersona }: Props) {
  const router = useRouter();
  const historialRef = useRef<HistorialHandle>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    nombre_completo: nombrePersona,
    acepta_terminos: false,
    acepta_confidencialidad: false,
    acepta_grabacion: false,
    firma: "",
    comentarios: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.acepta_terminos || !form.acepta_confidencialidad) {
      setError("Debes aceptar los términos y la política de confidencialidad.");
      return;
    }
    setLoading(true);
    const result = await responderFormulario({
      token, tokenId, personaId,
      tipo: "consentimiento_informado",
      respuestas: { ...form, fecha: new Date().toISOString().split("T")[0], historial: historialRef.current?.getValues() },
    });
    if (result.ok) router.push(`/f/${token}/enviado`);
    else { setError(result.error); setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
        <h2 className="font-semibold text-stone-700">Términos del proceso de consejería</h2>
        <div className="text-sm text-stone-600 space-y-3 leading-relaxed">
          <p>El proceso de consejería bíblica es un acompañamiento pastoral y espiritual basado en principios bíblicos. No reemplaza la atención psicológica o psiquiátrica profesional.</p>
          <p>Todo lo compartido en las sesiones es confidencial y no será divulgado sin tu consentimiento, salvo situaciones que impliquen riesgo para tu vida o la de otros.</p>
          <p>Te comprometes a participar activamente, completar las tareas asignadas y comunicar cualquier inquietud a tu consejero.</p>
        </div>
        <div className="space-y-3 pt-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={form.acepta_terminos} onChange={(e) => setForm((p) => ({ ...p, acepta_terminos: e.target.checked }))} className="mt-0.5 w-4 h-4 accent-amber-700" />
            <span className="text-sm text-stone-700">Acepto los términos del proceso de consejería bíblica.</span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={form.acepta_confidencialidad} onChange={(e) => setForm((p) => ({ ...p, acepta_confidencialidad: e.target.checked }))} className="mt-0.5 w-4 h-4 accent-amber-700" />
            <span className="text-sm text-stone-700">Entiendo y acepto la política de confidencialidad.</span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={form.acepta_grabacion} onChange={(e) => setForm((p) => ({ ...p, acepta_grabacion: e.target.checked }))} className="mt-0.5 w-4 h-4 accent-amber-700" />
            <span className="text-sm text-stone-700">Autorizo que el consejero tome notas durante las sesiones (opcional).</span>
          </label>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
        <h2 className="font-semibold text-stone-700">Firma</h2>
        <div>
          <label className="label">Nombre completo (como firma)</label>
          <input value={form.nombre_completo} onChange={(e) => setForm((p) => ({ ...p, nombre_completo: e.target.value }))} required className="input font-medium text-base" placeholder="Tu nombre completo" />
        </div>
        <div>
          <label className="label">Comentarios adicionales (opcional)</label>
          <textarea value={form.comentarios} onChange={(e) => setForm((p) => ({ ...p, comentarios: e.target.value }))} rows={3} className="input resize-none" placeholder="¿Alguna pregunta o comentario antes de iniciar?" />
        </div>
      </div>

      <PreguntasHistorial ref={historialRef} accent="amber" />

      {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-lg">{error}</p>}
      <button type="submit" disabled={loading} className="w-full bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors">
        {loading ? "Enviando..." : "Firmar y enviar consentimiento"}
      </button>
    </form>
  );
}
