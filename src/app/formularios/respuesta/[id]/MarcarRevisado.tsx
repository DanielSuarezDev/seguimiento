"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { marcarRevisado } from "./actions";

export default function MarcarRevisado({ respuestaId, personaId }: { respuestaId: string; personaId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    setError(null);
    startTransition(async () => {
      const res = await marcarRevisado({ respuestaId, personaId });
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="text-xs bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white px-3 py-1.5 rounded-full font-medium transition-colors"
      >
        {pending ? "Marcando..." : "Marcar como revisado"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
