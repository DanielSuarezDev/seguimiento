"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function EliminarPlantilla({ plantillaId }: { plantillaId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [eliminando, setEliminando] = useState(false);

  async function eliminar() {
    if (!confirm("¿Eliminar esta plantilla? Los formularios ya enviados con esta plantilla seguirán funcionando pero ya no podrás enviar nuevos con ella.")) return;
    setEliminando(true);
    const { error } = await supabase.from("form_plantillas").delete().eq("id", plantillaId);
    if (error) {
      alert(`Error: ${error.message}`);
      setEliminando(false);
    } else {
      router.refresh();
    }
  }

  return (
    <button
      onClick={eliminar}
      disabled={eliminando}
      className="text-stone-300 hover:text-red-500 transition-colors text-sm disabled:opacity-40"
      title="Eliminar plantilla"
    >
      {eliminando ? "..." : "✕"}
    </button>
  );
}
