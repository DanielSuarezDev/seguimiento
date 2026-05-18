"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Estado = "pendiente" | "en_progreso" | "completada" | "omitida";

export default function AccionesTarea({ tareaId, estadoActual }: { tareaId: string; estadoActual: Estado }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function toggleCompletada() {
    setLoading(true);
    const nuevoEstado: Estado = estadoActual === "completada" ? "pendiente" : "completada";
    await supabase.from("tareas").update({ estado: nuevoEstado }).eq("id", tareaId);
    router.refresh();
    setLoading(false);
  }

  const completada = estadoActual === "completada";
  return (
    <button
      onClick={toggleCompletada}
      disabled={loading}
      className={`w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
        completada ? "bg-green-500 border-green-500" : "border-stone-300 hover:border-green-400"
      }`}
    >
      {completada && <span className="text-white text-xs">✓</span>}
    </button>
  );
}
