import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const emocionEmoji: Record<string, string> = {
  Ansiedad: "😟", Paz: "🕊️", Gratitud: "🤍", Temor: "😨", Gozo: "😊",
  Desánimo: "😞", Esperanza: "✨", Frustración: "😤", Soledad: "🥀", Cansancio: "😮‍💨",
};

const semanaLabel: Record<number, { label: string; emoji: string; color: string }> = {
  1: { label: "Muy difícil", emoji: "🌧️", color: "text-rose-600" },
  2: { label: "Difícil", emoji: "☁️", color: "text-amber-700" },
  3: { label: "Estable", emoji: "🌤️", color: "text-stone-600" },
  4: { label: "Buena", emoji: "☀️", color: "text-emerald-600" },
  5: { label: "Muy alentadora", emoji: "🌈", color: "text-emerald-700" },
};

const progresoLabel: Record<string, string> = {
  estancado: "Estancado",
  lucha_constante: "Lucha constante",
  mostrando_apertura: "Mostrando apertura",
  evidencia_crecimiento: "Evidencia de crecimiento",
  arrepentimiento_evidente: "Arrepentimiento evidente",
  caminando_consistentemente: "Caminando consistentemente",
};

const progresoEmoji: Record<string, string> = {
  estancado: "🪨",
  lucha_constante: "⛰️",
  mostrando_apertura: "🌱",
  evidencia_crecimiento: "🌿",
  arrepentimiento_evidente: "🙏",
  caminando_consistentemente: "🌳",
};

type PersonaProps = {
  telefono: string | null; email: string | null; estado_civil: string | null;
  ocupacion: string | null; fecha_nacimiento: string | null; iglesia: string | null;
  motivo_inicial: string | null; notas_generales: string | null;
};

type SeguimientoRespuesta = {
  como_estuvo_semana?: number;
  emociones_presentes?: string[];
};

type SesionRow = {
  fecha: string;
  evaluacion_progreso: string | null;
};

type RespuestaRow = {
  created_at: string;
  respuestas: Record<string, unknown>;
};

