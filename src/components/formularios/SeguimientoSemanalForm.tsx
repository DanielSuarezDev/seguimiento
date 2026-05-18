"use client";

import { forwardRef, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { responderFormulario } from "@/app/f/[token]/actions";

interface Props { tokenId: string; token: string; personaId: string; nombrePersona: string }

const semanaOpciones: { value: number; emoji: string; label: string }[] = [
  { value: 1, emoji: "🌧️", label: "Muy difícil" },
  { value: 2, emoji: "☁️", label: "Difícil" },
  { value: 3, emoji: "🌤️", label: "Estable" },
  { value: 4, emoji: "☀️", label: "Buena" },
  { value: 5, emoji: "🌈", label: "Muy alentadora" },
];

const emocionesOpciones = [
  "Ansiedad", "Paz", "Gratitud", "Temor", "Gozo",
  "Desánimo", "Esperanza", "Frustración", "Soledad", "Cansancio",
];

const schema = z.object({
  como_estuvo_semana: z.number().int().min(1).max(5),
  bueno_agradecido: z.string().optional().default(""),
  dificil_pesado: z.string().optional().default(""),
  prueba_fe_paciencia: z.string().optional().default(""),
  verdad_biblica: z.string().optional().default(""),
  tiempo_oracion: z.string().optional().default(""),
  peticion_oracion: z.string().optional().default(""),
  pasos_obediencia: z.string().optional().default(""),
  costo_continuar: z.string().optional().default(""),
  emociones_presentes: z.array(z.string()).default([]),
  ocupo_mente: z.string().optional().default(""),
});

type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

export default function SeguimientoSemanalForm({ tokenId, token, personaId }: Props) {
  const router = useRouter();
  const {
    control, register, handleSubmit, watch, setValue,
    formState: { isSubmitting, errors },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      como_estuvo_semana: 3,
      bueno_agradecido: "", dificil_pesado: "", prueba_fe_paciencia: "",
      verdad_biblica: "", tiempo_oracion: "", peticion_oracion: "",
      pasos_obediencia: "", costo_continuar: "",
      emociones_presentes: [], ocupo_mente: "",
    },
  });

  const semana = watch("como_estuvo_semana");
  const emociones = watch("emociones_presentes") ?? [];

  // Progreso: cuántos campos llenos / total opcionales (excluyendo el rating de la semana)
  const watchedAll = watch();
  const total = 9;
  const llenos =
    Number(!!watchedAll.bueno_agradecido?.trim()) +
    Number(!!watchedAll.dificil_pesado?.trim()) +
    Number(!!watchedAll.prueba_fe_paciencia?.trim()) +
    Number(!!watchedAll.verdad_biblica?.trim()) +
    Number(!!watchedAll.tiempo_oracion?.trim()) +
    Number(!!watchedAll.peticion_oracion?.trim()) +
    Number(!!watchedAll.pasos_obediencia?.trim()) +
    Number(!!watchedAll.costo_continuar?.trim()) +
    Number(!!watchedAll.ocupo_mente?.trim());
  const progreso = Math.round(((llenos + (emociones.length > 0 ? 1 : 0)) / (total + 1)) * 100);

  function toggleEmocion(v: string) {
    const next = emociones.includes(v) ? emociones.filter((x) => x !== v) : [...emociones, v];
    setValue("emociones_presentes", next, { shouldDirty: true });
  }

  async function onSubmit(values: FormValues) {
    const result = await responderFormulario({
      token, tokenId, personaId,
      tipo: "seguimiento_semanal",
      respuestas: values as unknown as Record<string, unknown>,
    });
    if (result.ok) router.push(`/f/${token}/enviado`);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="text-center space-y-3 pt-2">
        <div className="text-4xl">🤍</div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-stone-800 leading-tight">
          Seguimiento semanal
        </h1>
        <p className="text-stone-600 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
          Gracias por tomarte unos minutos para reflexionar sobre tu semana.
          Tus respuestas son confidenciales y nos ayudarán a caminar contigo
          con más sabiduría y amor pastoral.
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-stone-400">
          <span aria-hidden>⏱️</span>
          <span>Tomará aproximadamente 5 minutos</span>
        </div>
      </header>

      {/* Progress */}
      <div className="space-y-2">
        <div className="h-1.5 w-full rounded-full bg-stone-200 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-300 to-amber-600 transition-all duration-700 ease-out"
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* SECCIÓN 1 — Cómo estuvo tu semana */}
        <SectionCard
          titulo="¿Cómo estuvo tu semana?"
          subtitulo="No tienes que elegir la semana perfecta — solo responde con honestidad."
        >
          <Controller
            control={control}
            name="como_estuvo_semana"
            render={({ field }) => (
              <div className="flex justify-between sm:justify-start sm:gap-3 gap-2">
                {semanaOpciones.map((op) => {
                  const activo = field.value === op.value;
                  return (
                    <button
                      key={op.value}
                      type="button"
                      onClick={() => field.onChange(op.value)}
                      className={`group flex-1 sm:flex-none flex flex-col items-center gap-1 px-1 py-3 rounded-2xl border-2 transition-all duration-200 ${
                        activo
                          ? "border-amber-500 bg-amber-50 scale-[1.04] shadow-sm"
                          : "border-stone-200 hover:border-stone-300 hover:scale-[1.02]"
                      }`}
                    >
                      <span className={`text-2xl sm:text-3xl transition-transform ${activo ? "scale-110" : "group-hover:scale-105"}`}>
                        {op.emoji}
                      </span>
                      <span className={`text-[10px] sm:text-xs font-medium ${activo ? "text-amber-700" : "text-stone-500"}`}>
                        {op.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          />
          {errors.como_estuvo_semana && (
            <p className="text-xs text-red-600">{errors.como_estuvo_semana.message}</p>
          )}
          <p className="text-center text-sm text-stone-500">
            Esta semana se sintió{" "}
            <span className="font-medium text-stone-700">
              {semanaOpciones.find((o) => o.value === semana)?.label.toLowerCase()}
            </span>.
          </p>

          <Field label="¿Qué fue bueno o estás agradecido esta semana?">
            <Autotextarea {...register("bueno_agradecido")} placeholder="Comparte lo que tengas en tu corazón…" />
          </Field>

          <Field label="¿Qué fue difícil o pesado esta semana?">
            <Autotextarea {...register("dificil_pesado")} placeholder="Puedes escribir con tranquilidad…" />
          </Field>

          <Field label="¿Hubo algo que puso a prueba tu fe, paciencia o ánimo?">
            <Autotextarea {...register("prueba_fe_paciencia")} placeholder="No necesitas responder perfecto…" />
          </Field>
        </SectionCard>

        {/* SECCIÓN 2 — Caminando esta semana */}
        <SectionCard
          titulo="Caminando esta semana"
          subtitulo="Pequeñas semillas, no grandes hazañas. Dios obra en lo cotidiano."
          icon="📖"
        >
          <Field label="¿Hubo alguna verdad bíblica o pensamiento que Dios usó para hablarte esta semana?">
            <Autotextarea {...register("verdad_biblica")} placeholder="Un versículo, una idea, una imagen que se quedó contigo…" />
          </Field>

          <Field label="¿Cómo estuvo tu tiempo de oración y comunión con Dios?">
            <Autotextarea {...register("tiempo_oracion")} placeholder="Frecuente, seca, dulce, intermitente… sé honesto/a." />
          </Field>

          <Field label="¿Hay algo específico por lo que quisieras recibir oración?">
            <Autotextarea {...register("peticion_oracion")} placeholder="Lo que tengas en el corazón." />
          </Field>
        </SectionCard>

        {/* SECCIÓN 3 — Pasos de crecimiento */}
        <SectionCard
          titulo="Pasos de crecimiento"
          subtitulo="No estamos midiendo desempeño — solo te acompañamos a caminar."
          icon="🌱"
        >
          <Field label="¿Qué pasos de obediencia o crecimiento pudiste dar esta semana?">
            <Autotextarea {...register("pasos_obediencia")} placeholder="Pequeños o grandes. Cuentan los dos." />
          </Field>

          <Field label="¿Hubo algo que te costó continuar o aplicar? ¿Por qué crees que fue difícil?">
            <Autotextarea {...register("costo_continuar")} placeholder="No para condenarte, sino para entenderlo juntos." />
          </Field>
        </SectionCard>

        {/* SECCIÓN 4 — Corazón y emociones */}
        <SectionCard
          titulo="Corazón y emociones"
          subtitulo="¿Qué emociones estuvieron más presentes esta semana?"
          icon="🤲"
        >
          <div className="flex flex-wrap gap-2">
            {emocionesOpciones.map((e) => {
              const activo = emociones.includes(e);
              return (
                <button
                  key={e}
                  type="button"
                  onClick={() => toggleEmocion(e)}
                  className={`px-4 py-2 rounded-full text-sm transition-all duration-200 border ${
                    activo
                      ? "border-amber-500 bg-amber-50 text-amber-700 shadow-sm scale-[1.03]"
                      : "border-stone-200 text-stone-600 hover:border-stone-300 hover:scale-[1.02]"
                  }`}
                >
                  {e}
                </button>
              );
            })}
          </div>

          <Field label="¿Qué ocupó más tu mente o corazón esta semana?">
            <Autotextarea {...register("ocupo_mente")} placeholder="Lo que aparece cuando todo se queda en silencio." />
          </Field>
        </SectionCard>

        {/* Footer cálido */}
        <div className="rounded-3xl bg-gradient-to-br from-amber-50 via-stone-50 to-emerald-50/40 border border-amber-100 p-6 sm:p-8 text-center space-y-4">
          <div className="text-3xl">🤍</div>
          <p className="text-stone-700 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
            <span className="font-medium">Gracias por abrir tu corazón.</span>
            <br />
            Dios sigue obrando incluso en medio de semanas difíciles. Este seguimiento
            no busca medir perfección, sino acompañarte con gracia, verdad y esperanza.
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto sm:min-w-[260px] px-6 py-3.5 rounded-2xl bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-medium shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
          >
            {isSubmitting ? "Enviando…" : "Enviar seguimiento"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------- Subcomponentes ---------- */

function SectionCard({
  titulo, subtitulo, icon, children,
}: { titulo: string; subtitulo?: string; icon?: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-5">
      <header className="flex items-start gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-xl flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-stone-800 leading-tight">{titulo}</h2>
          {subtitulo && <p className="text-sm text-stone-500 mt-1 leading-relaxed">{subtitulo}</p>}
        </div>
      </header>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-stone-700">{label}</label>
      {children}
    </div>
  );
}

/* Autosize textarea — propaga el ref de RHF y crece según contenido. */
const Autotextarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Autotextarea({ onInput, ...rest }, forwardedRef) {
    const localRef = useRef<HTMLTextAreaElement | null>(null);

    function autosize(el: HTMLTextAreaElement | null) {
      if (!el) return;
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 320)}px`;
    }

    function setRefs(el: HTMLTextAreaElement | null) {
      localRef.current = el;
      if (typeof forwardedRef === "function") forwardedRef(el);
      else if (forwardedRef) forwardedRef.current = el;
    }

    useEffect(() => { autosize(localRef.current); }, []);

    return (
      <textarea
        ref={setRefs}
        rows={2}
        onInput={(e) => {
          autosize(e.currentTarget);
          onInput?.(e);
        }}
        className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50/40 focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 text-stone-800 placeholder:text-stone-400 leading-relaxed transition-colors resize-none outline-none"
        {...rest}
      />
    );
  }
);
