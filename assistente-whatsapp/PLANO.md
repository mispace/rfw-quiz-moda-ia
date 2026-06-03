# Assistente Pessoal no WhatsApp — Plano de Arquitetura

> Documento de planejamento. Nenhum código foi escrito ainda.
> Objetivo: um assistente no WhatsApp que **entende** texto/áudio/mensagens
> encaminhadas, **propõe** uma ação, pede **sua confirmação**, e **executa**
> (criar card no Trello, buscar documento, mandar lembrete, etc.).

---

## 1. Visão geral

```
        VOCÊ (WhatsApp)                       O ASSISTENTE                       AS FERRAMENTAS
┌────────────────────────────┐      ┌──────────────────────────────┐      ┌─────────────────────────┐
│  • Manda texto              │      │  Servidor 24/7 (Node.js)     │      │  Trello   (cards)       │
│  • Manda áudio              │ ───> │  ┌────────────────────────┐  │ ───> │  Google Drive (docs)    │
│  • Encaminha conversa       │      │  │ 1. Recebe (webhook)    │  │      │  Google Calendar        │
│  • Pede documento           │      │  │ 2. Transcreve áudio    │  │      │  Gmail                  │
│  • Responde "OK"            │ <─── │  │ 3. Claude entende      │  │ <─── │  Slack                  │
│                             │      │  │ 4. Propõe / executa    │  │      │  (Codex/Claude Code —   │
│                             │      │  └────────────────────────┘  │      │   fase futura)          │
└────────────────────────────┘      └──────────────────────────────┘      └─────────────────────────┘
                                              │
                                              ▼
                                     Banco de dados leve
                                  (memória de conversa + estado
                                   "aguardando confirmação")
```

**Princípio central:** o assistente **nunca cria nada sem o seu OK.**
Ele monta a proposta, te mostra, e só executa quando você confirma.
Isso é o "humano no meio" (human-in-the-loop) que você pediu.

---

## 2. As 4 camadas

### Camada 1 — Canal (WhatsApp Cloud API oficial da Meta)

Escolha definida: **WhatsApp Cloud API** (oficial).

O que isso significa na prática:
- É a API oficial da Meta — robusta, sem risco de bloqueio.
- Precisa de um **número de telefone dedicado** ao assistente (não pode ser
  o mesmo número que você usa no WhatsApp pessoal/Business app).
- Precisa de uma conta no **Meta for Developers** + um **WhatsApp Business
  Account (WABA)**.
- A Meta envia toda mensagem recebida para um **webhook** (uma URL pública
  do seu servidor). O seu servidor responde mandando mensagens de volta via
  uma chamada HTTP para a Graph API.
- Custo: as primeiras conversas iniciadas pelo usuário têm faixa gratuita
  mensal; acima disso é cobrado por conversa. Para uso pessoal, tende a
  ficar de graça ou muito barato.

**Limitação importante a saber desde já:** no WhatsApp Cloud API, quando
*você* inicia a conversa fora de uma janela de 24h, só pode mandar
**templates pré-aprovados** pela Meta. Dentro da janela de 24h após você
mandar algo, o bot pode responder com texto livre. Isso afeta os
**lembretes proativos** (ver Fase 3) — vamos resolver com um template
aprovado do tipo "Você tem 1 lembrete novo, toque para ver".

### Camada 2 — Cérebro (Claude API)

Toda mensagem passa pelo Claude, que faz três coisas:

1. **Transcrição de áudio** → o áudio do WhatsApp é baixado e transcrito
   para texto (via um serviço de speech-to-text; ver §6).
2. **Interpretação de intenção** → Claude lê o texto e decide:
   - É um lembrete? Uma tarefa pra virar card? Um pedido de documento?
   - Quais os detalhes (título, prazo, lista do Trello, nome do arquivo)?
3. **Resposta em linguagem natural** → "Entendi, é sobre X. Quer que eu
   crie um card no Trello na lista 'A fazer' com prazo sexta? Responde OK."

