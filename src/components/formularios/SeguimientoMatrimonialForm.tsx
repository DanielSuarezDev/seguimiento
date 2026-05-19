"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { responderFormulario } from "@/app/f/[token]/actions";
import PreguntasHistorial, { type HistorialHandle } from "./PreguntasHistorial";

interface Props { tokenId: string; token: string; personaId: string; nombrePersona: string }

type FormData = {
  como_relacion: number;
  lo_mejor: string;
  lo_dificil: string;
  conversaron_escucharon: string;
  oracion_perdon_conexion: string;
  trabajar_proxima: string;
};

const escalaOpts: { v: number; e: string; l: string }[] = [
  { v: 1, e: "🌧️", l: "Muy difícil" },
  { v: 2, e: "☁️", l: "Tensa" },
  { v: 3, e: "🌤️", l: "Estable" },
  { v: 4, e: "☀️", l: "Conectada" },
  { v: 5, e: "🌈", l: "Muy buena" },
];

const conversacionOpts = ["Sí, varias veces", "Sí, una vez", "Lo intentamos", "No esta semana"];

export default function SeguimientoMatrimonialForm({ tokenId, token, personaId }: Props) {
  const router = useRouter();
  const historialRef = useRef<HistorialHandle>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({
    como_relacion: 3, lo_mejor: "", lo_dificil: "",
    conversaron_escucharon: "", oracion_perdon_conexion: "", trabajar_proxima: "",
  });

  function set<K extends keyof FormData>(k: K, v: FormData[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function submit() {
    setLoading(true);
    const r = await responderFormulario({
      token, tokenId, personaId,
      tipo: "seguimiento_matrimonial",
      respuestas: { ...form, historial: historialRef.current?.getValues() },
    });
    if (r.ok) router.push(`/f/${token}/enviado`);
    else { setError(r.error); setLoading(false); }
  }

  return (
    <div className="space-y-5">
      <header className="text-center space-y-2 pt-2">
        <div className="text-3xl">🤍</div>
        <h1 className="text-2xl font-semibold text-stone-800">Seguimiento semanal como pareja</h1>
        <p className="text-stone-500 text-sm max-w-md mx-auto leading-relaxed">
          Respondan juntos con honestidad y sin culparse. Esto nos ayuda a caminar
          con ustedes en oración esta semana.
        </p>
      </header>

      <Card title="¿Cómo estuvo la relación esta semana?">
        <div className="grid grid-cols-5 gap-2">
          {escalaOpts.map((s) => {
            const on = form.como_relacion === s.v;
            return (
              <button key={s.v} type="button" onClick={() => set("como_relacion", s.v)}
                className={`flex flex-col items-center gap-1 py-4 rounded-2xl border-2 transition-all ${
                  on ? "border-rose-400 bg-rose-50 scale-[1.04]" : "border-stone-200 hover:border-stone-300"
                }`}>
                <span className="text-3xl">{s.e}</span>
                <span className={`text-[11px] font-medium ${on ? "text-rose-700" : "text-stone-500"}`}>{s.l}</span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card title="Su semana juntos">
        <Textarea label="¿Qué fue lo mejor de la semana como pareja?" value={form.lo_mejor} onChange={(v) => set("lo_mejor", v)} />
        <Textarea label="¿Qué fue difícil esta semana?" value={form.lo_dificil} onChange={(v) => set("lo_dificil", v)} />
      </Card>

      <Card title="Comunicación y conexión">
        <Pills label="¿Pudieron conversar y escucharse esta semana?"
          options={conversacionOpts} value={form.conversaron_escucharon} onChange={(v) => set("conversaron_escucharon", v)} />
        <Textarea label="¿Hubo momentos de oración, perdón o conexión?" value={form.oracion_perdon_conexion} onChange={(v) => set("oracion_perdon_conexion", v)} rows={3} />
      </Card>

      <Card title="Esta próxima semana">
        <Textarea label="¿Qué necesitan trabajar juntos esta próxima semana?" value={form.trabajar_proxima} onChange={(v) => set("trabajar_proxima", v)} rows={3} />
      </Card>

      <PreguntasHistorial ref={historialRef} accent="rose" />

      {error && <p className="text-sm bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl">{error}</p>}

      <div className="text-center pt-2">
        <button type="button" onClick={submit} disabled={loading}
          className="w-full sm:w-auto sm:min-w-[260px] px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-medium shadow-sm">
          {loading ? "Enviando..." : "Enviar seguimiento"}
        </button>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5 sm:p-7 space-y-4">
      <h2 className="text-lg font-semibold text-stone-800">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
function Textarea({ label, value, onChange, rows = 2 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1">{label}</label>
      <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50/40 focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none resize-none" />
    </div>
  );
}
function Pills({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value === o;
          return (
            <button key={o} type="button" onClick={() => onChange(o)}
              className={`px-4 py-2 rounded-full text-sm border transition-all ${
                on ? "border-rose-400 bg-rose-50 text-rose-700" : "border-stone-200 text-stone-600 hover:border-stone-300"
              }`}>
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}
