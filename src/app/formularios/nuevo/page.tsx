"use client";

import { Suspense, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type PersonaBasica = { id: string; nombre: string; apellido: string };
type Plantilla = { id: string; nombre: string; descripcion: string | null };
type Audiencia = "adulto" | "adolescente" | "nino" | "matrimonial";

const audiencias: { value: Audiencia; emoji: string; label: string; desc: string }[] = [
  { value: "adulto",      emoji: "🤍", label: "Adulto",              desc: "Reflexivo, pastoral, profundo." },
  { value: "adolescente", emoji: "💜", label: "Adolescente",         desc: "Moderno, cercano, fácil de responder." },
  { value: "nino",        emoji: "🌟", label: "Niño",                desc: "Visual, simple, divertido." },
  { value: "matrimonial", emoji: "💍", label: "Matrimonial / Familiar", desc: "Para responder en pareja, sin culpas." },
];

// Tipos disponibles por audiencia.
// Evaluación y seguimiento cambian según audiencia; consentimiento y tareas
// siguen siendo transversales y solo aparecen para adulto y matrimonial.
function tiposPorAudiencia(aud: Audiencia) {
  const evaluacion = {
    adulto:      { value: "evaluacion_inicial",      label: "Evaluación inicial",     desc: "Historia, situación actual y caminar espiritual." },
    adolescente: { value: "evaluacion_adolescente",  label: "Evaluación inicial",     desc: "Diseñada para adolescentes — moderna y cercana." },
    nino:        { value: "evaluacion_nino",         label: "Evaluación inicial",     desc: "Muy simple y visual, paso a paso." },
    matrimonial: { value: "evaluacion_matrimonial",  label: "Evaluación matrimonial", desc: "Para responder juntos, sin acusaciones." },
  }[aud];

  const seguimiento = {
    adulto:      { value: "seguimiento_semanal",       label: "Seguimiento semanal", desc: "Cómo fue la semana y petición de oración." },
    adolescente: { value: "seguimiento_adolescente",   label: "Seguimiento semanal", desc: "Rápido, con emojis y poco texto." },
    nino:        { value: "seguimiento_nino",          label: "Seguimiento semanal", desc: "Solo unas preguntitas, muy fácil." },
    matrimonial: { value: "seguimiento_matrimonial",   label: "Seguimiento semanal", desc: "Para responder juntos esta semana." },
  }[aud];

  const tipos = [evaluacion, seguimiento];
  if (aud === "adulto" || aud === "matrimonial") {
    tipos.unshift({ value: "consentimiento_informado", label: "Consentimiento informado", desc: "Autorización, confidencialidad y términos." });
    tipos.push({ value: "tareas_terapeuticas",        label: "Tareas terapéuticas",      desc: "Reporte sobre tareas asignadas." });
  }
  return tipos;
}

function NuevoFormularioForm() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [personas, setPersonas] = useState<PersonaBasica[]>([]);
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [link, setLink] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [modo, setModo] = useState<"estandar" | "personalizado">("estandar");
  const [audiencia, setAudiencia] = useState<Audiencia>("adulto");

  const [form, setForm] = useState({
    persona_id: searchParams.get("persona_id") ?? "",
    tipo: "evaluacion_inicial",
    plantilla_id: "",
    dias_expiracion: "7",
  });

  useEffect(() => {
    Promise.all([
      supabase.from("personas").select("id, nombre, apellido").eq("activo", true).order("nombre"),
      supabase.from("form_plantillas").select("id, nombre, descripcion").eq("activo", true).order("created_at", { ascending: false }),
    ]).then(([{ data: p }, { data: pl }]) => {
      setPersonas((p as PersonaBasica[] | null) ?? []);
      setPlantillas((pl as Plantilla[] | null) ?? []);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function cambiarAudiencia(a: Audiencia) {
    setAudiencia(a);
    const tipos = tiposPorAudiencia(a);
    setForm((p) => (tipos.some((t) => t.value === p.tipo) ? p : { ...p, tipo: tipos[0].value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const expira = new Date();
    expira.setDate(expira.getDate() + Number(form.dias_expiracion));

    const { data, error } = await supabase
      .from("formularios_tokens")
      .insert({
        persona_id: form.persona_id,
        tipo: modo === "personalizado" ? "personalizado" : form.tipo,
        plantilla_id: modo === "personalizado" ? form.plantilla_id : null,
        expira_at: expira.toISOString(),
        user_id: user.id,
      })
      .select("token")
      .single();

    setLoading(false);
    if (!error && data) setLink(`${window.location.origin}/f/${data.token}`);
  }

  function copiarLink() {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  if (link) {
    return (
      <div className="bg-white border border-stone-200 rounded-xl p-8 text-center space-y-5">
        <div className="text-4xl">🔗</div>
        <div>
          <h2 className="text-lg font-semibold text-stone-800 mb-1">¡Link generado!</h2>
          <p className="text-sm text-stone-500">Copia este link y envíaselo al aconsejado por WhatsApp o correo.</p>
        </div>
        <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-sm text-stone-700 font-mono break-all">{link}</div>
        <div className="flex gap-3 justify-center">
          <button onClick={copiarLink} className="bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
            {copiado ? "✓ Copiado" : "Copiar link"}
          </button>
          <Link href="/formularios" className="bg-white border border-stone-300 text-stone-600 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
            Ver formularios
          </Link>
        </div>
        <p className="text-xs text-stone-400">Este link expirará en {form.dias_expiracion} días y solo puede usarse una vez.</p>
      </div>
    );
  }

  const tiposActuales = tiposPorAudiencia(audiencia);
  const puedeEnviar = form.persona_id && (modo === "estandar" || (modo === "personalizado" && form.plantilla_id));

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Persona */}
      <div className="bg-white border border-stone-200 rounded-xl p-5">
        <label className="label">Aconsejado *</label>
        <select
          value={form.persona_id}
          onChange={(e) => setForm((p) => ({ ...p, persona_id: e.target.value }))}
          required
          className="input"
        >
          <option value="">Seleccionar persona...</option>
          {personas.map((p) => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
        </select>
      </div>

      {/* Tipo: estándar o personalizado */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-4">
        <div>
          <label className="label">Tipo de formulario</label>
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={() => setModo("estandar")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg border-2 transition-all ${modo === "estandar" ? "border-amber-500 bg-amber-50 text-amber-700" : "border-stone-200 text-stone-500 hover:border-stone-300"}`}
            >
              Formularios estándar
            </button>
            <button
              type="button"
              onClick={() => setModo("personalizado")}
              disabled={plantillas.length === 0}
              className={`flex-1 py-2 text-sm font-medium rounded-lg border-2 transition-all disabled:opacity-40 ${modo === "personalizado" ? "border-amber-500 bg-amber-50 text-amber-700" : "border-stone-200 text-stone-500 hover:border-stone-300"}`}
            >
              Mis plantillas {plantillas.length === 0 && "(ninguna aún)"}
            </button>
          </div>
        </div>

        {modo === "estandar" && (
          <>
            <div>
              <label className="label">¿Para quién es este formulario?</label>
              <p className="text-xs text-stone-400 mb-3">
                Cada etapa de vida tiene preguntas, lenguaje y experiencia diferentes.
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {audiencias.map((a) => (
                  <button
                    key={a.value}
                    type="button"
                    onClick={() => cambiarAudiencia(a.value)}
                    className={`text-left p-3 rounded-xl border-2 transition-all ${audiencia === a.value ? "border-amber-500 bg-amber-50" : "border-stone-200 hover:border-stone-300"}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{a.emoji}</span>
                      <p className="text-sm font-medium text-stone-800">{a.label}</p>
                    </div>
                    <p className="text-xs text-stone-400 mt-1">{a.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100">
              <label className="label">Tipo</label>
              <div className="grid grid-cols-1 gap-2 mt-1">
                {tiposActuales.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, tipo: t.value }))}
                    className={`text-left p-3.5 rounded-xl border-2 transition-all ${form.tipo === t.value ? "border-amber-500 bg-amber-50" : "border-stone-200 hover:border-stone-300"}`}
                  >
                    <p className="text-sm font-medium text-stone-800">{t.label}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {modo === "personalizado" && (
          <div className="space-y-2">
            {plantillas.map((pl) => (
              <button
                key={pl.id}
                type="button"
                onClick={() => setForm((p) => ({ ...p, plantilla_id: pl.id }))}
                className={`w-full text-left p-3.5 rounded-xl border-2 transition-all ${form.plantilla_id === pl.id ? "border-amber-500 bg-amber-50" : "border-stone-200 hover:border-stone-300"}`}
              >
                <p className="text-sm font-medium text-stone-800">{pl.nombre}</p>
                {pl.descripcion && <p className="text-xs text-stone-400 mt-0.5">{pl.descripcion}</p>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Expiración */}
      <div className="bg-white border border-stone-200 rounded-xl p-5">
        <label className="label">El link expira en</label>
        <select
          value={form.dias_expiracion}
          onChange={(e) => setForm((p) => ({ ...p, dias_expiracion: e.target.value }))}
          className="input"
        >
          <option value="3">3 días</option>
          <option value="7">7 días</option>
          <option value="14">14 días</option>
          <option value="30">30 días</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading || !puedeEnviar}
        className="w-full bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
      >
        {loading ? "Generando..." : "Generar link para el aconsejado"}
      </button>
    </form>
  );
}

export default function NuevoFormularioPage() {
  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-center gap-3">
          <Link href="/formularios" className="text-stone-400 hover:text-stone-600 text-sm">← Formularios</Link>
          <span className="text-stone-300">/</span>
          <h1 className="text-xl font-semibold text-stone-800">Enviar formulario</h1>
        </div>
        <Link href="/configuracion/formularios" className="text-sm text-amber-700 hover:text-amber-800 font-medium">
          Mis plantillas →
        </Link>
      </div>
      <Suspense fallback={<div className="text-stone-400 text-sm">Cargando...</div>}>
        <NuevoFormularioForm />
      </Suspense>
    </div>
  );
}