Tecnicamente isso usa **tool use (function calling)** do Claude: a gente
descreve as ferramentas disponíveis (criar_card, buscar_documento,
criar_lembrete…) e o Claude escolhe qual chamar e com quais parâmetros.

### Camada 3 — Mãos (as integrações)

| Ferramenta        | O que faz                          | Status hoje                    |
|-------------------|------------------------------------|--------------------------------|
| **Trello**        | Criar/mover/buscar cards           | Falta conectar (API key+token) |
| **Google Drive**  | Buscar e enviar documentos         | Já conectado nas ferramentas   |
| **Google Calendar** | Criar eventos / ler agenda       | Já conectado                   |
| **Gmail**         | Ler / rascunhar e-mails            | Já conectado                   |
| **Slack**         | Mandar/ler mensagens               | Já conectado                   |
| **Codex / Claude Code** | Acionar tarefas de código    | Fase futura (avançado)         |

### Camada 4 — Porteiro (você, o humano no meio)

Máquina de estados simples por conversa:

```
[mensagem chega] → Claude interpreta → 
    ├─ intenção clara e segura (ex: buscar doc) → EXECUTA e responde
    └─ intenção que cria/altera algo (ex: criar card) →
            PROPÕE → estado "AGUARDANDO_CONFIRMACAO"
                ├─ você responde "OK / pode" → EXECUTA → confirma com link
                ├─ você ajusta "muda pra quinta" → re-PROPÕE
                └─ você "não / cancela" → descarta
```

---

## 3. Os fluxos que você descreveu (passo a passo)

### Fluxo A — Encaminhar conversa / mandar áudio vira card
```
1. Você encaminha um print/texto ou manda um áudio.
2. Servidor recebe; se for áudio, transcreve.
3. Claude: "Entendi: o cliente pediu ajuste no prazo da campanha.
   Quer que eu crie um card no Trello e marque pra sexta?"
4. Você: "OK, mas põe pra quinta."
5. Servidor cria o card no Trello (prazo=quinta) e responde:
   "Pronto ✅ Card criado: <link>"
```

### Fluxo B — Pedir um documento
```
1. Você: "me manda o contrato da RFW"
2. Claude busca no Google Drive por "contrato RFW".
3. Achou 1 → manda o arquivo no WhatsApp.
   Achou vários → "Achei 3, qual? 1) ... 2) ... 3) ..."
```

### Fluxo C — Lembretes proativos
```
1. Um agendador roda de tempos em tempos (ex: toda manhã).
2. Lê Trello + Calendar, monta a lista do dia.
3. Como pode estar fora da janela de 24h, manda um TEMPLATE aprovado:
   "Bom dia! Você tem 3 itens hoje. Responda 'ver' para os detalhes."
4. Você responde → abre a janela → bot manda a lista completa em texto livre.
```

---

## 4. Stack técnica proposta

- **Linguagem:** Node.js (JavaScript) — combina com o que já existe no projeto.
- **Framework web:** Express (servidor do webhook).
- **IA:** SDK oficial `@anthropic-ai/sdk` (Claude), com tool use.
- **Transcrição de áudio:** ver §6 (opções).
- **Banco de dados:** começar simples (SQLite ou um JSON/Redis) só pra
  guardar memória de conversa e o estado "aguardando confirmação".
- **Hospedagem 24/7:** Railway, Render ou Fly.io (planos baratos, deploy
  por git). Precisa ser sempre-ligado por causa do webhook do WhatsApp.

> Observação: o site atual (GitHub Pages estático + Google Apps Script)
> **não serve** para isso — webhook do WhatsApp exige um servidor próprio
> rodando o tempo todo. Por isso este assistente vive em uma pasta/projeto
> separado (`assistente-whatsapp/`).

---

## 5. Estrutura de pastas planejada

```
assistente-whatsapp/
├── PLANO.md                  ← este documento
├── README.md                 ← como rodar (a criar)
├── .env.example              ← lista de segredos necessários (a criar)
├── package.json
├── src/
│   ├── server.js             ← webhook + verificação da Meta
│   ├── whatsapp.js           ← receber/enviar/baixar mídia (Graph API)
│   ├── brain.js              ← chamada ao Claude + definição das tools
│   ├── transcribe.js         ← áudio → texto
│   ├── state.js              ← memória + máquina de confirmação
│   └── tools/
│       ├── trello.js
│       ├── drive.js
│       ├── calendar.js
│       └── reminders.js
└── scripts/
    └── scheduler.js          ← lembretes proativos (cron)
```

