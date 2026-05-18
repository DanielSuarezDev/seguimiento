import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import AccionesSession from "./AccionesSession";

const estadoLabel: Record<string, string> = {
  pendiente: "Programada",
  programada: "Programada",
  en_proceso: "En proceso",
  completada: "Completada",
  cancelada: "Cancelada",
  reprogramada: "Reprogramada",
};

const estadoColor: Record<string, string> = {
  pendiente: "bg-amber-50 text-amber-700",
  programada: "bg-amber-50 text-amber-700",
  en_proceso: "bg-blue-50 text-blue-700",
  completada: "bg-green-50 text-green-700",
  cancelada: "bg-red-50 text-red-600",
  reprogramada: "bg-stone-100 text-stone-600",
};

const progresoLabel: Record<string, string> = {
  estancado: "Estancado",
  lucha_constante: "Lucha constante",
  mostrando_apertura: "Mostrando apertura",
  evidencia_crecimiento: "Evidencia de crecimiento",
  arrepentimiento_evidente: "Arrepentimiento evidente",
  caminando_consistentemente: "Caminando consistentemente",
};

const respuestaLabel: Record<string, string> = {
  receptivo: "Receptivo", humilde: "Humilde", defensivo: "Defensivo",
  confundido: "Confundido", quebrantado: "Quebrantado", esperanzado: "Esperanzado",
  arrepentido: "Arrepentido", indiferente: "Indiferente", resistente: "Resistente",
};

const tipoTareaLabel: Record<string, string> = {
  lectura_biblica: "Lectura bíblica", devocional: "Devocional", oracion: "Oración",
  memorizacion: "Memorización", diario_reflexion: "Diario / reflexión",
  perdon_reconciliacion: "Perdón / reconciliación", comunicacion: "Comunicación",
  servicio: "Servicio", accion_practica: "Acción práctica", ayuno: "Ayuno", otro: "Otro",
};

function duracionTexto(inicio: string | null, fin: string | null) {
  if (!inicio || !fin) return null;
  const [hi, mi] = inicio.split(":").map(Number);
  const [hf, mf] = fin.split(":").map(Number);
  let total = hf * 60 + mf - (hi * 60 + mi);
  if (total <= 0) return null;
  const h = Math.floor(total / 60), m = total % 60;
  return h > 0 ? `${h} h ${m ? `${m} min` : ""}`.trim() : `${m} min`;
}

