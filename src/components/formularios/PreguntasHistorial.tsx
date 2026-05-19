"use client";
import { forwardRef, useImperativeHandle, useState } from "react";

export type HistorialValues = {
  abuso_pequeno: string;
  abuso_pequeno_detalle: string;
  caracteristicas_familia: string[];
  familia_vicios: string;
  familia_vicios_detalle: string;
  vicios_propios: string;
  vicios_propios_detalle: string;
  arrestado: string;
  arrestado_detalle: string;
  ambos_padres: string;
  ambos_padres_detalle: string;
  matrimonio_padres: string;
  relacion_madre: string;
  relacion_padre: string;
  relacion_hermanos: string;
  estilo_madre: string[];
  estilo_padre: string[];
  sentimientos_ninez: string[];
  enfermedad_actual: string;
};

export type HistorialHandle = { getValues: () => HistorialValues };

export const historialInicial: HistorialValues = {
  abuso_pequeno: "",
  abuso_pequeno_detalle: "",
  caracteristicas_familia: [],
  familia_vicios: "",
  familia_vicios_detalle: "",
  vicios_propios: "",
  vicios_propios_detalle: "",
  arrestado: "",
  arrestado_detalle: "",
  ambos_padres: "",
  ambos_padres_detalle: "",
  matrimonio_padres: "",
  relacion_madre: "",
  relacion_padre: "",
  relacion_hermanos: "",
  estilo_madre: [],
  estilo_padre: [],
  sentimientos_ninez: [],
  enfermedad_actual: "",
};

const caracteristicasFamilia = [
  "Gritos", "Paz", "Peleas", "Violencia", "Comprensión", "Ira",
  "Mala comunicación", "Chismes", "Perdón", "Depresión", "Amargura",
  "Soledad", "Distanciamiento", "Gozo", "Cercanía", "Paciencia",
  "Fe", "Abandono", "Mentiras", "Desorden", "Orgullo", "Amistad",
  "Grosería", "Abrazos", "Besos", "Expresión de cariño", "Lealtad",
  "Oración", "Apoyo", "Ambición",
];

const matrimonioPadresOpts = ["Infeliz", "Promedio", "Feliz", "Muy feliz"];
const siNoOpts = ["Sí", "No"];
const estiloOpts = [
  "Excesivamente autoritario",
  "Excesivamente permisivo",
  "Liderazgo a través del ejemplo",
  "Desconectado / excesivamente ocupado",
];
const sentimientosNinezOpts = [
  "Feliz", "Triste", "Relajado", "Seguro", "Incertidumbre",
  "Privado", "Amoroso", "Reflejaba a Cristo",
];

type Accent = "amber" | "violet" | "rose" | "sky" | "emerald";

const accentMap: Record<Accent, { border: string; bg: string; text: string; focus: string; ring: string }> = {
  amber:   { border: "border-amber-500",   bg: "bg-amber-50",   text: "text-amber-700",   focus: "focus:border-amber-400",   ring: "focus:ring-amber-100" },
  violet:  { border: "border-violet-500",  bg: "bg-violet-50",  text: "text-violet-700",  focus: "focus:border-violet-400",  ring: "focus:ring-violet-100" },
  rose:    { border: "border-rose-500",    bg: "bg-rose-50",    text: "text-rose-700",    focus: "focus:border-rose-400",    ring: "focus:ring-rose-100" },
  sky:     { border: "border-sky-500",     bg: "bg-sky-50",     text: "text-sky-700",     focus: "focus:border-sky-400",     ring: "focus:ring-sky-100" },
  emerald: { border: "border-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700", focus: "focus:border-emerald-400", ring: "focus:ring-emerald-100" },
};

interface Props {
  accent?: Accent;
  title?: string;
  subtitle?: string;
  initial?: Partial<HistorialValues>;
}

