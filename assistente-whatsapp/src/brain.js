// brain.js — o cérebro do assistente.
//
// Recebe uma mensagem de texto, conversa com o Claude usando "tool use" e
// devolve a resposta em texto. O ponto central é o HUMANO NO MEIO: ações que
// CRIAM/ALTERAM algo (card, lembrete) nunca são executadas direto — o Claude
// primeiro REGISTRA uma proposta, te explica, e só executa quando você confirma.

import Anthropic from '@anthropic-ai/sdk';
import { config } from './config.js';
import { criarCard } from './tools/trello.js';
import { buscarDocumento } from './tools/documentos.js';
import { criarLembrete } from './tools/lembretes.js';

const client = new Anthropic({ apiKey: config.anthropicKey });

const SYSTEM = `Você é um assistente pessoal que conversa pelo WhatsApp, em português do Brasil.
Seu tom é direto, prestativo e curto (mensagens de WhatsApp são curtas).

REGRA DE OURO — humano no meio:
- Para QUALQUER ação que cria ou altera algo (criar card no Trello, criar lembrete),
  você NUNCA executa de imediato. Primeiro chame a ferramenta "registrar_proposta"
  com os detalhes e, em seguida, escreva uma mensagem curta resumindo o que entendeu
  e perguntando se pode prosseguir (ex: "Quer que eu crie? Responde OK.").
- Só chame "confirmar_proposta" quando a pessoa CLARAMENTE concordar (ok, pode, sim, manda ver).
- Se a pessoa pedir um ajuste (ex: "muda o prazo pra quinta"), registre uma NOVA proposta
  com os dados corrigidos e peça confirmação de novo.
- Se a pessoa recusar (não, cancela, deixa), chame "cancelar_proposta".

Buscar documento é leitura (não altera nada), então pode usar "buscar_documento" direto
e já devolver o resultado.

Quando receber uma mensagem encaminhada ou a transcrição de um áudio, interprete o contexto
e proponha a ação mais provável.`;

const TOOLS = [
  {
    name: 'buscar_documento',
    description: 'Busca um documento por palavras-chave e retorna os que combinam. Leitura, pode usar direto.',
    input_schema: {
      type: 'object',
      properties: { consulta: { type: 'string', description: 'palavras-chave do documento' } },
      required: ['consulta'],
    },
  },
  {
    name: 'registrar_proposta',
    description:
      'Registra uma ação que você quer SUGERIR (sem executar). Use antes de pedir confirmação.',
    input_schema: {
      type: 'object',
      properties: {
        tipo: { type: 'string', enum: ['criar_card', 'criar_lembrete'] },
        titulo: { type: 'string' },
        descricao: { type: 'string', description: 'detalhes (opcional)' },
        prazo: { type: 'string', description: 'data/prazo em texto, ex: "2026-06-05" ou "sexta" (opcional)' },
      },
      required: ['tipo', 'titulo'],
    },
  },
  {
    name: 'confirmar_proposta',
    description: 'Executa de verdade a proposta pendente. Só use depois de a pessoa concordar.',
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'cancelar_proposta',
    description: 'Descarta a proposta pendente, quando a pessoa recusa.',
    input_schema: { type: 'object', properties: {} },
  },
];

// Executa uma ferramenta e devolve o texto que volta para o Claude como tool_result.
async function executarFerramenta(sessao, nome, input) {
  switch (nome) {
    case 'buscar_documento': {
      const { resultados } = await buscarDocumento(input.consulta);
      if (resultados.length === 0) return 'Nenhum documento encontrado.';
      return 'Encontrados:\n' + resultados.map((d) => `- ${d.nome} (${d.link})`).join('\n');
    }

    case 'registrar_proposta': {
      sessao.propostaPendente = { ...input };
      return `Proposta registrada (aguardando confirmação do usuário): ${JSON.stringify(input)}`;
    }

    case 'confirmar_proposta': {
      const p = sessao.propostaPendente;
      if (!p) return 'Não há proposta pendente para confirmar.';
      sessao.propostaPendente = null;
      if (p.tipo === 'criar_card') {
        const r = await criarCard({ titulo: p.titulo, descricao: p.descricao, prazo: p.prazo });
        return r.mensagem;
      }
      if (p.tipo === 'criar_lembrete') {
        const r = await criarLembrete({ titulo: p.titulo, quando: p.prazo });
        return r.mensagem;
      }
      return 'Tipo de proposta desconhecido.';
    }

    case 'cancelar_proposta': {
      sessao.propostaPendente = null;
      return 'Proposta descartada.';
    }

    default:
      return `Ferramenta desconhecida: ${nome}`;
  }
}

/**
 * Processa uma mensagem do usuário e retorna a resposta em texto do assistente.
 * @param {ReturnType<import('./state.js').novaSessao>} sessao
 * @param {string} texto
 * @returns {Promise<string>}
 */
export async function processarMensagem(sessao, texto) {
  sessao.historico.push({ role: 'user', content: texto });

  let respostaFinal = '';

  // Laço de "tool use": o Claude pode chamar ferramentas várias vezes antes de
  // dar a resposta final em texto.
  for (let i = 0; i < 6; i++) {
    const msg = await client.messages.create({
      model: config.modelo,
      max_tokens: 1024,
      // cache_control no system reduz custo: a parte fixa é cobrada mais barato.
      system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
      tools: TOOLS,
      messages: sessao.historico,
    });

    sessao.historico.push({ role: 'assistant', content: msg.content });

    const textos = msg.content.filter((b) => b.type === 'text').map((b) => b.text);
    if (textos.length) respostaFinal = textos.join('\n');

    const chamadas = msg.content.filter((b) => b.type === 'tool_use');
    if (chamadas.length === 0) break; // resposta final, sem mais ferramentas

    const resultados = [];
    for (const c of chamadas) {
      const saida = await executarFerramenta(sessao, c.name, c.input);
      resultados.push({ type: 'tool_result', tool_use_id: c.id, content: saida });
    }
    sessao.historico.push({ role: 'user', content: resultados });
  }

  return respostaFinal || '(sem resposta)';
}
