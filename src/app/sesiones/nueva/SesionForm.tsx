"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import type { TipoConsejeria } from "@/types/database";
import {
  sesionFormSchema, type SesionFormInput, type SesionFormValues,
  emocionesOpciones, asuntosCorazonOpciones, versiculosFrecuentes,
  estadoOptions, respuestaOptions, progresoOptions, tipoTareaOptions,
} from "./schema";
import { Section, Field, ChipsMulti, ChipsSingle, CountingTextarea } from "./ui";

type PersonaBasica = { id: string; nombre: string; apellido: string; tipo_consejeria_id: string | null };

const AUTOSAVE_KEY = "sesion-nueva:draft:v1";

export type SesionFormProps = {
  mode?: "create" | "edit";
  sesionId?: string;
  initialValues?: SesionFormInput;
};

function calcularDuracion(inicio: string, fin: string): string {
  if (!inicio || !fin) return "";
  const [hi, mi] = inicio.split(":").map(Number);
  const [hf, mf] = fin.split(":").map(Number);
  if ([hi, mi, hf, mf].some((n) => Number.isNaN(n))) return "";
  let total = hf * 60 + mf - (hi * 60 + mi);
  if (total < 0) total += 24 * 60;
  if (total === 0) return "";
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h > 0 ? `${h} h ${m ? `${m} min` : ""}`.trim() : `${m} min`;
}

