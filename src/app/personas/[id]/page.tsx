import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import TabInfo from "./tabs/TabInfo";
import TabSesiones from "./tabs/TabSesiones";
import TabTareas from "./tabs/TabTareas";
import TabFormularios from "./tabs/TabFormularios";

type Tab = "info" | "sesiones" | "tareas" | "formularios";

export default async function PersonaDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; estado?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const tab: Tab = (["info", "sesiones", "tareas", "formularios"] as const).includes(sp.tab as Tab)
    ? (sp.tab as Tab)
    : "info";

  const supabase = await createClient();

  type PersonaRow = {
    id: string; nombre: string; apellido: string; telefono: string | null; email: string | null;
    fecha_nacimiento: string | null; estado_civil: string | null; ocupacion: string | null;
    iglesia: string | null; motivo_inicial: string | null; notas_generales: string | null;
    activo: boolean; tipos_consejeria: { nombre: string; color: string } | null;
  };

  // Datos comunes: persona + conteos para los tabs
  const [
    { data: rawPersona },
    { count: countSesiones },
    { count: countTareas },
    { count: countFormularios },
    { count: countSesionesCompletadas },
  ] = await Promise.all([
    supabase.from("personas").select("*, tipos_consejeria(nombre, color)").eq("id", id).single(),
    supabase.from("sesiones").select("*", { count: "exact", head: true }).eq("persona_id", id),
    supabase.from("tareas").select("*", { count: "exact", head: true }).eq("persona_id", id).in("estado", ["pendiente", "en_progreso"]),
    supabase.from("formularios_tokens").select("*", { count: "exact", head: true }).eq("persona_id", id),
    supabase.from("sesiones").select("*", { count: "exact", head: true }).eq("persona_id", id).eq("estado", "completada"),
  ]);

  const persona = rawPersona as PersonaRow | null;
  if (!persona) notFound();

  const tipo = persona.tipos_consejeria;

  const tabs: { id: Tab; label: string; count: number | null }[] = [
    { id: "info", label: "Información", count: null },
    { id: "sesiones", label: "Sesiones", count: countSesiones ?? 0 },
    { id: "tareas", label: "Tareas", count: countTareas ?? 0 },
    { id: "formularios", label: "Formularios", count: countFormularios ?? 0 },
  ];

  return (
    <div className="max-w-5xl">
      {/* Header con datos básicos */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center text-xl font-bold text-amber-800">
            {persona.nombre[0]}{persona.apellido[0]}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Link href="/personas" className="text-stone-400 hover:text-stone-600 text-xs">← Personas</Link>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-stone-800">{persona.nombre} {persona.apellido}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full ${persona.activo ? "bg-green-50 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                {persona.activo ? "Activo" : "Inactivo"}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              {tipo && <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">{tipo.nombre}</span>}
              {persona.iglesia && <span className="text-sm text-stone-400">{persona.iglesia}</span>}
              <span className="text-xs text-stone-400">{countSesionesCompletadas ?? 0} sesión(es) completada(s)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs nav */}
      <div className="border-b border-stone-200 mb-6">
        <nav className="flex gap-1">
          {tabs.map((t) => (
            <Link
              key={t.id}
              href={t.id === "info" ? `/personas/${id}` : `/personas/${id}?tab=${t.id}`}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t.id
                  ? "border-amber-600 text-amber-700"
                  : "border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-200"
              }`}
            >
              {t.label}
              {t.count !== null && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  tab === t.id ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-500"
                }`}>
                  {t.count}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {tab === "info" && <TabInfo persona={persona} id={id} />}
      {tab === "sesiones" && <TabSesiones personaId={id} estadoFiltro={sp.estado} />}
      {tab === "tareas" && <TabTareas personaId={id} />}
      {tab === "formularios" && <TabFormularios personaId={id} nombrePersona={`${persona.nombre} ${persona.apellido}`} />}
    </div>
  );
}
