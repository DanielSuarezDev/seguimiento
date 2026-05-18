"use server";

import { createClient } from "@/lib/supabase/server";

export async function responderFormulario(input: {
  token: string;
  tokenId: string;
  personaId: string;
  tipo: string;
  respuestas: Record<string, unknown>;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const { token, tokenId, personaId, tipo, respuestas } = input;

  if (!token || !tokenId || !personaId || !tipo || !respuestas) {
    return { ok: false, error: "Datos incompletos" };
  }

  const supabase = await createClient();

  // Validar el token
  const { data: tokenData, error: tokenError } = await supabase
    .from("formularios_tokens")
    .select("id, expira_at, usado_at")
    .eq("token", token)
    .eq("id", tokenId)
    .single();

  if (tokenError || !tokenData) {
    return { ok: false, error: `Token inválido: ${tokenError?.message ?? "no encontrado"}` };
  }
  if (tokenData.usado_at) {
    return { ok: false, error: "Este formulario ya fue respondido" };
  }
  if (new Date(tokenData.expira_at) < new Date()) {
    return { ok: false, error: "Este formulario ha expirado" };
  }

  // Guardar respuesta
  const { error: insertError } = await supabase.from("formularios_respuestas").insert({
    token_id: tokenId,
    persona_id: personaId,
    tipo,
    // @ts-expect-error — jsonb dinámico
    respuestas,
  });

  if (insertError) {
    return { ok: false, error: `Error al guardar respuesta: ${insertError.message}` };
  }

  // Marcar token como usado
  const { error: updateError } = await supabase
    .from("formularios_tokens")
    .update({ usado_at: new Date().toISOString() })
    .eq("id", tokenId);

  if (updateError) {
    return { ok: false, error: `Respuesta guardada pero no se pudo marcar el token: ${updateError.message}` };
  }

  // Sincronizar datos básicos de la persona si la evaluación inicial los trae
  // y el perfil aún los tiene vacíos. Errores aquí no son críticos; el envío
  // ya quedó guardado.
  if (tipo === "evaluacion_inicial") {
    const r = respuestas as Record<string, unknown>;
    const str = (v: unknown) => (typeof v === "string" ? v : "");
    await (supabase.rpc as unknown as (
      fn: string,
      args: Record<string, string>,
    ) => Promise<unknown>)(
      "sincronizar_persona_desde_form",
      {
        p_token: token,
        p_telefono:     str(r.telefono),
        p_email:        str(r.correo),
        p_estado_civil: str(r.estado_civil),
        p_ocupacion:    str(r.ocupacion),
        p_iglesia:      str(r.iglesia_asiste),
      },
    );
  }

  return { ok: true };
}
