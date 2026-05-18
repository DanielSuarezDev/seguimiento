import { Suspense } from "react";
import Link from "next/link";
import SesionForm from "./SesionForm";

export default function NuevaSesionPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <Link href="/sesiones" className="text-sm text-stone-400 hover:text-stone-600">
          ← Sesiones
        </Link>
        <h1 className="text-3xl font-semibold text-stone-800 mt-2">Nueva sesión</h1>
        <p className="text-stone-500 text-sm sm:text-base mt-1 max-w-xl leading-relaxed">
          Una herramienta de discipulado para registrar lo que Dios trabajó hoy y cómo seguir caminando con esta persona.
        </p>
      </div>

      <Suspense fallback={<div className="text-stone-400 text-sm">Cargando…</div>}>
        <SesionForm />
      </Suspense>
    </div>
  );
}
