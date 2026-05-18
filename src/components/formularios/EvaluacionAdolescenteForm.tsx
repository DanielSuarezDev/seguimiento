"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { responderFormulario } from "@/app/f/[token]/actions";

interface Props { tokenId: string; token: string; personaId: string; nombrePersona: string }

type FormData = {
  nombre: string;
  edad: string;
  colegio: string;
  curso: string;
  con_quien_vives: string;
  sentimientos: string[];
  mas_dificil: string;
  ocupa_mente: string;
  preocupacion: string;
  amistades: string;
  presion_redes: string;
  sentido_solo: string;
  relacion_padres: string;
  hablar_en_casa: string;
  espiritual: string;
  peticion: string;
};

const sentimientos: { v: string; emoji: string }[] = [
  { v: "Ansiedad", emoji: "😰" },
  { v: "Tristeza", emoji: "😔" },
  { v: "Enojo", emoji: "😡" },
  { v: "Cansancio", emoji: "😴" },
  { v: "Confusión", emoji: "😶" },
  { v: "Paz", emoji: "🙂" },
  { v: "Estrés", emoji: "😅" },
  { v: "Soledad", emoji: "🥹" },
  { v: "Alegría", emoji: "😄" },
  { v: "Desánimo", emoji: "😞" },
];

const amistadesOpts = ["Muy bien", "Bien", "Más o menos", "Mal", "Muy mal"];
const presionOpts = ["Sí", "A veces", "No"];
const espiritualOpts = ["Cerca de Dios", "Confundido", "Lejos de Dios", "Quiero acercarme más", "No sé"];

