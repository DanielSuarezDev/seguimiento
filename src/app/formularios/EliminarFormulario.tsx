"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function EliminarFormulario({ tokenId }: { tokenId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [eliminando, setEliminando] = useState(false);

  async function eliminar() {
    if (!confirm("¿Eliminar este formulario? Si ya fue respondido, se borrará también la respuesta. Esta acción es irreversible.")) return;
    setEliminando(true);
    const { error } = await supabase.from("formularios_tokens").delete().eq("id", tokenId);
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
      className="text-xs text-stone-300 hover:text-red-500 transition-colors disabled:opacity-40"
      title="Eliminar formulario"
    >
      {eliminando ? "..." : "✕"}
    </button>
  );
}
