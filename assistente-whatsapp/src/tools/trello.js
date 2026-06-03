// trello.js — cria cards no Trello (ou simula, se não houver credenciais).
import { config, trelloSimulado } from '../config.js';

/**
 * Cria um card no Trello.
 * @param {{titulo:string, descricao?:string, prazo?:string, lista?:string}} dados
 * @returns {Promise<{ok:boolean, simulado:boolean, link?:string, mensagem:string}>}
 */
export async function criarCard({ titulo, descricao = '', prazo = '', lista = '' }) {
  if (trelloSimulado) {
    // Modo simulado: não chama a API, apenas confirma o que SERIA feito.
    return {
      ok: true,
      simulado: true,
      mensagem:
        `[SIMULADO] Card que seria criado no Trello:\n` +
        `  • Título: ${titulo}\n` +
        (descricao ? `  • Descrição: ${descricao}\n` : '') +
        (prazo ? `  • Prazo: ${prazo}\n` : '') +
        `(Configure TRELLO_KEY e TRELLO_TOKEN no .env para criar de verdade.)`,
    };
  }

  const idList = lista || config.trello.listaPadrao;
  if (!idList) {
    return { ok: false, simulado: false, mensagem: 'Falta definir a lista do Trello (TRELLO_LISTA_PADRAO).' };
  }

  const params = new URLSearchParams({
    key: config.trello.key,
    token: config.trello.token,
    idList,
    name: titulo,
    desc: descricao,
  });
  if (prazo) params.set('due', prazo);

  const resp = await fetch(`https://api.trello.com/1/cards?${params.toString()}`, { method: 'POST' });
  if (!resp.ok) {
    const txt = await resp.text();
    return { ok: false, simulado: false, mensagem: `Erro ao criar card no Trello: ${resp.status} ${txt}` };
  }
  const card = await resp.json();
  return { ok: true, simulado: false, link: card.shortUrl, mensagem: `Card criado: ${card.shortUrl}` };
}