const PreguntasHistorial = forwardRef<HistorialHandle, Props>(function PreguntasHistorial(
  { accent = "amber", title = "Historial personal y familiar", subtitle = "Estas preguntas nos ayudan a conocerte mejor. Responde con la honestidad que puedas.", initial },
  ref,
) {
  const [form, setForm] = useState<HistorialValues>({ ...historialInicial, ...initial });
  useImperativeHandle(ref, () => ({ getValues: () => form }), [form]);

  function set<K extends keyof HistorialValues>(k: K, v: HistorialValues[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }
  function toggleArr(k: "caracteristicas_familia" | "estilo_madre" | "estilo_padre" | "sentimientos_ninez", v: string) {
    setForm((p) => {
      const list = p[k];
      return { ...p, [k]: list.includes(v) ? list.filter((x) => x !== v) : [...list, v] };
    });
  }

  const c = accentMap[accent];

  return (
    <section className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5 sm:p-7 space-y-5">
      <header>
        <h2 className="text-lg sm:text-xl font-semibold text-stone-800">{title}</h2>
        {subtitle && <p className="text-sm text-stone-500 mt-1 leading-relaxed">{subtitle}</p>}
      </header>

      <FieldSiNoDetalle
        label="1. De pequeño/a, ¿experimentó algún tipo de abuso?"
        valor={form.abuso_pequeno}
        onValor={(v) => set("abuso_pequeno", v)}
        detalle={form.abuso_pequeno_detalle}
        onDetalle={(v) => set("abuso_pequeno_detalle", v)}
        detallePlaceholder="Si lo desea, comparta brevemente (esto queda confidencial)."
        accent={c}
      />

      <Field label="2. ¿Qué características resaltan en la familia donde creció? (marque todas las que apliquen)">
        <ChipMulti opciones={caracteristicasFamilia} valores={form.caracteristicas_familia}
          onToggle={(v) => toggleArr("caracteristicas_familia", v)} accent={c} />
      </Field>

      <FieldSiNoDetalle
        label="3. ¿Su familia tenía algún vicio?"
        valor={form.familia_vicios}
        onValor={(v) => set("familia_vicios", v)}
        detalle={form.familia_vicios_detalle}
        onDetalle={(v) => set("familia_vicios_detalle", v)}
        detallePlaceholder="¿Cuál?"
        accent={c}
      />

      <FieldSiNoDetalle
        label="4. ¿Usted tiene algún vicio?"
        valor={form.vicios_propios}
        onValor={(v) => set("vicios_propios", v)}
        detalle={form.vicios_propios_detalle}
        onDetalle={(v) => set("vicios_propios_detalle", v)}
        detallePlaceholder="¿Cuál?"
        accent={c}
      />

      <FieldSiNoDetalle
        label="5. ¿Ha sido arrestado alguna vez?"
        valor={form.arrestado}
        onValor={(v) => set("arrestado", v)}
        detalle={form.arrestado_detalle}
        onDetalle={(v) => set("arrestado_detalle", v)}
        detallePlaceholder="Si lo desea, explique brevemente."
        accent={c}
      />

      <FieldSiNoDetalle
        label="6. ¿Fue criado con ambos padres en casa?"
        valor={form.ambos_padres}
        onValor={(v) => set("ambos_padres", v)}
        detalle={form.ambos_padres_detalle}
        onDetalle={(v) => set("ambos_padres_detalle", v)}
        detallePlaceholder="Si no, por favor explique."
        accent={c}
      />

      <Field label="7. Califique el matrimonio de sus padres">
        <Chips opciones={matrimonioPadresOpts} valor={form.matrimonio_padres}
          onSelect={(v) => set("matrimonio_padres", v)} accent={c} />
      </Field>

      <Field label="8. Describa la relación con su madre">
        <TextareaBox value={form.relacion_madre} onChange={(v) => set("relacion_madre", v)} accent={c} />
      </Field>

      <Field label="9. Describa la relación con su padre">
        <TextareaBox value={form.relacion_padre} onChange={(v) => set("relacion_padre", v)} accent={c} />
      </Field>

      <Field label="10. Describa la relación con sus hermanos">
        <TextareaBox value={form.relacion_hermanos} onChange={(v) => set("relacion_hermanos", v)} accent={c} />
      </Field>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-stone-700">
          11. Marque los estilos que aplican a su madre (M) y a su padre (P)
        </label>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-stone-200 p-4 space-y-2">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Madre</p>
            <ChipMulti opciones={estiloOpts} valores={form.estilo_madre}
              onToggle={(v) => toggleArr("estilo_madre", v)} accent={c} />
          </div>
          <div className="rounded-2xl border border-stone-200 p-4 space-y-2">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Padre</p>
            <ChipMulti opciones={estiloOpts} valores={form.estilo_padre}
              onToggle={(v) => toggleArr("estilo_padre", v)} accent={c} />
          </div>
        </div>
      </div>

      <Field label="12. Marque los sentimientos que predominaron en su niñez">
        <ChipMulti opciones={sentimientosNinezOpts} valores={form.sentimientos_ninez}
          onToggle={(v) => toggleArr("sentimientos_ninez", v)} accent={c} />
      </Field>

      <Field label="13. ¿Sufre actualmente de alguna enfermedad o ha notado algún cambio en su cuerpo?">
        <TextareaBox value={form.enfermedad_actual} onChange={(v) => set("enfermedad_actual", v)} accent={c} />
      </Field>
    </section>
  );
});

export default PreguntasHistorial;

/* ---------- helpers ---------- */

type AccentClasses = typeof accentMap[Accent];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-stone-700">{label}</label>
      {children}
    </div>
  );
}

