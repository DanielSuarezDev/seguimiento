"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { responderFormulario } from "@/app/f/[token]/actions";

interface Props { tokenId: string; token: string; personaId: string; nombrePersona: string }

type FormData = {
  nombre: string; edad: string; colegio: string;
  sentimiento: string;
  bonito_semana: string; triste_bravo: string; miedo: string;
  pasar_familia: string; relacion_padres: string;
  ora_gusta: string; aprendio_dios: string; peticion: string;
};

const emojisSentir = [
  { e: "😀", l: "Feliz" },
  { e: "😢", l: "Triste" },
  { e: "😡", l: "Bravo" },
  { e: "😨", l: "Asustado" },
  { e: "😴", l: "Cansado" },
  { e: "😬", l: "Nervioso" },
];

const emojisFamilia = [
  { e: "😀", l: "Muy bien" },
  { e: "🙂", l: "Bien" },
  { e: "😐", l: "Más o menos" },
  { e: "😟", l: "No tan bien" },
  { e: "😢", l: "Mal" },
];

const TOTAL = 5;

export default function EvaluacionNinoForm({ tokenId, token, personaId, nombrePersona }: Props) {
  const router = useRouter();
  const [paso, setPaso] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormData>({
    nombre: nombrePersona, edad: "", colegio: "",
    sentimiento: "",
    bonito_semana: "", triste_bravo: "", miedo: "",
    pasar_familia: "", relacion_padres: "",
    ora_gusta: "", aprendio_dios: "", peticion: "",
  });

  function set<K extends keyof FormData>(k: K, v: FormData[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function next() {
    setError(null);
    if (paso === 1 && !form.nombre.trim()) { setError("Escribe tu nombre 🙂"); return; }
    setPaso((p) => Math.min(p + 1, TOTAL));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function prev() {
    setError(null);
    setPaso((p) => Math.max(p - 1, 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    setLoading(true);
    const r = await responderFormulario({
      token, tokenId, personaId,
      tipo: "evaluacion_nino",
      respuestas: { ...form },
    });
    if (r.ok) router.push(`/f/${token}/enviado`);
    else { setError(r.error); setLoading(false); }
  }

  const progreso = (paso / TOTAL) * 100;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-stone-500">
          <span className="font-medium">Paso {paso} de {TOTAL}</span>
          <span>{Math.round(progreso)}%</span>
        </div>
        <div className="h-3 w-full rounded-full bg-stone-200 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-sky-300 to-emerald-400 transition-all duration-500" style={{ width: `${progreso}%` }} />
        </div>
      </div>

      <div className="bg-white rounded-3xl border-2 border-stone-200 shadow-sm p-6 sm:p-8 space-y-6 min-h-[400px]">
        {paso === 1 && (
          <Section title="¡Hola!" emoji="👋" subtitle="Cuéntanos quién eres">
            <BigInput label="¿Cómo te llamas?" value={form.nombre} onChange={(v) => set("nombre", v)} />
            <BigInput label="¿Cuántos años tienes?" type="number" value={form.edad} onChange={(v) => set("edad", v)} />
            <BigInput label="¿A qué colegio vas?" value={form.colegio} onChange={(v) => set("colegio", v)} />
          </Section>
        )}

        {paso === 2 && (
          <Section title="¿Cómo te has sentido?" emoji="😊" subtitle="Toca la carita que más te describe hoy">
            <div className="grid grid-cols-3 gap-3">
              {emojisSentir.map((s) => {
                const on = form.sentimiento === s.l;
                return (
                  <button key={s.l} type="button" onClick={() => set("sentimiento", s.l)}
                    className={`flex flex-col items-center gap-2 py-5 rounded-3xl border-2 transition-all ${
                      on ? "border-sky-400 bg-sky-50 scale-105" : "border-stone-200 hover:border-stone-300"
                    }`}>
                    <span className="text-5xl">{s.e}</span>
                    <span className={`text-sm font-medium ${on ? "text-sky-700" : "text-stone-600"}`}>{s.l}</span>
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        {paso === 3 && (
          <Section title="Cuéntanos un poquito" emoji="💛">
            <BigTextarea label="¿Qué fue lo más bonito de tu semana?" value={form.bonito_semana} onChange={(v) => set("bonito_semana", v)} />
            <BigTextarea label="¿Qué te puso triste o bravo?" value={form.triste_bravo} onChange={(v) => set("triste_bravo", v)} />
            <BigTextarea label="¿Hay algo que te dé miedo?" value={form.miedo} onChange={(v) => set("miedo", v)} />
          </Section>
        )}

        {paso === 4 && (
          <Section title="Tu familia" emoji="🏠">
            <BigRadio label="¿Te gusta pasar tiempo con tu familia?"
              options={["Sí, mucho", "Más o menos", "No mucho"]}
              value={form.pasar_familia} onChange={(v) => set("pasar_familia", v)} />
            <div>
              <label className="block text-base font-medium text-stone-700 mb-3">¿Cómo te llevas con tus papás?</label>
              <div className="grid grid-cols-5 gap-2">
                {emojisFamilia.map((s) => {
                  const on = form.relacion_padres === s.l;
                  return (
                    <button key={s.l} type="button" onClick={() => set("relacion_padres", s.l)}
                      className={`flex flex-col items-center gap-1 py-3 rounded-2xl border-2 transition-all ${
                        on ? "border-sky-400 bg-sky-50" : "border-stone-200 hover:border-stone-300"
                      }`}>
                      <span className="text-3xl">{s.e}</span>
                      <span className={`text-[11px] font-medium ${on ? "text-sky-700" : "text-stone-600"}`}>{s.l}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </Section>
        )}

        {paso === 5 && (
          <Section title="Dios" emoji="🤍">
            <BigRadio label="¿Te gusta orar?"
              options={["Sí", "A veces", "No mucho"]}
              value={form.ora_gusta} onChange={(v) => set("ora_gusta", v)} />
            <BigTextarea label="¿Qué aprendiste de Dios últimamente?" value={form.aprendio_dios} onChange={(v) => set("aprendio_dios", v)} />
            <BigTextarea label="¿Hay algo por lo que quieras orar?" value={form.peticion} onChange={(v) => set("peticion", v)} />
          </Section>
        )}

        {error && <p className="text-sm bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl">{error}</p>}

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          {paso > 1 && (
            <button type="button" onClick={prev} disabled={loading}
              className="sm:flex-1 px-5 py-3.5 rounded-2xl border-2 border-stone-300 text-stone-600 hover:bg-stone-50 font-medium">
              ← Atrás
            </button>
          )}
          {paso < TOTAL && (
            <button type="button" onClick={next}
              className="sm:flex-1 px-5 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-medium shadow-sm">
              Siguiente →
            </button>
          )}
          {paso === TOTAL && (
            <button type="button" onClick={submit} disabled={loading}
              className="sm:flex-1 px-5 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-medium shadow-sm">
              {loading ? "Enviando..." : "¡Listo! 🎉"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, emoji, subtitle, children }: { title: string; emoji?: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <div className="text-center space-y-1">
        {emoji && <div className="text-4xl">{emoji}</div>}
        <h2 className="text-2xl font-semibold text-stone-800">{title}</h2>
        {subtitle && <p className="text-sm text-stone-500">{subtitle}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function BigInput({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-base font-medium text-stone-700 mb-2">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 text-lg rounded-2xl border-2 border-stone-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" />
    </div>
  );
}

function BigTextarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-base font-medium text-stone-700 mb-2">{label}</label>
      <textarea rows={2} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 text-base rounded-2xl border-2 border-stone-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none resize-none" />
    </div>
  );
}

function BigRadio({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-base font-medium text-stone-700 mb-2">{label}</label>
      <div className="grid grid-cols-3 gap-2">
        {options.map((o) => {
          const on = value === o;
          return (
            <button key={o} type="button" onClick={() => onChange(o)}
              className={`py-3 rounded-2xl border-2 text-sm font-medium transition-all ${
                on ? "border-sky-400 bg-sky-50 text-sky-700" : "border-stone-200 text-stone-600 hover:border-stone-300"
              }`}>
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}