export default function SesionForm({ mode = "create", sesionId, initialValues }: SesionFormProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [personas, setPersonas] = useState<PersonaBasica[]>([]);
  const [tipos, setTipos] = useState<TipoConsejeria[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEdit = mode === "edit";

  const defaultValues: SesionFormInput = useMemo(() => initialValues ?? ({
    persona_id: searchParams.get("persona_id") ?? "",
    tipo_consejeria_id: "",
    fecha: new Date().toISOString().split("T")[0],
    hora_inicio: "", hora_fin: "",
    estado: "programada",
    objetivo_principal: "",
    situacion_presentada: "", eventos_semana: "", conflictos_actuales: "",
    sintomas_emociones: "", emociones_observadas: [],
    asuntos_corazon: [], observaciones_corazon: "",
    versiculos: "", ensenanza_biblica: "", aplicacion_evangelio: "",
    llamado_arrepentimiento: "",
    respuesta_aconsejado: "", evidencias_crecimiento: "",
    tareas: [],
    resumen_pastoral: "",
    observaciones_privadas: "",
    evaluacion_progreso: "",
    proxima_sesion: "", proxima_sesion_hora: "", temas_proxima_sesion: "",
  }), [searchParams, initialValues]);

  const {
    control, register, handleSubmit, watch, setValue, getValues, reset,
    formState: { errors, isSubmitting },
  } = useForm<SesionFormInput, unknown, SesionFormValues>({
    resolver: zodResolver(sesionFormSchema),
    defaultValues,
    mode: "onSubmit",
  });

  const { fields, append, remove } = useFieldArray({ control, name: "tareas" });

  /* ---------- Load personas + tipos ---------- */
  useEffect(() => {
    Promise.all([
      supabase.from("personas").select("id, nombre, apellido, tipo_consejeria_id").eq("activo", true).order("nombre"),
      supabase.from("tipos_consejeria").select("*"),
    ]).then(([{ data: p }, { data: t }]) => {
      setPersonas(p ?? []);
      setTipos(t ?? []);
      const preset = searchParams.get("persona_id");
      if (p && preset) {
        const persona = p.find((x) => x.id === preset);
        if (persona?.tipo_consejeria_id) {
          setValue("tipo_consejeria_id", persona.tipo_consejeria_id);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- Autosave local (solo en modo crear) ---------- */
  useEffect(() => {
    if (isEdit || typeof window === "undefined") return;
    const saved = window.localStorage.getItem(AUTOSAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as SesionFormInput;
        reset({ ...defaultValues, ...parsed });
      } catch { /* ignore */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isEdit || typeof window === "undefined") return;
    const sub = watch((value) => {
      window.localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(value));
    });
    return () => sub.unsubscribe();
  }, [watch, isEdit]);

  const horaInicio = watch("hora_inicio");
  const horaFin = watch("hora_fin");
  const duracion = useMemo(() => calcularDuracion(horaInicio ?? "", horaFin ?? ""), [horaInicio, horaFin]);
  const proximaSesionFecha = watch("proxima_sesion");
  const versiculosActual = watch("versiculos") ?? "";
  const emocionesActual = watch("emociones_observadas") ?? [];
  const asuntosActual = watch("asuntos_corazon") ?? [];

  function toggleEmocion(v: string) {
    const next = emocionesActual.includes(v)
      ? emocionesActual.filter((x) => x !== v)
      : [...emocionesActual, v];
    setValue("emociones_observadas", next, { shouldDirty: true });
  }

  function toggleAsuntoCorazon(v: string) {
    const next = asuntosActual.includes(v)
      ? asuntosActual.filter((x) => x !== v)
      : [...asuntosActual, v];
    setValue("asuntos_corazon", next, { shouldDirty: true });
  }

  function appendVersiculo(v: string) {
    const actual = (getValues("versiculos") ?? "").trim();
    if (actual.split(/[,;]\s*/).some((x) => x.trim() === v)) return;
    setValue("versiculos", actual ? `${actual}, ${v}` : v, { shouldDirty: true });
  }

  /* ---------- Submit ---------- */
  async function onSubmit(values: SesionFormValues) {
    setSubmitError(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }

    const payloadBase = {
      persona_id: values.persona_id,
      fecha: values.fecha,
      hora_inicio: values.hora_inicio || null,
      hora_fin: values.hora_fin || null,
      tipo_consejeria_id: values.tipo_consejeria_id || null,
      estado: values.estado,
      objetivo_principal: values.objetivo_principal || null,
      objetivos_sesion: values.objetivo_principal || null,
      situacion_presentada: values.situacion_presentada || null,
      motivo_consulta: values.situacion_presentada || null,
      eventos_semana: values.eventos_semana || null,
      conflictos_actuales: values.conflictos_actuales || null,
      sintomas_emociones: values.sintomas_emociones || null,
      emociones_observadas: values.emociones_observadas,
      asuntos_corazon: values.asuntos_corazon,
      observaciones_corazon: values.observaciones_corazon || null,
      versiculos: values.versiculos || null,
      ensenanza_biblica: values.ensenanza_biblica || null,
      aplicacion_evangelio: values.aplicacion_evangelio || null,
      llamado_arrepentimiento: values.llamado_arrepentimiento || null,
      respuesta_aconsejado: values.respuesta_aconsejado || null,
      evidencias_crecimiento: values.evidencias_crecimiento || null,
      resumen_pastoral: values.resumen_pastoral || null,
      contenido: values.resumen_pastoral || null,
      observaciones_privadas: values.observaciones_privadas || null,
      evaluacion_progreso: values.evaluacion_progreso || null,
      proxima_sesion: values.proxima_sesion || null,
      proxima_sesion_hora: values.proxima_sesion_hora || null,
      temas_proxima_sesion: values.temas_proxima_sesion || null,
    };

    let savedId: string;

    if (isEdit && sesionId) {
      const { error: errUpdate } = await supabase
        .from("sesiones")
        .update(payloadBase)
        .eq("id", sesionId);
      if (errUpdate) {
        setSubmitError(errUpdate.message);
        return;
      }
      savedId = sesionId;

      // Reemplazar tareas asociadas
      const { error: errDel } = await supabase
        .from("tareas")
        .delete()
        .eq("sesion_id", sesionId);
      if (errDel) {
        setSubmitError(`Sesión actualizada, pero falló al limpiar tareas: ${errDel.message}`);
        return;
      }
    } else {
      const { count } = await supabase
        .from("sesiones")
        .select("*", { count: "exact", head: true })
        .eq("persona_id", values.persona_id);

      const { data: sesion, error: errSesion } = await supabase
        .from("sesiones")
        .insert({ ...payloadBase, numero_sesion: (count ?? 0) + 1, user_id: user.id })
        .select("id")
        .single();

      if (errSesion || !sesion) {
        setSubmitError(errSesion?.message ?? "No se pudo crear la sesión");
        return;
      }
      savedId = sesion.id;

      // Crear automáticamente la próxima sesión como "programada" si se indicó fecha
      if (values.proxima_sesion) {
        const proximaPayload = {
          persona_id: values.persona_id,
          fecha: values.proxima_sesion,
          hora_inicio: values.proxima_sesion_hora || null,
          numero_sesion: (count ?? 0) + 2,
          tipo_consejeria_id: values.tipo_consejeria_id || null,
          estado: "programada" as const,
          objetivo_principal: values.temas_proxima_sesion || null,
          objetivos_sesion: values.temas_proxima_sesion || null,
          user_id: user.id,
        };
        const { error: errProxima } = await supabase
          .from("sesiones")
          .insert(proximaPayload);
        if (errProxima) {
          setSubmitError(`Sesión guardada, pero no se pudo programar la próxima: ${errProxima.message}`);
          return;
        }
      }
    }

    // Insertar tareas asociadas
    if (values.tareas.length > 0) {
      const tareasPayload = values.tareas.map((t) => ({
        persona_id: values.persona_id,
        sesion_id: savedId,
        titulo: t.titulo,
        descripcion: t.descripcion || null,
        fecha_vencimiento: t.fecha_vencimiento || null,
        tipo: t.tipo,
        prioridad: t.prioridad,
        user_id: user.id,
      }));
      const { error: errTareas } = await supabase
        .from("tareas")
        .insert(tareasPayload);
      if (errTareas) {
        setSubmitError(`Sesión guardada, pero falló al guardar tareas: ${errTareas.message}`);
        return;
      }
    }

    if (!isEdit && typeof window !== "undefined") {
      window.localStorage.removeItem(AUTOSAVE_KEY);
    }
    router.push(`/sesiones/${savedId}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* ---------- SECCIÓN 1 ---------- */}
      <Section
        numero={1}
        titulo="Información de la sesión"
        descripcion="Datos básicos para registrar este encuentro."
        icono={<span aria-hidden>📅</span>}
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Persona *" error={errors.persona_id?.message}>
            <select className="input" {...register("persona_id")}>
              <option value="">Seleccionar persona...</option>
              {personas.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>
              ))}
            </select>
          </Field>

          <Field label="Tipo de consejería">
            <select className="input" {...register("tipo_consejeria_id")}>
              <option value="">Seleccionar...</option>
              {tipos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </Field>

          <Field label="Fecha *" error={errors.fecha?.message}>
            <input type="date" className="input" {...register("fecha")} />
          </Field>

          <Field label="Estado de la sesión">
            <select className="input" {...register("estado")}>
              {estadoOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>

          <Field label="Hora inicio">
            <input type="time" className="input" {...register("hora_inicio")} />
          </Field>

          <Field label="Hora fin" hint={duracion ? `Duración: ${duracion}` : undefined}>
            <input type="time" className="input" {...register("hora_fin")} />
          </Field>

          <Field label="Objetivo principal de esta sesión" full hint="¿Qué se buscaba trabajar hoy?">
            <input className="input" {...register("objetivo_principal")} placeholder="Ej: Identificar respuestas de temor y aplicar Filipenses 4:6-7" />
          </Field>
        </div>
      </Section>

      {/* ---------- SECCIÓN 2 ---------- */}
      <Section
        numero={2}
        titulo="Situación presentada"
        descripcion="¿Qué circunstancias, luchas o situaciones compartió la persona durante esta sesión?"
        icono={<span aria-hidden>💬</span>}
      >
        <Field label="Situación presentada">
          <Controller
            control={control}
            name="situacion_presentada"
            render={({ field }) => (
              <CountingTextarea rows={4} value={field.value ?? ""} onChange={field.onChange}
                placeholder="Cuéntanos cómo llegó, qué trajo hoy..." />
            )}
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Eventos importantes de la semana">
            <Controller control={control} name="eventos_semana"
              render={({ field }) => (
                <CountingTextarea rows={3} max={800} value={field.value ?? ""} onChange={field.onChange} />
              )}
            />
          </Field>
          <Field label="Conflictos actuales">
            <Controller control={control} name="conflictos_actuales"
              render={({ field }) => (
                <CountingTextarea rows={3} max={800} value={field.value ?? ""} onChange={field.onChange} />
              )}
            />
          </Field>
        </div>

        <Field label="Síntomas / emociones observadas (detalle)">
          <Controller control={control} name="sintomas_emociones"
            render={({ field }) => (
              <CountingTextarea rows={3} max={800} value={field.value ?? ""} onChange={field.onChange} />
            )}
          />
        </Field>

        <Field label="Emociones rápidas" hint="Marca lo que aplica.">
          <ChipsMulti opciones={emocionesOpciones} valores={emocionesActual} onToggle={toggleEmocion} />
        </Field>
      </Section>

      {/* ---------- SECCIÓN 3 ---------- */}
      <Section
        numero={3}
        titulo="Asuntos del corazón observados"
        descripcion="Identifica posibles deseos, temores, creencias, idolatrías o respuestas del corazón observadas durante la conversación."
        icono={<span aria-hidden>❤️</span>}
        tone="highlight"
      >
        <Field label="Marca los asuntos observados">
          <ChipsMulti opciones={asuntosCorazonOpciones} valores={asuntosActual} onToggle={toggleAsuntoCorazon} />
        </Field>
        <Field label="Observaciones del corazón">
          <Controller control={control} name="observaciones_corazon"
            render={({ field }) => (
              <CountingTextarea rows={4} value={field.value ?? ""} onChange={field.onChange}
                placeholder="¿Qué motivos del corazón crees que están en juego? ¿Qué está adorando, temiendo o buscando esta persona?" />
            )}
          />
        </Field>
      </Section>

      {/* ---------- SECCIÓN 4 ---------- */}
      <Section
        numero={4}
        titulo="Verdad bíblica aplicada"
        descripcion="¿Qué verdad bíblica se aplicó durante la sesión?"
        icono={<span aria-hidden>📖</span>}
      >
        <Field label="Principales versículos trabajados" hint="Sepáralos con comas.">
          <input className="input" {...register("versiculos")} placeholder="Ej: Filipenses 4:6-7, Salmo 23..." />
          <div className="flex flex-wrap gap-2 mt-2">
            {versiculosFrecuentes.map((v) => {
              const incluido = versiculosActual.split(/[,;]\s*/).map((s) => s.trim()).includes(v);
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => appendVersiculo(v)}
                  disabled={incluido}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    incluido
                      ? "border-amber-200 bg-amber-50 text-amber-500 cursor-default"
                      : "border-stone-200 text-stone-500 hover:border-amber-300 hover:text-amber-700"
                  }`}
                >
                  + {v}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Enseñanza bíblica compartida">
          <Controller control={control} name="ensenanza_biblica"
            render={({ field }) => (
              <CountingTextarea rows={3} value={field.value ?? ""} onChange={field.onChange}
                placeholder="Resume la enseñanza central que se le compartió." />
            )}
          />
        </Field>

        <Field label="Aplicación práctica del evangelio">
          <Controller control={control} name="aplicacion_evangelio"
            render={({ field }) => (
              <CountingTextarea rows={3} value={field.value ?? ""} onChange={field.onChange}
                placeholder="¿Cómo se conectó la cruz, la gracia o la obediencia a su situación?" />
            )}
          />
        </Field>

        <Field label="Llamado al arrepentimiento / fe (si aplica)">
          <Controller control={control} name="llamado_arrepentimiento"
            render={({ field }) => (
              <CountingTextarea rows={2} max={800} value={field.value ?? ""} onChange={field.onChange} />
            )}
          />
        </Field>
      </Section>

      {/* ---------- SECCIÓN 5 ---------- */}
      <Section
        numero={5}
        titulo="Respuesta del aconsejado"
        descripcion="¿Cómo respondió la persona a la verdad bíblica?"
        icono={<span aria-hidden>🌱</span>}
      >
        <Field label="Actitud predominante">
          <Controller
            control={control}
            name="respuesta_aconsejado"
            render={({ field }) => (
              <ChipsSingle
                opciones={respuestaOptions as unknown as { value: string; label: string }[]}
                valor={field.value ?? ""}
                onSelect={(v) => field.onChange(v)}
              />
            )}
          />
        </Field>
        <Field label="Evidencias de crecimiento o resistencia observadas">
          <Controller control={control} name="evidencias_crecimiento"
            render={({ field }) => (
              <CountingTextarea rows={3} value={field.value ?? ""} onChange={field.onChange} />
            )}
          />
        </Field>
      </Section>

      {/* ---------- SECCIÓN 6 ---------- */}
      <Section
        numero={6}
        titulo="Tareas asignadas"
        descripcion="El discipulado ocurre entre sesiones. Asigna pasos concretos para que la persona camine en obediencia."
        icono={<span aria-hidden>✅</span>}
        tone="highlight"
      >
        {fields.length === 0 && (
          <div className="text-sm text-stone-500 italic">Aún no has asignado tareas para esta sesión.</div>
        )}

        <div className="space-y-4">
          {fields.map((field, idx) => (
            <div key={field.id} className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                  Tarea {idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="text-xs text-stone-400 hover:text-red-600 transition-colors"
                >
                  Eliminar
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Tipo">
                  <select className="input" {...register(`tareas.${idx}.tipo` as const)}>
                    {tipoTareaOptions.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Prioridad">
                  <select className="input" {...register(`tareas.${idx}.prioridad` as const)}>
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                  </select>
                </Field>
                <Field label="Título *" error={errors.tareas?.[idx]?.titulo?.message} full>
                  <input className="input" {...register(`tareas.${idx}.titulo` as const)}
                    placeholder="Ej: Leer Filipenses 4 cada mañana esta semana" />
                </Field>
                <Field label="Descripción" full>
                  <textarea className="input resize-none" rows={2}
                    {...register(`tareas.${idx}.descripcion` as const)}
                    placeholder="Detalles, pasos o instrucciones..." />
                </Field>
                <Field label="Fecha de revisión">
                  <input type="date" className="input"
                    {...register(`tareas.${idx}.fecha_vencimiento` as const)} />
                </Field>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => append({ tipo: "lectura_biblica", titulo: "", descripcion: "", fecha_vencimiento: "", prioridad: "media" })}
          className="w-full sm:w-auto px-4 py-2.5 rounded-2xl border-2 border-dashed border-amber-300 text-amber-700 hover:bg-amber-50 text-sm font-medium transition-colors"
        >
          + Agregar tarea
        </button>
      </Section>

      {/* ---------- SECCIÓN 7 ---------- */}
      <Section
        numero={7}
        titulo="Resumen pastoral"
        descripcion="Resume brevemente qué crees que Dios estuvo trabajando principalmente en esta sesión."
        icono={<span aria-hidden>🙏</span>}
      >
        <Controller control={control} name="resumen_pastoral"
          render={({ field }) => (
            <CountingTextarea rows={6} max={3000} value={field.value ?? ""} onChange={field.onChange}
              placeholder="Una síntesis pastoral, no clínica: qué Dios mostró, dónde hubo gracia, qué falta seguir trabajando..." />
          )}
        />
      </Section>

      {/* ---------- SECCIÓN 8 ---------- */}
      <Section
        numero={8}
        titulo="Observaciones privadas"
        descripcion="Solo visible para el consejero."
        icono={<span aria-hidden>🔒</span>}
        tone="private"
      >
        <Controller control={control} name="observaciones_privadas"
          render={({ field }) => (
            <CountingTextarea rows={4} value={field.value ?? ""} onChange={field.onChange}
              placeholder="Patrones, hipótesis pastorales, alertas, peticiones de oración personales..." />
          )}
        />
      </Section>

      {/* ---------- SECCIÓN 9 ---------- */}
      <Section
        numero={9}
        titulo="Seguimiento"
        descripcion="¿Qué sigue para esta persona?"
        icono={<span aria-hidden>🗓️</span>}
      >
        <Field label="Evaluación de progreso">
          <Controller
            control={control}
            name="evaluacion_progreso"
            render={({ field }) => (
              <ChipsSingle
                opciones={progresoOptions as unknown as { value: string; label: string }[]}
                valor={field.value ?? ""}
                onSelect={(v) => field.onChange(v)}
              />
            )}
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Próxima sesión">
            <input type="date" className="input" {...register("proxima_sesion")} />
          </Field>
          <Field label="Hora próxima sesión">
            <input type="time" className="input" {...register("proxima_sesion_hora")} />
          </Field>
        </div>

        <Field label="Temas a trabajar en la siguiente sesión">
          <Controller control={control} name="temas_proxima_sesion"
            render={({ field }) => (
              <CountingTextarea rows={3} max={800} value={field.value ?? ""} onChange={field.onChange} />
            )}
          />
        </Field>

        {!proximaSesionFecha && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 text-amber-800 text-sm px-4 py-3">
            ⚠️ Aún no has programado la próxima sesión. Considera agendarla antes de cerrar.
          </div>
        )}
      </Section>

      {/* ---------- Acciones ---------- */}
      {submitError && (
        <p className="text-sm bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl">
          {submitError}
        </p>
      )}

      <div className="sticky bottom-0 z-10 bg-gradient-to-t from-stone-50 via-stone-50/95 to-transparent pt-6 pb-2">
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <Link
            href={isEdit && sesionId ? `/sesiones/${sesionId}` : "/sesiones"}
            className="sm:flex-none text-center px-5 py-3 rounded-2xl border border-stone-300 text-stone-600 hover:bg-white transition-colors font-medium"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="sm:flex-1 px-5 py-3 rounded-2xl bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-medium shadow-sm transition-colors"
          >
            {isSubmitting ? "Guardando..." : isEdit ? "Actualizar sesión" : "Guardar sesión"}
          </button>
        </div>
        {!isEdit && (
          <p className="text-[11px] text-stone-400 text-center mt-2">
            Borrador guardado automáticamente en este dispositivo.
          </p>
        )}
      </div>
    </form>
  );
}
