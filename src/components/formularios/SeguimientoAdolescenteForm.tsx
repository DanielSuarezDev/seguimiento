"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { responderFormulario } from "@/app/f/[token]/actions";

interface Props { tokenId: string; token: string; personaId: string; nombrePersona: string }

type FormData = {
  como_semana: number;
  lo_mejor: string;
  lo_dificil: string;
  ocupo_mente: string;
  emociones: string[];
  relacion_dios: string;
  peticion: string;
};

const semanaOpts: { v: number; e: string; l: string }[] = [
  { v: 1, e: "😞", l: "Muy difícil" },
  { v: 2, e: "😕", l: "Difícil" },
  { v: 3, e: "😐", l: "Regular" },
  { v: 4, e: "🙂", l: "Bien" },
  { v: 5, e: "🤩", l: "Genial" },
];

const emocionesOpts = [
  { v: "Ansiedad", e: "😰" },
  { v: "Tristeza", e: "😔" },
  { v: "Enojo", e: "😡" },
  { v: "Paz", e: "🙂" },
  { v: "Estrés", e: "😅" },
  { v: "Alegría", e: "😄" },
  { v: "Soledad", e: "🥹" },
  { v: "Esperanza", e: "✨" },
  { v: "Cansancio", e: "😴" },
];

const diosOpts = ["Cerca de Dios", "Más o menos", "Lejos", "Quiero acercarme más", "No sé"];

export default function SeguimientoAdolescenteForm({ tokenId, token, personaId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({
    como_semana: 3, lo_mejor: "", lo_dificil: "", ocupo_mente: "",
    emociones: [], relacion_dios: "", peticion: "",
  });

  function set<K extends keyof FormData>(k: K, v: FormData[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }
  function toggle(v: string) {
    setForm((p) => ({ ...p, emociones: p.emociones.includes(v) ? p.emociones.filter((x) => x !== v) : [...p.emociones, v] }));
  }

  async function submit() {
    setLoading(true);
    const r = await responderFormulario({
      token, tokenId, personaId,
      tipo: "seguimiento_adolescente",
      respuestas: { ...form },
    });
    if (r.ok) router.push(`/f/${token}/enviado`);
    else { setError(r.error); setLoading(false); }
  }

  return (
    <div className="space-y-5">
      <header className="text-center space-y-2 pt-2">
        <div className="text-3xl">✨</div>
        <h1 className="text-2xl font-semibold text-stone-800">¿Cómo va tu semana?</h1>
        <p className="text-stone-500 text-sm max-w-md mx-auto">
          Pocas preguntas. Solo lo que sientas. Tu consejero leerá esto con cariño.
        </p>
      </header>

      <Card title="¿Cómo estuvo tu semana?">
        <div className="grid grid-cols-5 gap-2">
          {semanaOpts.map((s) => {
            const on = form.como_semana === s.v;
            return (
              <button key={s.v} type="button" onClick={() => set("como_semana", s.v)}
                className={`flex flex-col items-center gap-1 py-4 rounded-2xl border-2 transition-all ${
                  on ? "border-violet-400 bg-violet-50 scale-105" : "border-stone-200 hover:border-stone-300"
                }`}>
                <span className="text-3xl">{s.e}</span>
                <span className={`text-[11px] font-medium ${on ? "text-violet-700" : "text-stone-500"}`}>{s.l}</span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card title="Cuéntanos">
        <Textarea label="¿Qué fue lo mejor de tu semana?" value={form.lo_mejor} onChange={(v) => set("lo_mejor", v)} />
        <Textarea label="¿Qué fue lo más difícil?" value={form.lo_dificil} onChange={(v) => set("lo_dificil", v)} />
        <Textarea label="¿Qué ocupó más tu mente esta semana?" value={form.ocupo_mente} onChange={(v) => set("ocupo_mente", v)} />
      </Card>

      <Card title="¿Qué emociones estuvieron más presentes?">
        <div className="flex flex-wrap gap-2">
          {emocionesOpts.map((e) => {
            const on = form.emociones.includes(e.v);
            return (
              <button key={e.v} type="button" onClick={() => toggle(e.v)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full border text-sm transition-all ${
                  on ? "border-violet-400 bg-violet-50 text-violet-700" : "border-stone-200 text-stone-600 hover:border-stone-300"
                }`}>
                <span>{e.e}</span><span>{e.v}</span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card title="Tu caminar con Dios">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">¿Cómo estuvo tu relación con Dios esta semana?</label>
          <select value={form.relacion_dios} onChange={(e) => set("relacion_dios", e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 bg-white focus:border-violet-400 outline-none">
            <option value="">Elige una opción...</option>
            {diosOpts.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
        <Textarea label="¿Hay algo por lo que quisieras oración?" value={form.peticion} onChange={(v) => set("peticion", v)} />
      </Card>

      {error && <p className="text-sm bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl">{error}</p>}

      <div className="text-center pt-2">
        <button type="button" onClick={submit} disabled={loading}
          className="w-full sm:w-auto sm:min-w-[240px] px-6 py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-medium shadow-sm">
          {loading ? "Enviando..." : "Enviar 💜"}
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
function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1">{label}</label>
      <textarea rows={2} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50/40 focus:bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none resize-none" />
    </div>
  );
}
