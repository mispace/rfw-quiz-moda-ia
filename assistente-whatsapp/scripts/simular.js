// simular.js — conversa com o assistente pelo TERMINAL (sem WhatsApp).
// Serve para testar o cérebro com custo ~zero antes de plugar na Meta.
//
// Uso:
//   1. cd assistente-whatsapp && npm install
//   2. cp .env.example .env  e coloque sua ANTHROPIC_API_KEY
//   3. npm run simular
//
// Digite como se estivesse no WhatsApp. Para imitar um áudio/encaminhado,
// é só digitar o texto correspondente. Ctrl+C para sair.

import readline from 'node:readline';
import { config } from '../src/config.js';
import { trelloSimulado } from '../src/config.js';
import { novaSessao } from '../src/state.js';
import { processarMensagem } from '../src/brain.js';

if (!config.anthropicKey) {
  console.error('\n⚠️  Falta ANTHROPIC_API_KEY no arquivo .env (copie de .env.example).\n');
  process.exit(1);
}

console.log('\n=== Assistente (simulador de terminal) ===');
console.log(`Modelo: ${config.modelo}`);
console.log(`Trello: ${trelloSimulado ? 'MODO SIMULADO (só finge criar cards)' : 'conectado'}`);
console.log('Digite uma mensagem. Ctrl+C para sair.\n');

const sessao = novaSessao();
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: 'você > ' });
rl.prompt();

rl.on('line', async (linha) => {
  const texto = linha.trim();
  if (!texto) return rl.prompt();
  try {
    const resposta = await processarMensagem(sessao, texto);
    console.log(`\n🤖 ${resposta}\n`);
  } catch (err) {
    console.error('\n❌ Erro:', err.message, '\n');
  }
  rl.prompt();
});

rl.on('close', () => {
  console.log('\nAté mais! 👋');
  process.exit(0);
});
