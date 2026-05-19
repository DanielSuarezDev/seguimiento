"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { responderFormulario } from "@/app/f/[token]/actions";
import PreguntasHistorial, { type HistorialHandle } from "./PreguntasHistorial";

interface Props { tokenId: string; token: string; personaId: string; nombrePersona: string }

type FormData = {
  nombre_esposo: string; nombre_esposa: string;
  tiempo_casados: string; hijos: string; iglesia: string;
  describen_relacion: string;
  detalle_matrimonio: string;
  areas_ayuda: string[];
  fuente_conflictos: string;
  escucha_mutua: string;
  manejo_desacuerdos: string;
  oran_juntos: string;
  dios_centro: string;
  expectativas: string;
  dispuestos_trabajar: boolean;
};

const relacionOpts = ["Muy fuerte", "Estable", "Distante", "Tensa", "Muy difícil"];
const areasOpts = [
  "Comunicación", "Perdón", "Conflictos", "Crianza",
  "Intimidad emocional", "Finanzas", "Liderazgo", "Respeto",
  "Confianza", "Espiritualidad",
];
const escuchaOpts = ["Sí, generalmente", "A veces", "Nos cuesta mucho", "No"];
const oranOpts = ["Sí, regularmente", "A veces", "Rara vez", "No"];
const diosCentroOpts = ["Sí", "Queremos crecer", "Nos cuesta", "No actualmente"];

const TOTAL = 7;