export default async function TabInfo({
  persona, id,
}: { persona: PersonaProps; id: string }) {
  const supabase = await createClient();

  const [
    { data: rawSeguimientos },
    { data: rawUltimaSesion },
    { count: countTareasPendientes },
  ] = await Promise.all([
    supabase
      .from("formularios_respuestas")
      .select("created_at, respuestas")
      .eq("persona_id", id)
      .eq("tipo", "seguimiento_semanal")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("sesiones")
      .select("fecha, evaluacion_progreso")
      .eq("persona_id", id)
      .eq("estado", "completada")
      .not("evaluacion_progreso", "is", null)
      .order("fecha", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("tareas")
      .select("*", { count: "exact", head: true })
      .eq("persona_id", id)
      .in("estado", ["pendiente", "en_progreso"]),
  ]);

  const seguimientos = (rawSeguimientos as RespuestaRow[] | null) ?? [];
  const ultimaSesion = rawUltimaSesion as SesionRow | null;

  // --- Agregaciones sobre los seguimientos ---
  const conteoEmociones = new Map<string, number>();
  let sumaSemana = 0, totalSemana = 0;
  const ultimosRatings: number[] = [];

  for (const s of seguimientos) {
    const r = s.respuestas as SeguimientoRespuesta;
    if (typeof r.como_estuvo_semana === "number") {
      sumaSemana += r.como_estuvo_semana;
      totalSemana += 1;
      ultimosRatings.push(r.como_estuvo_semana);
    }
    if (Array.isArray(r.emociones_presentes)) {
      for (const e of r.emociones_presentes) {
        conteoEmociones.set(e, (conteoEmociones.get(e) ?? 0) + 1);
      }
    }
  }

  const promedioSemana = totalSemana > 0 ? sumaSemana / totalSemana : null;
  const promedioRedondeado = promedioSemana ? Math.round(promedioSemana) : null;
  const emocionesTop = [...conteoEmociones.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const emocionDominante = emocionesTop[0];

  const ultimoSeguimientoFecha = seguimientos[0]?.created_at;
  const hayOverview = seguimientos.length > 0 || ultimaSesion;

  return (
    <div className="space-y-5">
      {/* ----- Overview pastoral ----- */}
      {hayOverview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Estado de ánimo dominante */}
          <KpiCard
            label="Emoción más presente"
            empty={!emocionDominante}
            emptyText="Sin seguimientos aún"
          >
            {emocionDominante && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{emocionEmoji[emocionDominante[0]] ?? "🤍"}</span>
                  <span className="text-base font-semibold text-stone-800">{emocionDominante[0]}</span>
                </div>
                <p className="text-xs text-stone-400 mt-1">
                  En {emocionDominante[1]} de los últimos {seguimientos.length} seguimientos
                </p>
              </>
            )}
          </KpiCard>

          {/* Tendencia semanal */}
          <KpiCard
            label="Cómo se ha sentido"
            empty={!promedioRedondeado}
            emptyText="Sin datos de semanas"
          >
            {promedioRedondeado && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{semanaLabel[promedioRedondeado].emoji}</span>
                  <span className={`text-base font-semibold ${semanaLabel[promedioRedondeado].color}`}>
                    {semanaLabel[promedioRedondeado].label}
                  </span>
                </div>
                <div className="flex items-end gap-1 mt-2 h-6">
                  {ultimosRatings.slice().reverse().map((r, i) => (
                    <div
                      key={i}
                      className="w-2 rounded-sm bg-gradient-to-t from-amber-200 to-amber-500"
                      style={{ height: `${(r / 5) * 100}%`, minHeight: "4px" }}
                      title={`${semanaLabel[r]?.label ?? r}`}
                    />
                  ))}
                </div>
              </>
            )}
          </KpiCard>

          {/* Último progreso pastoral */}
          <KpiCard
            label="Último progreso registrado"
            empty={!ultimaSesion?.evaluacion_progreso}
            emptyText="Aún sin evaluación"
          >
            {ultimaSesion?.evaluacion_progreso && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{progresoEmoji[ultimaSesion.evaluacion_progreso] ?? "🌱"}</span>
                  <span className="text-sm font-semibold text-stone-800 leading-tight">
                    {progresoLabel[ultimaSesion.evaluacion_progreso] ?? ultimaSesion.evaluacion_progreso}
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-1">
                  Sesión del {new Date(ultimaSesion.fecha + "T00:00:00").toLocaleDateString("es", { day: "numeric", month: "short" })}
                </p>
              </>
            )}
          </KpiCard>

          {/* Resumen general */}
          <KpiCard label="Resumen">
            <div className="space-y-1.5">
              <Counter value={seguimientos.length} label="seguimientos enviados" />
              <Counter value={countTareasPendientes ?? 0} label="tareas pendientes" tone={countTareasPendientes ? "warn" : "default"} />
              {ultimoSeguimientoFecha && (
                <p className="text-[11px] text-stone-400 pt-1">
                  Último: {new Date(ultimoSeguimientoFecha).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              )}
            </div>
          </KpiCard>
        </div>
      )}

      {/* Top emociones */}
      {emocionesTop.length > 1 && (
        <div className="bg-white border border-stone-200 rounded-2xl p-5">
          <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">
            Emociones presentes en sus últimos seguimientos
          </h3>
          <div className="flex flex-wrap gap-2">
            {emocionesTop.map(([e, n]) => (
              <span key={e} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-50 border border-stone-200 text-sm text-stone-700">
                <span>{emocionEmoji[e] ?? "🤍"}</span>
                <span>{e}</span>
                <span className="text-xs text-stone-400">×{n}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ----- Información personal ----- */}
      <section className="bg-white border border-stone-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-stone-800">Información personal</h2>
          <Link href={`/personas/${id}/editar`} className="text-sm text-amber-700 hover:text-amber-800 font-medium">
            Editar →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
          <Item icono="📞" label="Teléfono" value={persona.telefono} />
          <Item icono="✉️" label="Correo" value={persona.email} />
          <Item icono="💍" label="Estado civil" value={persona.estado_civil ? persona.estado_civil.replace("_", " ") : null} capitalize />
          <Item icono="💼" label="Ocupación" value={persona.ocupacion} />
          <Item icono="🎂" label="Fecha de nacimiento" value={persona.fecha_nacimiento ? new Date(persona.fecha_nacimiento + "T00:00:00").toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" }) : null} />
          <Item icono="⛪" label="Iglesia" value={persona.iglesia} />
        </div>

        {!persona.telefono && !persona.email && !persona.estado_civil && !persona.ocupacion && !persona.fecha_nacimiento && !persona.iglesia && (
          <p className="text-sm text-stone-400 italic mt-2">
            Sin datos básicos aún. Los campos se llenan automáticamente cuando la persona responde la evaluación inicial.
          </p>
        )}
      </section>

      {persona.motivo_inicial && (
        <section className="bg-white border border-stone-200 rounded-2xl p-6">
          <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Motivo inicial</h3>
          <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">{persona.motivo_inicial}</p>
        </section>
      )}

      {persona.notas_generales && (
        <section className="bg-amber-50/40 border border-amber-200 rounded-2xl p-6">
          <h3 className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">📝 Notas generales</h3>
          <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">{persona.notas_generales}</p>
        </section>
      )}
    </div>
  );
}

/* ---------- subcomponentes ---------- */

function KpiCard({
  label, children, empty, emptyText,
}: { label: string; children?: React.ReactNode; empty?: boolean; emptyText?: string }) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
      <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide mb-2">
        {label}
      </p>
      {empty ? (
        <p className="text-sm text-stone-400 italic">{emptyText ?? "—"}</p>
      ) : (
        children
      )}
    </div>
  );
}

function Counter({ value, label, tone = "default" }: { value: number; label: string; tone?: "default" | "warn" }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className={`text-lg font-semibold ${tone === "warn" ? "text-amber-700" : "text-stone-800"}`}>
        {value}
      </span>
      <span className="text-xs text-stone-500">{label}</span>
    </div>
  );
}

function Item({
  icono, label, value, capitalize,
}: { icono: string; label: string; value: string | null; capitalize?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <span className="text-base shrink-0 mt-0.5" aria-hidden>{icono}</span>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-stone-400 mb-0.5">{label}</p>
        <p className={`text-sm text-stone-700 break-words ${capitalize ? "capitalize" : ""}`}>{value}</p>
      </div>
    </div>
  );
}