export default async function SesionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  type SesionFull = {
    id: string; numero_sesion: number; fecha: string;
    hora_inicio: string | null; hora_fin: string | null;
    estado: string;
    tipo_consejeria_id: string | null;
    objetivo_principal: string | null; objetivos_sesion: string | null;
    situacion_presentada: string | null; motivo_consulta: string | null;
    eventos_semana: string | null; conflictos_actuales: string | null;
    sintomas_emociones: string | null;
    emociones_observadas: string[] | null; asuntos_corazon: string[] | null;
    observaciones_corazon: string | null;
    versiculos: string | null; ensenanza_biblica: string | null;
    aplicacion_evangelio: string | null; llamado_arrepentimiento: string | null;
    respuesta_aconsejado: string | null; evidencias_crecimiento: string | null;
    resumen_pastoral: string | null; contenido: string | null;
    observaciones_privadas: string | null;
    evaluacion_progreso: string | null;
    proxima_sesion: string | null; proxima_sesion_hora: string | null;
    temas_proxima_sesion: string | null;
    personas: { id: string; nombre: string; apellido: string } | null;
    tipos_consejeria: { nombre: string } | null;
  };

  type TareaItem = {
    id: string; titulo: string; descripcion: string | null;
    tipo: string | null; prioridad: string | null;
    fecha_vencimiento: string | null; estado: string;
  };

  const [{ data: rawSesion }, { data: rawTareas }] = await Promise.all([
    supabase.from("sesiones")
      .select("*, personas(id, nombre, apellido), tipos_consejeria(nombre)")
      .eq("id", id).single(),
    supabase.from("tareas")
      .select("id, titulo, descripcion, tipo, prioridad, fecha_vencimiento, estado")
      .eq("sesion_id", id)
      .order("created_at"),
  ]);

  const sesion = rawSesion as SesionFull | null;
  if (!sesion) notFound();

  const persona = sesion.personas;
  const tipo = sesion.tipos_consejeria;
  const tareas = (rawTareas as TareaItem[] | null) ?? [];
  const duracion = duracionTexto(sesion.hora_inicio, sesion.hora_fin);

  const objetivo = sesion.objetivo_principal ?? sesion.objetivos_sesion;
  const situacion = sesion.situacion_presentada ?? sesion.motivo_consulta;
  const resumen = sesion.resumen_pastoral ?? sesion.contenido;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <Link href={persona ? `/personas/${persona.id}` : "/sesiones"} className="text-stone-400 hover:text-stone-600 text-sm">
            ← {persona ? `${persona.nombre} ${persona.apellido}` : "Sesiones"}
          </Link>
          <h1 className="text-3xl font-semibold text-stone-800 mt-2">Sesión #{sesion.numero_sesion}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${estadoColor[sesion.estado]}`}>
              {estadoLabel[sesion.estado] ?? sesion.estado}
            </span>
            {tipo && <span className="text-xs text-stone-400">{tipo.nombre}</span>}
            {sesion.evaluacion_progreso && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                {progresoLabel[sesion.evaluacion_progreso] ?? sesion.evaluacion_progreso}
              </span>
            )}
          </div>
        </div>
        <AccionesSession sesionId={id} estado={sesion.estado} personaId={persona?.id} />
      </div>

      <div className="space-y-5">
        {/* Meta */}
        <Card titulo="Información">
          <div className="grid sm:grid-cols-3 gap-5 text-sm">
            <Meta etiqueta="Fecha" valor={new Date(sesion.fecha + "T00:00:00").toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} />
            {(sesion.hora_inicio || sesion.hora_fin) && (
              <Meta etiqueta="Horario" valor={`${sesion.hora_inicio?.slice(0,5) ?? "—"}${sesion.hora_fin ? ` → ${sesion.hora_fin.slice(0,5)}` : ""}`} />
            )}
            {duracion && <Meta etiqueta="Duración" valor={duracion} />}
          </div>
        </Card>

        {objetivo && <Card titulo="Objetivo principal"><Texto>{objetivo}</Texto></Card>}

        {(situacion || sesion.eventos_semana || sesion.conflictos_actuales || sesion.sintomas_emociones || (sesion.emociones_observadas?.length ?? 0) > 0) && (
          <Card titulo="Situación presentada">
            {situacion && <Bloque etiqueta="Situación"><Texto>{situacion}</Texto></Bloque>}
            {sesion.eventos_semana && <Bloque etiqueta="Eventos de la semana"><Texto>{sesion.eventos_semana}</Texto></Bloque>}
            {sesion.conflictos_actuales && <Bloque etiqueta="Conflictos actuales"><Texto>{sesion.conflictos_actuales}</Texto></Bloque>}
            {sesion.sintomas_emociones && <Bloque etiqueta="Síntomas / emociones"><Texto>{sesion.sintomas_emociones}</Texto></Bloque>}
            {(sesion.emociones_observadas?.length ?? 0) > 0 && (
              <Bloque etiqueta="Emociones marcadas"><Chips items={sesion.emociones_observadas ?? []} /></Bloque>
            )}
          </Card>
        )}

        {((sesion.asuntos_corazon?.length ?? 0) > 0 || sesion.observaciones_corazon) && (
          <Card titulo="Asuntos del corazón" tone="highlight">
            {(sesion.asuntos_corazon?.length ?? 0) > 0 && (
              <Bloque etiqueta="Observados"><Chips items={sesion.asuntos_corazon ?? []} /></Bloque>
            )}
            {sesion.observaciones_corazon && <Bloque etiqueta="Observaciones"><Texto>{sesion.observaciones_corazon}</Texto></Bloque>}
          </Card>
        )}

        {(sesion.versiculos || sesion.ensenanza_biblica || sesion.aplicacion_evangelio || sesion.llamado_arrepentimiento) && (
          <Card titulo="Verdad bíblica aplicada">
            {sesion.versiculos && <Bloque etiqueta="📖 Versículos"><Texto>{sesion.versiculos}</Texto></Bloque>}
            {sesion.ensenanza_biblica && <Bloque etiqueta="Enseñanza"><Texto>{sesion.ensenanza_biblica}</Texto></Bloque>}
            {sesion.aplicacion_evangelio && <Bloque etiqueta="Aplicación del evangelio"><Texto>{sesion.aplicacion_evangelio}</Texto></Bloque>}
            {sesion.llamado_arrepentimiento && <Bloque etiqueta="Llamado al arrepentimiento / fe"><Texto>{sesion.llamado_arrepentimiento}</Texto></Bloque>}
          </Card>
        )}

        {(sesion.respuesta_aconsejado || sesion.evidencias_crecimiento) && (
          <Card titulo="Respuesta del aconsejado">
            {sesion.respuesta_aconsejado && (
              <Bloque etiqueta="Actitud predominante">
                <span className="text-sm text-stone-700 font-medium">
                  {respuestaLabel[sesion.respuesta_aconsejado] ?? sesion.respuesta_aconsejado}
                </span>
              </Bloque>
            )}
            {sesion.evidencias_crecimiento && <Bloque etiqueta="Evidencias"><Texto>{sesion.evidencias_crecimiento}</Texto></Bloque>}
          </Card>
        )}

        {tareas.length > 0 && (
          <Card titulo="Tareas asignadas" tone="highlight">
            <ul className="space-y-3">
              {tareas.map((t) => (
                <li key={t.id} className="rounded-xl border border-stone-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-stone-800">{t.titulo}</p>
                      {t.descripcion && <p className="text-xs text-stone-500 mt-1 whitespace-pre-line">{t.descripcion}</p>}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {t.tipo && <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">{tipoTareaLabel[t.tipo] ?? t.tipo}</span>}
                        {t.prioridad && <span className={`text-xs px-2 py-0.5 rounded-full ${t.prioridad === "alta" ? "bg-red-50 text-red-600" : t.prioridad === "media" ? "bg-amber-50 text-amber-700" : "bg-stone-100 text-stone-500"}`}>Prioridad {t.prioridad}</span>}
                        {t.fecha_vencimiento && <span className="text-xs text-stone-400">Revisar el {new Date(t.fecha_vencimiento + "T00:00:00").toLocaleDateString("es", { day: "numeric", month: "short" })}</span>}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${t.estado === "completada" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>{t.estado}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {resumen && <Card titulo="🙏 Resumen pastoral"><Texto>{resumen}</Texto></Card>}

        {sesion.observaciones_privadas && (
          <Card titulo="🔒 Observaciones privadas" tone="private">
            <p className="text-xs text-stone-400 mb-2">Solo visible para el consejero.</p>
            <Texto>{sesion.observaciones_privadas}</Texto>
          </Card>
        )}

        {(sesion.proxima_sesion || sesion.temas_proxima_sesion) && (
          <Card titulo="Próxima sesión">
            {sesion.proxima_sesion && (
              <p className="text-stone-700 text-sm font-medium">
                {new Date(sesion.proxima_sesion + "T00:00:00").toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" })}
                {sesion.proxima_sesion_hora ? ` · ${sesion.proxima_sesion_hora.slice(0,5)}` : ""}
              </p>
            )}
            {sesion.temas_proxima_sesion && <Bloque etiqueta="Temas a trabajar"><Texto>{sesion.temas_proxima_sesion}</Texto></Bloque>}
          </Card>
        )}
      </div>
    </div>
  );
}

/* ---------- subcomponentes ---------- */

function Card({ titulo, tone = "default", children }: { titulo: string; tone?: "default" | "private" | "highlight"; children: React.ReactNode }) {
  const bg =
    tone === "private" ? "bg-stone-50 border-stone-300 border-dashed"
    : tone === "highlight" ? "bg-amber-50/40 border-amber-200"
    : "bg-white border-stone-200";
  return (
    <section className={`rounded-2xl border ${bg} p-6 space-y-3`}>
      <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide">{titulo}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Bloque({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-stone-400 mb-1">{etiqueta}</p>
      {children}
    </div>
  );
}

function Texto({ children }: { children: React.ReactNode }) {
  return <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-line">{children}</p>;
}

function Meta({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <span className="text-stone-400 text-xs block">{etiqueta}</span>
      <span className="text-stone-700 font-medium">{valor}</span>
    </div>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((i) => (
        <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">{i}</span>
      ))}
    </div>
  );
}
