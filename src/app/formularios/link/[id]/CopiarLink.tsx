"use client";

import { useState, useEffect } from "react";

export default function CopiarLink({ token }: { token: string }) {
  const [link, setLink] = useState("");
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    setLink(`${window.location.origin}/f/${token}`);
  }, [token]);

  function copiar() {
    navigator.clipboard.writeText(link);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-stone-400">Link para enviar al aconsejado</p>
      <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-sm text-stone-700 font-mono break-all">
        {link || "Cargando..."}
      </div>
      <div className="flex gap-2">
        <button
          onClick={copiar}
          disabled={!link}
          className="bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
        >
          {copiado ? "✓ Copiado" : "Copiar link"}
        </button>
        {link && (
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Hola, te comparto este formulario: ${link}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border border-stone-300 hover:border-stone-400 text-stone-600 text-sm font-medium px-5 py-2 rounded-lg transition-colors"
          >
            Enviar por WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