export default function EvaluacionMatrimonialForm({ tokenId, token, personaId, nombrePersona }: Props) {
  const router = useRouter();
  const historialEsposoRef = useRef<HistorialHandle>(null);
  const historialEsposaRef = useRef<HistorialHandle>(null);
  const [paso, setPaso] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormData>({
    nombre_esposo: "", nombre_esposa: nombrePersona,
    tiempo_casados: "", hijos: "", iglesia: "",
    describen_relacion: "", detalle_matrimonio: "", areas_ayuda: [],
    fuente_conflictos: "", escucha_mutua: "", manejo_desacuerdos: "",
    oran_juntos: "", dios_centro: "",
    expectativas: "", dispuestos_trabajar: false,
  });

  function set<K extends keyof FormData>(k: K, v: FormData[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }
  function toggleArea(v: string) {
    setForm((p) => ({
      ...p,
      areas_ayuda: p.areas_ayuda.includes(v) ? p.areas_ayuda.filter((x) => x !== v) : [...p.areas_ayuda, v],
    }));
  }

  function next() {
    setError(null);
    if (paso === 1) {
      if (!form.nombre_esposo.trim() || !form.nombre_esposa.trim()) {
        setError("Por favor escriban ambos nombres antes de continuar.");
        return;
      }
    }
    setPaso((p) => Math.min(p + 1, TOTAL));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function prev() {
    setError(null);
    setPaso((p) => Math.max(p - 1, 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    if (!form.dispuestos_trabajar) {
      setError("Por favor confirmen su disposición a trabajar juntos antes de enviar.");
      return;
    }
    setLoading(true);
    const r = await responderFormulario({
      token, tokenId, personaId,
      tipo: "evaluacion_matrimonial",
      respuestas: {
        ...form,
        historial_esposo: historialEsposoRef.current?.getValues(),
        historial_esposa: historialEsposaRef.current?.getValues(),
      },
    });
    if (r.ok) router.push(`/f/${token}/enviado`);
    else { setError(r.error); setLoading(false); }
  }

  const progreso = (paso / TOTAL) * 100;

  return (
    <div className="space-y-5">
      <header className="text-center space-y-2 pt-2">
        <div className="text-3xl">🤍</div>
        <h1 className="text-2xl font-semibold text-stone-800">Bienvenidos</h1>
        <p className="text-stone-500 text-sm max-w-lg mx-auto leading-relaxed">
          Este formulario está pensado para que respondan juntos, en calma.
          No es un examen ni una evaluación de culpas: es una conversación honesta
          para que podamos caminar con ustedes a la luz de la Palabra.
        </p>
      </header>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-stone-500">
          <span>Paso {paso} de {TOTAL}</span>
          <span>{Math.round(progreso)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-stone-200 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-rose-400 to-amber-500 transition-all duration-500" style={{ width: `${progreso}%` }} />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
        {paso === 1 && (
          <Section title="Información básica" emoji="💍">
            <Grid>
              <Input label="Nombre del esposo *" value={form.nombre_esposo} onChange={(v) => set("nombre_esposo", v)} />
              <Input label="Nombre de la esposa *" value={form.nombre_esposa} onChange={(v) => set("nombre_esposa", v)} />
              <Input label="Tiempo de casados" value={form.tiempo_casados} onChange={(v) => set("tiempo_casados", v)} placeholder="Ej: 8 años" />
              <Input label="Hijos" value={form.hijos} onChange={(v) => set("hijos", v)} placeholder="Cantidad y edades" />
              <Input label="Iglesia" value={form.iglesia} onChange={(v) => set("iglesia", v)} full />
            </Grid>
          </Section>
        )}

        {paso === 2 && (
          <Section title="Su relación hoy" emoji="🤍">
            <Pills label="¿Cómo describirían actualmente su relación?"
              options={relacionOpts} value={form.describen_relacion} onChange={(v) => set("describen_relacion", v)} />

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Cuéntennos cómo es su matrimonio hoy
              </label>
              <div className="bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 mb-2 flex gap-2 items-start">
                <span className="text-lg leading-none mt-0.5">🤍</span>
                <p className="text-xs text-rose-800 leading-relaxed">
                  <span className="font-semibold">Sean 100% honestos.</span> Este espacio es seguro y confidencial.
                  Mientras más detalles compartan —lo bueno, lo difícil, lo que duele, lo que aman—
                  mejor podremos acompañarlos. No tengan miedo de extenderse; cada detalle importa.
                </p>
              </div>
              <textarea
                rows={7}
                value={form.detalle_matrimonio}
                onChange={(e) => set("detalle_matrimonio", e.target.value)}
                placeholder="Cómo se conocieron, cómo se sienten hoy, qué los une, qué los desgasta, momentos buenos, conflictos, heridas, esperanzas… todo lo que quieran contar."
                className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50/40 focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Áreas en las que sienten que necesitan ayuda
                <span className="text-stone-400 font-normal ml-1">(marquen todas las que apliquen)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {areasOpts.map((a) => {
                  const on = form.areas_ayuda.includes(a);
                  return (
                    <button key={a} type="button" onClick={() => toggleArea(a)}
                      className={`px-4 py-2 rounded-full text-sm border transition-all ${
                        on ? "border-rose-400 bg-rose-50 text-rose-700" : "border-stone-200 text-stone-600 hover:border-stone-300"
                      }`}>
                      {a}
                    </button>
                  );
                })}
              </div>
            </div>
          </Section>
        )}

        {paso === 3 && (
          <Section title="Comunicación" emoji="🗣️">
            <Textarea label="¿Qué suele generar más conflictos entre ustedes?"
              value={form.fuente_conflictos} onChange={(v) => set("fuente_conflictos", v)} rows={3} />
            <Pills label="¿Sienten que logran escucharse mutuamente?"
              options={escuchaOpts} value={form.escucha_mutua} onChange={(v) => set("escucha_mutua", v)} />
            <Textarea label="¿Cómo manejan normalmente los desacuerdos?"
              value={form.manejo_desacuerdos} onChange={(v) => set("manejo_desacuerdos", v)} rows={3} />
          </Section>
        )}

        {paso === 4 && (
          <Section title="Vida espiritual juntos" emoji="✝️">
            <Pills label="¿Oran juntos?" options={oranOpts}
              value={form.oran_juntos} onChange={(v) => set("oran_juntos", v)} />
            <Pills label="¿Sienten que Dios está en el centro de la relación?"
              options={diosCentroOpts} value={form.dios_centro} onChange={(v) => set("dios_centro", v)} />
          </Section>
        )}

        {paso === 5 && (
          <Section title="Expectativas del proceso" emoji="🤝">
            <Textarea label="¿Qué esperan de este proceso de consejería?"
              value={form.expectativas} onChange={(v) => set("expectativas", v)} rows={4} />
          </Section>
        )}

        {paso === 6 && (
          <Section title="Historial personal" emoji="📜">
            <p className="text-sm text-stone-500">
              Cada uno responde por separado. Estas preguntas nos ayudan a conocer mejor el contexto de cada uno.
            </p>
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-stone-700 mb-2">Esposo</h3>
                <PreguntasHistorial ref={historialEsposoRef} accent="rose" title="" subtitle="" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-stone-700 mb-2">Esposa</h3>
                <PreguntasHistorial ref={historialEsposaRef} accent="rose" title="" subtitle="" />
              </div>
            </div>
          </Section>
        )}

        {paso === 7 && (
          <Section title="Confirmación" emoji="🕊️">
            <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 text-stone-700 text-sm leading-relaxed">
              Entendemos que este proceso busca acompañarnos en oración, escucha y verdad bíblica,
              con respeto y confidencialidad. Confiamos que Dios puede obrar en nuestra relación.
            </div>
            <label className="flex items-start gap-3 p-4 rounded-2xl border border-stone-200 hover:border-rose-300 cursor-pointer bg-white">
              <input type="checkbox" checked={form.dispuestos_trabajar}
                onChange={(e) => set("dispuestos_trabajar", e.target.checked)}
                className="mt-1 w-5 h-5 accent-rose-500" />
              <span className="text-sm text-stone-700 font-medium">
                Estamos dispuestos a trabajar juntos en cambios prácticos y bíblicos.
              </span>
            </label>
          </Section>
        )}

        {error && <p className="text-sm bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl">{error}</p>}

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          {paso > 1 && (
            <button type="button" onClick={prev} disabled={loading}
              className="sm:flex-1 px-5 py-3 rounded-2xl border border-stone-300 text-stone-600 hover:bg-stone-50 font-medium">
              ← Anterior
            </button>
          )}
          {paso < TOTAL && (
            <button type="button" onClick={next}
              className="sm:flex-1 px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-sm">
              Continuar →
            </button>
          )}
          {paso === TOTAL && (
            <button type="button" onClick={submit} disabled={loading || !form.dispuestos_trabajar}
              className="sm:flex-1 px-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-medium shadow-sm">
              {loading ? "Enviando..." : "Enviar formulario"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, emoji, children }: { title: string; emoji?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        {emoji && <div className="w-10 h-10 rounded-2xl bg-rose-50 text-xl flex items-center justify-center shrink-0">{emoji}</div>}
        <h2 className="text-xl font-semibold text-stone-800">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid sm:grid-cols-2 gap-4">{children}</div>;
}
function Input({ label, value, onChange, placeholder, full }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="block text-sm font-medium text-stone-700 mb-1">{label}</label>
      <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50/40 focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none" />
    </div>
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
