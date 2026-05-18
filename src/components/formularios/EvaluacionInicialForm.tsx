"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { responderFormulario } from "@/app/f/[token]/actions";

interface Props { tokenId: string; token: string; personaId: string; nombrePersona: string; }

type FormData = {
  // Paso 2 — Conociéndote
  nombre_completo: string; edad: string; sexo: string; estado_civil: string;
  telefono: string; correo: string; ocupacion: string;
  iglesia_asiste: string; referido_por: string;
  // Paso 3 — Tu historia
  historia_familiar: string; vivio_ambos_padres: string;
  relacion_padre: string; relacion_madre: string; heridas_pasado: string;
  ambiente_crianza: string[];
  // Paso 4 — Tu situación actual
  situacion_actual: string; desde_cuando: string; afectacion_diaria: string;
  intentos_resolver: string; sentimientos_recientes: string[]; peso_situacion: number;
  // Paso 5 — Tu caminar espiritual
  creyente: string; relacion_dios: string; asiste_iglesia_freq: string;
  tiempo_oracion: string; lee_biblia: string;
  luchas_espirituales: string; dios_trabajando: string;
  // Paso 6 — Preguntas del corazón
  preocupacion_principal: string; teme_perder: string; deseo_profundo: string;
  refugio: string; ocupa_mente: string; provoca_emociones: string; necesidad_paz: string;
  // Paso 7 — Cómo caminar contigo
  expectativas: string; orientacion_biblica: string; tareas_practicas: string;
  disponibilidad: string; algo_mas: string;
  // Paso 8 — Consentimiento
  consentimiento: boolean;
};

const ambienteOpciones = [
  "Amor", "Paz", "Comunicación", "Gritos", "Peleas", "Violencia", "Soledad",
  "Abandono", "Perdón", "Fe", "Oración", "Apoyo", "Miedo", "Distancia emocional",
];

const sentimientosOpciones = [
  "Ansioso", "Desanimado", "Sin paz", "Enojado", "Confundido",
  "Solo", "Agotado", "Con esperanza", "Culpable", "Temeroso",
];

const TOTAL_PASOS = 8;