---

## 6. Decisões em aberto (preciso da sua opinião antes de codar)

1. **Transcrição de áudio** — três caminhos:
   - (a) API da OpenAI (Whisper) — barata e muito boa em português.
   - (b) Google Speech-to-Text — você já está no ecossistema Google.
   - (c) Claude nativo (quando o áudio puder ir direto) — mais simples,
     menos peças.
2. **Hospedagem** — Railway vs. Render vs. Fly.io (todas servem; Railway é
   a mais simples pra começar).
3. **Banco** — começar com arquivo local (SQLite) e migrar depois, ou já ir
   pra algo gerenciado.

---

## 7. Roadmap por fases

> Você pediu "tudo isso e mais". O destino é o conjunto completo, mas a
> construção é faseada pra entregar valor cedo e sem bagunça.

### Fase 0 — Fundação (canal funcionando)
- [ ] Criar conta Meta for Developers + WABA + número dedicado.
- [ ] Subir servidor Express com webhook verificado pela Meta.
- [ ] "Eco": você manda "oi", o bot responde "oi" (prova que o canal vive).

### Fase 1 — Cérebro + Trello (o fluxo principal)
- [ ] Integrar Claude com tool use.
- [ ] Transcrição de áudio.
- [ ] Tool `criar_card` no Trello + ciclo de confirmação (humano no meio).
- [ ] Entender mensagens encaminhadas/áudio e propor card.

### Fase 2 — Documentos
- [ ] Tool `buscar_documento` no Google Drive e enviar arquivo no WhatsApp.

### Fase 3 — Lembretes proativos
- [ ] Agendador + template aprovado pela Meta.
- [ ] Ler Trello/Calendar e mandar o resumo do dia.

### Fase 4 — Mais integrações
- [ ] Gmail (rascunhar/ler), Calendar (criar eventos), Slack.

### Fase 5 — Avançado (código)
- [ ] Acionar Codex / Claude Code a partir do WhatsApp.

---

## 8. Segredos necessários (vão para `.env`, NUNCA no git)

| Variável                  | De onde vem                                   |
|---------------------------|-----------------------------------------------|
| `ANTHROPIC_API_KEY`       | console.anthropic.com → API Keys              |
| `WHATSAPP_TOKEN`          | Meta for Developers (token do WABA)           |
| `WHATSAPP_PHONE_ID`       | Meta — ID do número                           |
| `WHATSAPP_VERIFY_TOKEN`   | você inventa (usado na verificação do webhook)|
| `TRELLO_KEY` / `TRELLO_TOKEN` | trello.com/app-key                        |
| `OPENAI_API_KEY` (se Whisper) | platform.openai.com                       |
| (Google) credenciais OAuth | Google Cloud Console                         |

> O mesmo padrão de segurança que vocês já adotam no quiz vale aqui:
> **nenhuma chave no frontend, nenhum segredo no repositório.**

---

## 9. Riscos e cuidados

- **Janela de 24h da Meta** → afeta lembretes proativos (resolvido com
  template aprovado).
- **Privacidade** → o assistente lê suas conversas/documentos; tudo fica
  no seu servidor e nas APIs que você controla. Nada é compartilhado.
- **Confirmação obrigatória** → ações que criam/alteram coisas SEMPRE
  passam por você. Reduz risco de bagunça.
- **Custo** → some Claude + (eventual) transcrição + hospedagem; para uso
  pessoal, baixo. Dá pra estimar melhor depois de definir o §6.

---

## 10. Próximo passo

Decidir os 3 itens do **§6** (transcrição, hospedagem, banco) e então
começar pela **Fase 0** (provar que o canal do WhatsApp vive com um simples
"eco"). A partir daí cada fase é incremental e testável.
