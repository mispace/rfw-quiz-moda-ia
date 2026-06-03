// lembretes.js — registra lembretes simples.
//
// FASE 1 (agora): guarda em memória (some quando o processo fecha).
// FASE 3 (depois): persistir + disparar proativamente via WhatsApp/Calendar.

const lembretes = [];

/**
 * Registra um lembrete.
 * @param {{titulo:string, quando?:string}} dados
 */
export async function criarLembrete({ titulo, quando = '' }) {
  lembretes.push({ titulo, quando, criadoEm: new Date().toISOString() });
  return {
    ok: true,
    mensagem: `Lembrete registrado: "${titulo}"` + (quando ? ` para ${quando}.` : '.'),
  };
}

export function listarLembretes() {
  return lembretes;
}
