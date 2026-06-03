# Assistente WhatsApp — Fase 1 (o cérebro)

Protótipo do assistente pessoal. Esta fase implementa **o cérebro** (Claude +
Trello + ciclo de confirmação) e um **simulador de terminal** para você testar
o fluxo **sem precisar do WhatsApp ainda** e com custo praticamente zero.

> Esta pasta é autocontida. Quando quiser, mova ela inteira para um repositório
> próprio — ela não depende de nada do projeto do quiz.

## O que já funciona

- Você "conversa" pelo terminal como se fosse o WhatsApp.
- O Claude entende a mensagem (texto, ou o texto de um áudio/encaminhado).
- Para criar card no Trello ou lembrete, ele **propõe primeiro e só executa
  depois do seu OK** (humano no meio).
- Buscar documento funciona com um catálogo de exemplo (Drive real vem depois).
- Sem credenciais do Trello, roda em **modo simulado** (finge criar o card).

## Como rodar

```bash
cd assistente-whatsapp
npm install
cp .env.example .env      # edite e coloque sua ANTHROPIC_API_KEY
npm run simular
```

## Exemplos para testar no simulador

```
você > acabei de falar com a fornecedora, ela atrasou a entrega pra semana que vem, preciso avisar a equipe
🤖 (ele propõe criar um card e pergunta se pode)

você > ok, mas marca pra hoje
🤖 (ele cria — ou simula — e confirma)

você > me manda o contrato da RFW
🤖 (ele busca e devolve o documento)
```

## Custo

- **Claude**: comece com Haiku (barato). Defina um TETO de gasto em
  console.anthropic.com → Billing → Limits para nunca ter surpresa.
- **Trello / WhatsApp / hospedagem**: nada nesta fase (tudo simulado/local).

## Próximas fases

- **Fase 2** — Documentos reais (Google Drive) + plugar no WhatsApp Cloud API.
- **Fase 3** — Lembretes proativos (agendador + template aprovado pela Meta).
- **Fase 4** — Gmail, Calendar, Slack.

Veja o plano completo em [`PLANO.md`](./PLANO.md).
