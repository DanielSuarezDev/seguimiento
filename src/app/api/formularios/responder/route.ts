import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { token, tokenId, personaId, tipo, respuestas } = await request.json();

    if (!token || !tokenId || !personaId || !tipo || !respuestas) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const supabase = await createClient();

    // Re-validar el token (seguridad: verificar que aún es válido)
    const { data: tokenData, error: tokenError } = await supabase
      .from("formularios_tokens")
      .select("id, expira_at, usado_at")
      .eq("token", token)
      .eq("id", tokenId)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json({ error: `Token inválido: ${tokenError?.message ?? "no encontrado"}` }, { status: 400 });
    }
    if (tokenData.usado_at) {
      return NextResponse.json({ error: "Este formulario ya fue respondido" }, { status: 400 });
    }
    if (new Date(tokenData.expira_at) < new Date()) {
      return NextResponse.json({ error: "Este formulario ha expirado" }, { status: 400 });
    }

    // Guardar respuesta
    const { error: insertError } = await supabase.from("formularios_respuestas").insert({
      token_id: tokenId,
      persona_id: personaId,
      tipo,
      respuestas,
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Marcar token como usado
    const { error: updateError } = await supabase
      .from("formularios_tokens")
      .update({ usado_at: new Date().toISOString() })
      .eq("id", tokenId);

    if (updateError) {
      return NextResponse.json({ error: `No se pudo marcar el token como usado: ${updateError.message}` }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: `Error interno: ${String(err)}` }, { status: 500 });
  }
}
