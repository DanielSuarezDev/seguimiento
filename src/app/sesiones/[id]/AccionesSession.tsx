"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AccionesSession({
  sesionId, estado, personaId,
}: {
  sesionId: string;
  estado: string;
  personaId?: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function cambiarEstado(nuevoEstado: "en_proceso" | "completada" | "cancelada" | "reprogramada") {
    setLoading(true);
    await supabase.from("sesiones").update({ estado: nuevoEstado }).eq("id", sesionId);
    router.refresh();
    setLoading(false);
  }

  const programada = estado === "pendiente" || estado === "programada";

  return (
    <div className="flex flex-wrap gap-2">
      {programada && (
        <button
          onClick={() => cambiarEstado("en_proceso")}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          ▶ Iniciar
        </button>
      )}
      {(programada || estado === "en_proceso") && (
        <button
          onClick={() => cambiarEstado("completada")}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          ✓ Marcar completada
        </button>
      )}
      <Link
        href={`/sesiones/${sesionId}/editar`}
        className="bg-white border border-stone-300 hover:border-stone-400 text-stone-600 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        Editar
      </Link>
    </div>
  );
}