export default function EvaluacionInicialForm({ tokenId, token, personaId, nombrePersona }: Props) {
  const router = useRouter();
  const [paso, setPaso] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorPaso, setErrorPaso] = useState<string | null>(null);

  const [form, setForm] = useState<FormData>({
    nombre_completo: nombrePersona, edad: "", sexo: "", estado_civil: "",
    telefono: "", correo: "", ocupacion: "", iglesia_asiste: "", referido_por: "",
    historia_familiar: "", vivio_ambos_padres: "", relacion_padre: "",
    relacion_madre: "", heridas_pasado: "", ambiente_crianza: [],
    situacion_actual: "", desde_cuando: "", afectacion_diaria: "",
    intentos_resolver: "", sentimientos_recientes: [], peso_situacion: 3,
    creyente: "", relacion_dios: "", asiste_iglesia_freq: "",
    tiempo_oracion: "", lee_biblia: "", luchas_espirituales: "", dios_trabajando: "",
    preocupacion_principal: "", teme_perder: "", deseo_profundo: "",
    refugio: "", ocupa_mente: "", provoca_emociones: "", necesidad_paz: "",
    expectativas: "", orientacion_biblica: "", tareas_practicas: "",
    disponibilidad: "", algo_mas: "",
    consentimiento: false,
  });

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function toggleChip(key: "ambiente_crianza" | "sentimientos_recientes", value: string) {
    setForm((p) => {
      const list = p[key];
      return { ...p, [key]: list.includes(value) ? list.filter((x) => x !== value) : [...list, value] };
    });
  }

  function validarPaso(actual: number): string | null {
    if (actual === 2) {
      if (!form.nombre_completo.trim()) return "Por favor escribe tu nombre completo.";
      if (!form.edad.trim()) return "Por favor indica tu edad.";
    }
    if (actual === 4) {
      if (!form.situacion_actual.trim()) return "Cuéntanos brevemente qué está pasando en tu vida.";
    }
    if (actual === 8) {
      if (!form.consentimiento) return "Necesitamos tu consentimiento para continuar.";
    }
    return null;
  }

  function siguiente() {
    const err = validarPaso(paso);
    if (err) { setErrorPaso(err); return; }
    setErrorPaso(null);
    setPaso((p) => Math.min(p + 1, TOTAL_PASOS + 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function anterior() {
    setErrorPaso(null);
    setPaso((p) => Math.max(p - 1, 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit() {
    const err = validarPaso(8);
    if (err) { setErrorPaso(err); return; }
    setLoading(true);
    const result = await responderFormulario({
      token, tokenId, personaId,
      tipo: "evaluacion_inicial",
      respuestas: { ...form },
    });
    if (result.ok) router.push(`/f/${token}/enviado`);
    else { setError(result.error); setLoading(false); }
  }

  const progreso = Math.min((paso / TOTAL_PASOS) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-stone-500">
          <span className="font-medium">Paso {Math.min(paso, TOTAL_PASOS)} de {TOTAL_PASOS}</span>
          <span>{Math.round(progreso)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-stone-200 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500 ease-out"
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
        {paso === 1 && <PasoBienvenida />}
        {paso === 2 && <PasoConociendote form={form} set={set} />}
        {paso === 3 && <PasoHistoria form={form} set={set} toggleChip={toggleChip} />}
        {paso === 4 && <PasoSituacion form={form} set={set} toggleChip={toggleChip} />}
        {paso === 5 && <PasoEspiritual form={form} set={set} />}
        {paso === 6 && <PasoCorazon form={form} set={set} />}
        {paso === 7 && <PasoCaminar form={form} set={set} />}
        {paso === 8 && <PasoConsentimiento form={form} set={set} />}

        {errorPaso && (
          <p className="text-sm bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl">
            {errorPaso}
          </p>
        )}
        {error && (
          <p className="text-sm bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          {paso > 1 && (
            <button
              type="button"
              onClick={anterior}
              disabled={loading}
              className="sm:flex-1 px-5 py-3 rounded-2xl border border-stone-300 text-stone-600 hover:bg-stone-50 transition-colors font-medium"
            >
              ← Anterior
            </button>
          )}
          {paso < TOTAL_PASOS && (
            <button
              type="button"
              onClick={siguiente}
              className="sm:flex-1 px-5 py-3 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-medium transition-colors shadow-sm"
            >
              {paso === 1 ? "Comenzar" : "Continuar →"}
            </button>
          )}
          {paso === TOTAL_PASOS && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !form.consentimiento}
              className="sm:flex-1 px-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors shadow-sm"
            >
              {loading ? "Enviando..." : "Enviar formulario"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Subcomponentes por paso ---------- */

function PasoHeader({ titulo, descripcion }: { titulo: string; descripcion: string }) {
  return (
    <div className="space-y-1">
      <h2 className="text-2xl font-semibold text-stone-800">{titulo}</h2>
      <p className="text-stone-500 text-sm leading-relaxed">{descripcion}</p>
    </div>
  );
}

function PasoBienvenida() {
  return (
    <div className="space-y-5 py-6 text-center">
      <div className="text-5xl">🤍</div>
      <h2 className="text-3xl font-semibold text-stone-800">Bienvenido</h2>
      <p className="text-stone-600 leading-relaxed max-w-md mx-auto">
        Gracias por tomarte el tiempo de llenar este formulario. El propósito no es juzgarte,
        sino conocerte mejor para poder caminar contigo a la luz de la Palabra de Dios.
        Queremos escucharte, entender tu situación y acompañarte con amor, verdad y esperanza.
      </p>
    </div>
  );
}

type StepProps = {
  form: FormData;
  set: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
};
type StepPropsChip = StepProps & { toggleChip: (key: "ambiente_crianza" | "sentimientos_recientes", value: string) => void };

function PasoConociendote({ form, set }: StepProps) {
  return (
    <div className="space-y-5">
      <PasoHeader titulo="Conociéndote" descripcion="Cuéntanos un poco sobre ti para poder conocerte mejor." />
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Nombre completo *">
          <input className="input" value={form.nombre_completo} onChange={(e) => set("nombre_completo", e.target.value)} />
        </Field>
        <Field label="Edad *">
          <input className="input" type="number" min="1" max="120" value={form.edad} onChange={(e) => set("edad", e.target.value)} />
        </Field>
        <Field label="Sexo">
          <select className="input" value={form.sexo} onChange={(e) => set("sexo", e.target.value)}>
            <option value="">Selecciona...</option>
            <option>Masculino</option>
            <option>Femenino</option>
          </select>
        </Field>
        <Field label="Estado civil">
          <select className="input" value={form.estado_civil} onChange={(e) => set("estado_civil", e.target.value)}>
            <option value="">Selecciona...</option>
            <option>Soltero/a</option>
            <option>Casado/a</option>
            <option>Unión libre</option>
            <option>Separado/a</option>
            <option>Divorciado/a</option>
            <option>Viudo/a</option>
          </select>
        </Field>
        <Field label="Teléfono">
          <input className="input" value={form.telefono} onChange={(e) => set("telefono", e.target.value)} />
        </Field>
        <Field label="Correo electrónico">
          <input className="input" type="email" value={form.correo} onChange={(e) => set("correo", e.target.value)} />
        </Field>
        <Field label="Ocupación">
          <input className="input" value={form.ocupacion} onChange={(e) => set("ocupacion", e.target.value)} />
        </Field>
        <Field label="Iglesia a la que asistes">
          <input className="input" value={form.iglesia_asiste} onChange={(e) => set("iglesia_asiste", e.target.value)} />
        </Field>
        <Field label="¿Quién te refirió?" full>
          <input className="input" value={form.referido_por} onChange={(e) => set("referido_por", e.target.value)} />
        </Field>
      </div>
    </div>
  );
}

function PasoHistoria({ form, set, toggleChip }: StepPropsChip) {
  return (
    <div className="space-y-5">
      <PasoHeader
        titulo="Tu historia"
        descripcion="Lo que viviste en el pasado nos ayuda a comprenderte. Comparte solo lo que te sientas cómodo/a compartiendo."
      />
      <Field label="¿Cómo describirías tu historia familiar?">
        <textarea className="input resize-none" rows={3} value={form.historia_familiar} onChange={(e) => set("historia_familiar", e.target.value)} />
      </Field>
      <Field label="¿Viviste con ambos padres?">
        <Chips opciones={["Sí", "Solo con mi madre", "Solo con mi padre", "Con familiares", "Otro"]}
          valor={form.vivio_ambos_padres} onSelect={(v) => set("vivio_ambos_padres", v)} />
      </Field>
      <Field label="¿Cómo describirías tu relación con tu padre?">
        <textarea className="input resize-none" rows={2} value={form.relacion_padre} onChange={(e) => set("relacion_padre", e.target.value)} />
      </Field>
      <Field label="¿Cómo describirías tu relación con tu madre?">
        <textarea className="input resize-none" rows={2} value={form.relacion_madre} onChange={(e) => set("relacion_madre", e.target.value)} />
      </Field>
      <Field label="¿Hay heridas o situaciones importantes del pasado que consideres necesario compartir?">
        <textarea className="input resize-none" rows={3} value={form.heridas_pasado} onChange={(e) => set("heridas_pasado", e.target.value)}
          placeholder="Esto queda entre tu consejero y tú." />
      </Field>
      <Field label="Marca las palabras que mejor describen el ambiente donde creciste">
        <ChipMulti opciones={ambienteOpciones} valores={form.ambiente_crianza}
          onToggle={(v) => toggleChip("ambiente_crianza", v)} />
      </Field>
    </div>
  );
}

function PasoSituacion({ form, set, toggleChip }: StepPropsChip) {
  return (
    <div className="space-y-5">
      <PasoHeader titulo="Tu situación actual" descripcion="Háblanos de lo que estás viviendo hoy." />
      <Field label="¿Qué está pasando en tu vida actualmente? *">
        <textarea className="input resize-none" rows={4} value={form.situacion_actual} onChange={(e) => set("situacion_actual", e.target.value)} />
      </Field>
      <Field label="¿Desde cuándo estás viviendo esta situación?">
        <input className="input" value={form.desde_cuando} onChange={(e) => set("desde_cuando", e.target.value)} placeholder="Ej: 3 meses, 2 años..." />
      </Field>
      <Field label="¿Cómo ha afectado tu vida diaria?">
        <textarea className="input resize-none" rows={3} value={form.afectacion_diaria} onChange={(e) => set("afectacion_diaria", e.target.value)} />
      </Field>
      <Field label="¿Qué has intentado hacer para resolverlo?">
        <textarea className="input resize-none" rows={3} value={form.intentos_resolver} onChange={(e) => set("intentos_resolver", e.target.value)} />
      </Field>
      <Field label="¿Cómo te has sentido estas últimas semanas?">
        <ChipMulti opciones={sentimientosOpciones} valores={form.sentimientos_recientes}
          onToggle={(v) => toggleChip("sentimientos_recientes", v)} />
      </Field>
      <Field label="En una escala del 1 al 5, ¿qué tan pesada sientes esta situación actualmente?">
        <div className="flex items-center gap-3 mt-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => set("peso_situacion", n)}
              className={`w-11 h-11 rounded-full border-2 text-sm font-semibold transition-all ${
                form.peso_situacion === n
                  ? "border-amber-500 bg-amber-50 text-amber-700"
                  : "border-stone-200 text-stone-400 hover:border-stone-300"
              }`}>
              {n}
            </button>
          ))}
          <span className="text-xs text-stone-500 ml-2">1 ligera · 5 muy pesada</span>
        </div>
      </Field>
    </div>
  );
}

function PasoEspiritual({ form, set }: StepProps) {
  return (
    <div className="space-y-5">
      <PasoHeader titulo="Tu caminar espiritual" descripcion="Queremos conocer tu relación con Dios para poder acompañarte mejor." />
      <Field label="¿Te consideras creyente en Cristo?">
        <Chips opciones={["Sí", "Estoy buscando", "No estoy seguro/a", "No"]}
          valor={form.creyente} onSelect={(v) => set("creyente", v)} />
      </Field>
      <Field label="¿Cómo describirías tu relación actual con Dios?">
        <textarea className="input resize-none" rows={3} value={form.relacion_dios} onChange={(e) => set("relacion_dios", e.target.value)} />
      </Field>
      <Field label="¿Asistes regularmente a una iglesia?">
        <Chips opciones={["Sí, cada semana", "Algunas veces", "Casi nunca", "No"]}
          valor={form.asiste_iglesia_freq} onSelect={(v) => set("asiste_iglesia_freq", v)} />
      </Field>
      <Field label="¿Tienes tiempos de oración?">
        <Chips opciones={["Diariamente", "Varias veces por semana", "Ocasionalmente", "Casi nunca"]}
          valor={form.tiempo_oracion} onSelect={(v) => set("tiempo_oracion", v)} />
      </Field>
      <Field label="¿Lees la Biblia regularmente?">
        <Chips opciones={["Diariamente", "Varias veces por semana", "Ocasionalmente", "Casi nunca"]}
          valor={form.lee_biblia} onSelect={(v) => set("lee_biblia", v)} />
      </Field>
      <Field label="¿Hay alguna lucha espiritual, pecado recurrente o área de obediencia que quieras compartir?">
        <textarea className="input resize-none" rows={3} value={form.luchas_espirituales} onChange={(e) => set("luchas_espirituales", e.target.value)} />
      </Field>
      <Field label="¿Qué crees que Dios quiere trabajar en tu vida en este tiempo?">
        <textarea className="input resize-none" rows={3} value={form.dios_trabajando} onChange={(e) => set("dios_trabajando", e.target.value)} />
      </Field>
    </div>
  );
}

function PasoCorazon({ form, set }: StepProps) {
  return (
    <div className="space-y-5">
      <PasoHeader titulo="Preguntas del corazón" descripcion="Tómate tu tiempo. No hay respuestas correctas o incorrectas." />
      <Field label="¿Qué es lo que más te preocupa actualmente?">
        <textarea className="input resize-none" rows={2} value={form.preocupacion_principal} onChange={(e) => set("preocupacion_principal", e.target.value)} />
      </Field>
      <Field label="¿Qué temes perder?">
        <textarea className="input resize-none" rows={2} value={form.teme_perder} onChange={(e) => set("teme_perder", e.target.value)} />
      </Field>
      <Field label="¿Qué deseas profundamente?">
        <textarea className="input resize-none" rows={2} value={form.deseo_profundo} onChange={(e) => set("deseo_profundo", e.target.value)} />
      </Field>
      <Field label="¿Dónde sueles buscar refugio, consuelo o escape cuando estás bajo presión?">
        <textarea className="input resize-none" rows={2} value={form.refugio} onChange={(e) => set("refugio", e.target.value)} />
      </Field>
      <Field label="¿Qué ocupa más tu mente durante el día?">
        <textarea className="input resize-none" rows={2} value={form.ocupa_mente} onChange={(e) => set("ocupa_mente", e.target.value)} />
      </Field>
      <Field label="¿Qué situación suele provocar más enojo, tristeza o ansiedad en ti?">
        <textarea className="input resize-none" rows={2} value={form.provoca_emociones} onChange={(e) => set("provoca_emociones", e.target.value)} />
      </Field>
      <Field label="¿Qué crees que necesitas para tener paz?">
        <textarea className="input resize-none" rows={2} value={form.necesidad_paz} onChange={(e) => set("necesidad_paz", e.target.value)} />
      </Field>
    </div>
  );
}

function PasoCaminar({ form, set }: StepProps) {
  return (
    <div className="space-y-5">
      <PasoHeader titulo="Cómo podemos caminar contigo" descripcion="Cuéntanos cómo te gustaría que sea este proceso." />
      <Field label="¿Qué esperas recibir de este proceso de consejería?">
        <textarea className="input resize-none" rows={3} value={form.expectativas} onChange={(e) => set("expectativas", e.target.value)} />
      </Field>
      <Field label="¿Estás dispuesto/a a recibir orientación basada en la Palabra de Dios?">
        <Chips opciones={["Sí, totalmente", "Sí, con dudas", "No estoy seguro/a"]}
          valor={form.orientacion_biblica} onSelect={(v) => set("orientacion_biblica", v)} />
      </Field>
      <Field label="¿Estás dispuesto/a a realizar tareas prácticas entre sesiones?">
        <Chips opciones={["Sí", "Tal vez", "Preferiría no"]}
          valor={form.tareas_practicas} onSelect={(v) => set("tareas_practicas", v)} />
      </Field>
      <Field label="¿Qué días u horarios tienes disponibles?">
        <textarea className="input resize-none" rows={2} value={form.disponibilidad} onChange={(e) => set("disponibilidad", e.target.value)}
          placeholder="Ej: lunes y miércoles en la tarde" />
      </Field>
      <Field label="¿Hay algo más que quieras compartir?">
        <textarea className="input resize-none" rows={3} value={form.algo_mas} onChange={(e) => set("algo_mas", e.target.value)} />
      </Field>
    </div>
  );
}

function PasoConsentimiento({ form, set }: StepProps) {
  return (
    <div className="space-y-5">
      <PasoHeader titulo="Confirmación y consentimiento" descripcion="Un último paso antes de enviar." />
      <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 text-stone-700 leading-relaxed text-sm">
        Entiendo que este formulario tiene como propósito ayudar al consejero a conocer mejor mi situación
        para brindarme acompañamiento bíblico. Comprendo que la consejería se realizará con respeto, cuidado
        y confidencialidad, usando la Palabra de Dios como guía principal.
      </div>
      <label className="flex items-start gap-3 p-4 rounded-2xl border border-stone-200 hover:border-amber-300 cursor-pointer transition-colors bg-white">
        <input
          type="checkbox"
          checked={form.consentimiento}
          onChange={(e) => set("consentimiento", e.target.checked)}
          className="mt-1 w-5 h-5 accent-amber-600"
        />
        <span className="text-sm text-stone-700 font-medium">Acepto continuar y enviar mi información.</span>
      </label>
    </div>
  );
}

/* ---------- Inputs reutilizables ---------- */

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function Chips({ opciones, valor, onSelect }: { opciones: string[]; valor: string; onSelect: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {opciones.map((op) => (
        <button key={op} type="button" onClick={() => onSelect(op)}
          className={`px-3 py-1.5 rounded-full border text-sm transition-all ${
            valor === op
              ? "border-amber-500 bg-amber-50 text-amber-700"
              : "border-stone-200 text-stone-600 hover:border-stone-300"
          }`}>
          {op}
        </button>
      ))}
    </div>
  );
}

function ChipMulti({ opciones, valores, onToggle }: { opciones: string[]; valores: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {opciones.map((op) => {
        const activo = valores.includes(op);
        return (
          <button key={op} type="button" onClick={() => onToggle(op)}
            className={`px-3 py-1.5 rounded-full border text-sm transition-all ${
              activo
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-stone-200 text-stone-600 hover:border-stone-300"
            }`}>
            {op}
          </button>
        );
      })}
    </div>
  );
}
