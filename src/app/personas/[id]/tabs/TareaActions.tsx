"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function TareaActions({ tareaId, estado }: { tareaId: string; estado: string }) {
  const supabase = createClient();
  const router = useRouter();

  async function toggle() {
    const nuevoEstado = estado === "completada" ? "pendiente" : "completada";
    await supabase.from("tareas").update({ estado: nuevoEstado }).eq("id", tareaId);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      title={estado === "completada" ? "Marcar como pendiente" : "Marcar como completada"}
      className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center text-xs transition-colors shrink-0 ${
        estado === "completada"
          ? "bg-green-500 border-green-500 text-white"
          : "border-stone-300 hover:border-amber-500"
      }`}
    >
      {estado === "completada" ? "✓" : ""}
    </button>
  );
}
