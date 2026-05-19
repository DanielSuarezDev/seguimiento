"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { responderFormulario } from "@/app/f/[token]/actions";
import PreguntasHistorial, { type HistorialHandle } from "./PreguntasHistorial";

interface Props { tokenId: string; token: string; personaId: string; nombrePersona: string }

type FormData = {
  como_semana: string;
  feliz: string;
  dificil: string;
  oro: string;
  aprendio: string;
};

const semanaOpts = [
  { e: "🌈", l: "Súper bien" },
  { e: "😀", l: "Bien" },
  { e: "😐", l: "Más o menos" },
  { e: "😢", l: "Triste" },
  { e: "🌧️", l: "Difícil" },
];

export default function SeguimientoNinoForm({ tokenId, token, personaId }: Props) {
  const router = useRouter();
  const historialRef = useRef<HistorialHandle>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({
    como_semana: "", feliz: "", dificil: "", oro: "", aprendio: "",
  });

  function set<K extends keyof FormData>(k: K, v: FormData[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function submit() {
    setLoading(true);
    const r = await responderFormulario({
      token, tokenId, personaId,
      tipo: "seguimiento_nino",
      respuestas: { ...form, historial: historialRef.current?.getValues() },
    });
    if (r.ok) router.push(`/f/${token}/enviado`);
    else { setError(r.error); setLoading(false); }
  }

  return (
    <div className="space-y-5">
      <header className="text-center space-y-2 pt-2">
        <div className="text-4xl">🌟</div>
        <h1 className="text-2xl font-semibold text-stone-800">¿Cómo te fue esta semana?</h1>
        <p className="text-stone-500 text-sm">Solo unas preguntitas. ¡Es muy rápido!</p>
      </header>

      <Card title="¿Cómo estuvo tu semana?">
        <div className="grid grid-cols-5 gap-2">
          {semanaOpts.map((s) => {
            const on = form.como_semana === s.l;
            return (
              <button key={s.l} type="button" onClick={() => set("como_semana", s.l)}
                className={`flex flex-col items-center gap-1 py-4 rounded-2xl border-2 transition-all ${
                  on ? "border-sky-400 bg-sky-50 scale-105" : "border-stone-200 hover:border-stone-300"
                }`}>
                <span className="text-3xl">{s.e}</span>
                <span className={`text-[11px] font-medium ${on ? "text-sky-700" : "text-stone-500"}`}>{s.l}</span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card title="Cuéntanos un poquito">
        <Big label="¿Qué te hizo feliz esta semana?" value={form.feliz} onChange={(v) => set("feliz", v)} />
        <Big label="¿Qué fue difícil esta semana?" value={form.dificil} onChange={(v) => set("dificil", v)} />
      </Card>

      <Card title="Dios 🤍">
        <div>
          <label className="block text-base font-medium text-stone-700 mb-2">¿Oraste esta semana?</label>
          <div className="grid grid-cols-3 gap-2">
            {["Sí", "A veces", "No"].map((o) => {
              const on = form.oro === o;
              return (
                <button key={o} type="button" onClick={() => set("oro", o)}
                  className={`py-3 rounded-2xl border-2 text-sm font-medium transition-all ${
                    on ? "border-sky-400 bg-sky-50 text-sky-700" : "border-stone-200 text-stone-600 hover:border-stone-300"
                  }`}>
                  {o}
                </button>
              );
            })}
          </div>
        </div>
        <Big label="¿Qué aprendiste de Dios?" value={form.aprendio} onChange={(v) => set("aprendio", v)} />
      </Card>

      <PreguntasHistorial ref={historialRef} accent="sky" />

      {error && <p className="text-sm bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl">{error}</p>}

      <div className="text-center pt-2">
        <button type="button" onClick={submit} disabled={loading}
          className="w-full sm:w-auto sm:min-w-[240px] px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-medium shadow-sm">
          {loading ? "Enviando..." : "¡Listo! 🎉"}
        </button>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-3xl border-2 border-stone-200 shadow-sm p-5 sm:p-7 space-y-4">
      <h2 className="text-xl font-semibold text-stone-800">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
function Big({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-base font-medium text-stone-700 mb-2">{label}</label>
      <textarea rows={2} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 text-base rounded-2xl border-2 border-stone-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none resize-none" />
    </div>
  );
}