export default function EvaluacionAdolescenteForm({ tokenId, token, personaId, nombrePersona }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({
    nombre: nombrePersona, edad: "", colegio: "", curso: "", con_quien_vives: "",
    sentimientos: [], mas_dificil: "", ocupa_mente: "", preocupacion: "",
    amistades: "", presion_redes: "", sentido_solo: "",
    relacion_padres: "", hablar_en_casa: "",
    espiritual: "", peticion: "",
  });

  function set<K extends keyof FormData>(k: K, v: FormData[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }
  function toggle(v: string) {
    setForm((p) => ({
      ...p,
      sentimientos: p.sentimientos.includes(v)
        ? p.sentimientos.filter((x) => x !== v)
        : [...p.sentimientos, v],
    }));
  }

  async function submit() {
    if (!form.nombre.trim() || !form.edad.trim()) {
      setError("Cuéntanos al menos tu nombre y edad antes de enviar 🙂");
      return;
    }
    setLoading(true);
    const r = await responderFormulario({
      token, tokenId, personaId,
      tipo: "evaluacion_adolescente",
      respuestas: { ...form },
    });
    if (r.ok) router.push(`/f/${token}/enviado`);
    else { setError(r.error); setLoading(false); }
  }

  return (
    <div className="space-y-5">
      <header className="text-center space-y-2 pt-2">
        <div className="text-4xl">👋</div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-stone-800">Hola, qué bueno verte aquí</h1>
        <p className="text-stone-500 text-sm max-w-md mx-auto leading-relaxed">
          Esto no es un examen. Solo queremos conocerte un poquito mejor.
          Responde lo que sientas, no hay respuestas correctas.
        </p>
      </header>

      <Card title="Conociéndote" emoji="😄">
        <Grid>
          <Input label="Nombre" value={form.nombre} onChange={(v) => set("nombre", v)} />
          <Input label="Edad" type="number" value={form.edad} onChange={(v) => set("edad", v)} />
          <Input label="Colegio" value={form.colegio} onChange={(v) => set("colegio", v)} />
          <Input label="Curso o grado" value={form.curso} onChange={(v) => set("curso", v)} />
          <Input label="¿Con quién vives?" value={form.con_quien_vives} onChange={(v) => set("con_quien_vives", v)} full />
        </Grid>
      </Card>

      <Card title="¿Cómo te has sentido últimamente?" subtitle="Marca todo lo que apliquen. Puedes elegir varios.">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {sentimientos.map((s) => {
            const on = form.sentimientos.includes(s.v);
            return (
              <button
                key={s.v}
                type="button"
                onClick={() => toggle(s.v)}
                className={`flex flex-col items-center gap-1 py-3 rounded-2xl border-2 transition-all ${
                  on ? "border-violet-400 bg-violet-50" : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <span className="text-2xl">{s.emoji}</span>
                <span className={`text-xs font-medium ${on ? "text-violet-700" : "text-stone-600"}`}>{s.v}</span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card title="Lo que está pasando" emoji="🧠">
        <Textarea label="¿Qué ha sido lo más difícil últimamente?"
          value={form.mas_dificil} onChange={(v) => set("mas_dificil", v)} />
        <Textarea label="¿Qué cosas ocupan más tu mente?"
          value={form.ocupa_mente} onChange={(v) => set("ocupa_mente", v)} />
        <Textarea label="¿Hay algo que te esté preocupando mucho?"
          value={form.preocupacion} onChange={(v) => set("preocupacion", v)} />
      </Card>

      <Card title="Amigos y redes" emoji="📱">
        <Select label="¿Cómo te sientes con tus amistades?" options={amistadesOpts}
          value={form.amistades} onChange={(v) => set("amistades", v)} />
        <Pills label="¿Sientes presión por redes sociales o comparación con otros?"
          options={presionOpts} value={form.presion_redes} onChange={(v) => set("presion_redes", v)} />
        <Pills label="¿Te has sentido solo últimamente?"
          options={presionOpts} value={form.sentido_solo} onChange={(v) => set("sentido_solo", v)} />
      </Card>

      <Card title="Familia" emoji="🏠">
        <Textarea label="¿Cómo sientes la relación con tus padres?"
          value={form.relacion_padres} onChange={(v) => set("relacion_padres", v)} />
        <Pills label="¿Sientes que puedes hablar con alguien en casa?"
          options={["Sí", "A veces", "No"]}
          value={form.hablar_en_casa} onChange={(v) => set("hablar_en_casa", v)} />
      </Card>

      <Card title="Vida espiritual" emoji="🤍">
        <Select label="¿Cómo te sientes espiritualmente últimamente?"
          options={espiritualOpts} value={form.espiritual} onChange={(v) => set("espiritual", v)} />
        <Textarea label="¿Hay algo por lo que quisieras recibir ayuda u oración?"
          value={form.peticion} onChange={(v) => set("peticion", v)} />
      </Card>

      {error && (
        <p className="text-sm bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl">{error}</p>
      )}

      <div className="text-center pt-2">
        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="w-full sm:w-auto sm:min-w-[260px] px-6 py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-medium shadow-sm transition-all"
        >
          {loading ? "Enviando..." : "Enviar 💜"}
        </button>
        <p className="text-xs text-stone-400 mt-3">Tu consejero leerá esto con cariño y respeto.</p>
      </div>
    </div>
  );
}

/* helpers */
function Card({ title, subtitle, emoji, children }: { title: string; subtitle?: string; emoji?: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5 sm:p-7 space-y-4">
      <header className="flex items-start gap-3">
        {emoji && <div className="w-10 h-10 rounded-2xl bg-violet-50 text-xl flex items-center justify-center shrink-0">{emoji}</div>}
        <div>
          <h2 className="text-lg font-semibold text-stone-800">{title}</h2>
          {subtitle && <p className="text-sm text-stone-500 mt-0.5">{subtitle}</p>}
        </div>
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid sm:grid-cols-2 gap-4">{children}</div>;
}
function Input({ label, value, onChange, type = "text", full }: { label: string; value: string; onChange: (v: string) => void; type?: string; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="block text-sm font-medium text-stone-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50/40 focus:bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-colors" />
    </div>
  );
}
function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1">{label}</label>
      <textarea rows={2} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50/40 focus:bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-colors resize-none" />
    </div>
  );
}
function Select({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none">
        <option value="">Elige una opción...</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
function Pills({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value === o;
          return (
            <button key={o} type="button" onClick={() => onChange(o)}
              className={`px-4 py-2 rounded-full text-sm border transition-all ${
                on ? "border-violet-500 bg-violet-50 text-violet-700" : "border-stone-200 text-stone-600 hover:border-stone-300"
              }`}>
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}
