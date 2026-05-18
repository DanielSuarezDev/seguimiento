"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { responderFormulario } from "@/app/f/[token]/actions";

export type Pregunta = {
  id: string;
  orden: number;
  tipo: string;
  pregunta: string;
  placeholder: string | null;
  requerida: boolean;
  opciones: string[] | null;
};

interface Props {
  tokenId: string;
  token: string;
  personaId: string;
  nombrePersona: string;
  preguntas: Pregunta[];
}

export default function FormularioPersonalizado({ tokenId, token, personaId, preguntas }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [respuestas, setRespuestas] = useState<Record<string, string | number | boolean>>({});

  function set(id: string, value: string | number | boolean) {
    setRespuestas((p) => ({ ...p, [id]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Validar checkboxes requeridos
    for (const p of preguntas) {
      if (p.requerida && p.tipo === "checkbox" && !respuestas[p.id]) {
        setError(`Debes marcar: "${p.pregunta}"`);
        return;
      }
    }
    setLoading(true);
    const result = await responderFormulario({
      token, tokenId, personaId,
      tipo: "personalizado",
      respuestas,
    });
    if (result.ok) router.push(`/f/${token}/enviado`);
    else { setError(result.error); setLoading(false); }
  }

  if (preguntas.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center">
        <p className="text-3xl mb-3">📋</p>
        <p className="text-stone-400 text-sm">Este formulario no tiene preguntas configuradas.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {preguntas.map((p) => {
        // INFO: bloque de texto informativo, sin input
        if (p.tipo === "info") {
          return (
            <div key={p.id} className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <h3 className="font-semibold text-amber-900 mb-2">{p.pregunta}</h3>
              {p.placeholder && (
                <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">{p.placeholder}</p>
              )}
            </div>
          );
        }

        // CHECKBOX: con label inline, sin label encima
        if (p.tipo === "checkbox") {
          return (
            <div key={p.id} className="bg-white rounded-2xl border border-stone-200 p-5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!respuestas[p.id]}
                  onChange={(e) => set(p.id, e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-amber-600 shrink-0"
                />
                <span className="text-sm text-stone-700">
                  {p.pregunta}
                  {p.requerida && <span className="text-red-400 ml-1">*</span>}
                </span>
              </label>
            </div>
          );
        }

        // Resto: label encima + input específico
        return (
          <div key={p.id} className="bg-white rounded-2xl border border-stone-200 p-6">
            <label className="block text-sm font-medium text-stone-700 mb-3">
              {p.pregunta}
              {p.requerida && <span className="text-red-400 ml-1">*</span>}
            </label>

            {p.tipo === "texto" && (
              <input
                value={String(respuestas[p.id] ?? "")}
                onChange={(e) => set(p.id, e.target.value)}
                required={p.requerida}
                placeholder={p.placeholder ?? ""}
                className="input"
              />
            )}

            {p.tipo === "textarea" && (
              <textarea
                value={String(respuestas[p.id] ?? "")}
                onChange={(e) => set(p.id, e.target.value)}
                required={p.requerida}
                placeholder={p.placeholder ?? ""}
                rows={4}
                className="input resize-none"
              />
            )}

            {p.tipo === "escala" && (
              <div className="flex items-center gap-3 mt-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => set(p.id, n)}
                    className={`w-10 h-10 rounded-full border-2 text-sm font-semibold transition-all ${
                      respuestas[p.id] === n
                        ? "border-amber-500 bg-amber-50 text-amber-700"
                        : "border-stone-200 text-stone-400 hover:border-stone-300"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}

            {p.tipo === "opciones" && p.opciones && (
              <div className="flex flex-wrap gap-2 mt-1">
                {p.opciones.map((op) => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => set(p.id, op)}
                    className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                      respuestas[p.id] === op
                        ? "border-amber-500 bg-amber-50 text-amber-700"
                        : "border-stone-200 text-stone-500 hover:border-stone-300"
                    }`}
                  >
                    {op}
                  </button>
                ))}
              </div>
            )}

            {p.tipo === "firma" && (
              <input
                value={String(respuestas[p.id] ?? "")}
                onChange={(e) => set(p.id, e.target.value)}
                required={p.requerida}
                placeholder="Escribe tu nombre completo"
                className="input font-serif italic"
              />
            )}
          </div>
        );
      })}

      {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-lg">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors"
      >
        {loading ? "Enviando..." : "Enviar formulario"}
      </button>
    </form>
  );
}
