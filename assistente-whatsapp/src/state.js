// state.js — estado de uma conversa (memória + proposta aguardando confirmação).
//
// FASE 1: em memória, uma sessão por vez.
// Depois: uma sessão por número de WhatsApp, persistida em banco.

export function novaSessao() {
  return {
    historico: [], // mensagens trocadas com o Claude (formato da API)
    propostaPendente: null, // ação que o assistente sugeriu e aguarda seu "OK"
  };
}