function FieldSiNoDetalle({
  label, valor, onValor, detalle, onDetalle, detallePlaceholder, accent,
}: {
  label: string;
  valor: string;
  onValor: (v: string) => void;
  detalle: string;
  onDetalle: (v: string) => void;
  detallePlaceholder?: string;
  accent: AccentClasses;
}) {
  return (
    <Field label={label}>
      <Chips opciones={siNoOpts} valor={valor} onSelect={onValor} accent={accent} />
      {valor === "Sí" && (
        <textarea
          rows={2}
          value={detalle}
          onChange={(e) => onDetalle(e.target.value)}
          placeholder={detallePlaceholder}
          className={`w-full mt-2 px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50/40 focus:bg-white ${accent.focus} ${accent.ring} focus:ring-2 outline-none resize-none`}
        />
      )}
    </Field>
  );
}

function TextareaBox({ value, onChange, accent, rows = 2 }: { value: string; onChange: (v: string) => void; accent: AccentClasses; rows?: number }) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50/40 focus:bg-white ${accent.focus} ${accent.ring} focus:ring-2 outline-none resize-none`}
    />
  );
}

function Chips({ opciones, valor, onSelect, accent }: { opciones: string[]; valor: string; onSelect: (v: string) => void; accent: AccentClasses }) {
  return (
    <div className="flex flex-wrap gap-2">
      {opciones.map((op) => {
        const on = valor === op;
        return (
          <button key={op} type="button" onClick={() => onSelect(op)}
            className={`px-4 py-2 rounded-full text-sm border transition-all ${
              on ? `${accent.border} ${accent.bg} ${accent.text}` : "border-stone-200 text-stone-600 hover:border-stone-300"
            }`}>
            {op}
          </button>
        );
      })}
    </div>
  );
}

function ChipMulti({ opciones, valores, onToggle, accent }: { opciones: string[]; valores: string[]; onToggle: (v: string) => void; accent: AccentClasses }) {
  return (
    <div className="flex flex-wrap gap-2">
      {opciones.map((op) => {
        const on = valores.includes(op);
        return (
          <button key={op} type="button" onClick={() => onToggle(op)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
              on ? `${accent.border} ${accent.bg} ${accent.text}` : "border-stone-200 text-stone-600 hover:border-stone-300"
            }`}>
            {op}
          </button>
        );
      })}
    </div>
  );
}
