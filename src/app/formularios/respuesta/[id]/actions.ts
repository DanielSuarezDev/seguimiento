"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function marcarRevisado(
  input: { respuestaId: string; personaId: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("formularios_respuestas")
    .update({ revisado_at: new Date().toISOString() })
    .eq("id", input.respuestaId);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/formularios/respuesta/${input.respuestaId}`);
  revalidatePath(`/personas/${input.personaId}`);
  return { ok: true };
}
