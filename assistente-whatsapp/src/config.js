// config.js — centraliza variáveis de ambiente e flags de modo simulado.
import 'dotenv/config';

export const config = {
  anthropicKey: process.env.ANTHROPIC_API_KEY || '',
  modelo: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001',

  trello: {
    key: process.env.TRELLO_KEY || '',
    token: process.env.TRELLO_TOKEN || '',
    listaPadrao: process.env.TRELLO_LISTA_PADRAO || '',
  },
};

// Se não houver credenciais do Trello, rodamos em "modo simulado":
// o assistente finge que cria o card (apenas registra), sem chamar a API.
// Isso permite testar todo o fluxo de conversa com custo ~zero.
export const trelloSimulado = !(config.trello.key && config.trello.token);
