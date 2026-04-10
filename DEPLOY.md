# Deploy — RFW 2026 Quiz Moda IA

## Arquitetura de segurança

```
GitHub Pages (frontend)               Google Apps Script (backend)
┌─────────────────────┐               ┌──────────────────────────────┐
│  HTML/CSS/JS         │    POST       │  1. Valida campos            │
│                      │ ────────────> │  2. Chama Claude API         │
│  Nenhuma API key     │               │     (API key fica AQUI)      │
│  Nenhum segredo      │ <──────────── │  3. Salva no Google Sheets   │
│                      │  JSON:        │  4. Retorna { prompt, source}│
└─────────────────────┘  success,      └──────────────────────────────┘
                         prompt,
                         source
```

**A chave da Anthropic NUNCA sai do Google Apps Script.**

---

## Passo 1 — Criar a Google Sheet

1. Abra [Google Sheets](https://sheets.google.com) e crie uma nova planilha
2. Renomeie para **"RFW 2026 - Prompts Gerados"**
3. Renomeie a primeira aba para exatamente **Prompts** (case-sensitive)
4. Na **linha 1**, escreva estes headers nas colunas A–I:

```
Timestamp | Nome | Email | Estilo | Look | Atitude | Mundo | Prompt Gerado | Status
```

5. Copie o **ID da planilha** da barra de endereço:
   ```
   https://docs.google.com/spreadsheets/d/ ← ESTE_ID_AQUI → /edit
   ```

---

## Passo 2 — Deploy do backend (Google Apps Script)

1. Na planilha, vá em **Extensões → Apps Script**
2. Apague qualquer código existente
3. Cole **todo** o conteúdo do arquivo `google-apps-script.js`
4. Preencha as **2 variáveis** no topo:

```javascript
var ANTHROPIC_API_KEY = 'sk-ant-SUA-CHAVE-REAL';   // ← colar aqui
var SHEET_ID = 'ID-COPIADO-NO-PASSO-1';            // ← colar aqui
```

5. Clique em **Implantar → Nova implantação**
6. Clique na engrenagem e selecione **Aplicativo da Web**
7. Configure:
   - **Descrição:** RFW Quiz Backend
   - **Executar como:** Eu (seu email)
   - **Quem tem acesso:** Qualquer pessoa
8. Clique em **Implantar**
9. Autorize as permissões quando solicitado (tela de segurança do Google)
10. **Copie a URL gerada** — formato: `https://script.google.com/macros/s/.../exec`

### Verificar se o backend funciona

Abra a URL copiada no navegador. Deve retornar:
```json
{"status":"ok","service":"RFW 2026 Quiz Moda IA","timestamp":"2026-..."}
```

---

## Passo 3 — Configurar o frontend

1. Copie o template:
```bash
cp config.example.js config.js
```

2. Edite `config.js` — cole a URL do backend:
```javascript
const CONFIG = {
  backendUrl: 'https://script.google.com/macros/s/SUA_URL_REAL/exec'
};
```

---

## Passo 4 — Testar localmente

1. Abra `index.html` no navegador (ou use Live Server no VS Code)
2. Preencha nome e email → clique COMEÇAR
3. Faça as 4 escolhas (estilo, look, atitude, mundo)
4. Aguarde a tela de loading (mínimo 2s)
5. Verifique:
   - O prompt aparece na tela de resultado
   - O botão COPIAR funciona
   - O botão CRIAR OUTRO PROMPT reinicia o quiz
6. Abra a Google Sheet — confira a nova linha com os dados
7. Na coluna **Status**, confira se está `generated_by_claude`

### Testar o fallback

1. Mude `backendUrl` para uma URL inválida em `config.js`
2. Complete o quiz novamente
3. O prompt deve aparecer mesmo assim (gerado localmente)
4. Restaure a URL correta após o teste

---

## Passo 5 — Publicar no GitHub Pages

```bash
cd rfw-quiz-moda-ia
git init
git add .
git commit -m "Quiz Moda IA - RFW 2026"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/rfw-quiz-moda-ia.git
git push -u origin main
```

No GitHub:
1. **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** / **/ (root)**
4. Clique **Save**
5. Aguarde ~1min → URL aparece: `https://SEU_USUARIO.github.io/rfw-quiz-moda-ia/`

> O `config.js` contém apenas a URL pública do backend (sem segredos),
> então é seguro commitá-lo. Ele não está no `.gitignore`.

---

## Passo 6 — Adicionar imagens (quando prontas)

Gere as 40 imagens usando os prompts Midjourney do briefing.
Coloque-as nas pastas (nomes exatos dos arquivos):

```
assets/images/estilo/moderno-minimalista.jpg
assets/images/estilo/futurista-tech.jpg
assets/images/estilo/romantico-etereo.jpg
assets/images/estilo/vintage-classico.jpg
assets/images/estilo/urbano-streetwear.jpg
assets/images/estilo/alta-costura.jpg
assets/images/estilo/boho-artistico.jpg
assets/images/estilo/luxo-atemporal.jpg
assets/images/estilo/avant-garde.jpg
assets/images/estilo/neo-brasileiro.jpg

assets/images/look/vestido-longo.jpg
assets/images/look/blazer-oversized.jpg
assets/images/look/conjunto-mono.jpg
assets/images/look/trench-coat.jpg
assets/images/look/vestido-midi.jpg
assets/images/look/jaqueta-statement.jpg
assets/images/look/macacao.jpg
assets/images/look/camisa-saia.jpg
assets/images/look/tricot-total.jpg
assets/images/look/peca-esculpida.jpg

assets/images/atitude/flutuando.jpg
assets/images/atitude/caminhando.jpg
assets/images/atitude/estatica-frontal.jpg
assets/images/atitude/girando.jpg
assets/images/atitude/sentada.jpg
assets/images/atitude/movimento-dramatico.jpg
assets/images/atitude/olhando-tras.jpg
assets/images/atitude/bracos-levantados.jpg
assets/images/atitude/close-textura.jpg
assets/images/atitude/diagonal.jpg

assets/images/mundo/estudio-branco.jpg
assets/images/mundo/passarela-rfw.jpg
assets/images/mundo/milao-golden.jpg
assets/images/mundo/rooftop-sunset.jpg
assets/images/mundo/loft-industrial.jpg
assets/images/mundo/jardim-tropical.jpg
assets/images/mundo/praia-deserta.jpg
assets/images/mundo/galeria-arte.jpg
assets/images/mundo/rua-colorida-rio.jpg
assets/images/mundo/deserto-sal.jpg
```

Otimize: 600x800px, JPEG quality 80, < 200KB cada.
Sem imagens, o quiz exibe emojis automaticamente.

---

## Resumo: o que preencher manualmente

| # | O quê | Onde preencher | Quando |
|---|-------|---------------|--------|
| 1 | **API Key Anthropic** | Google Apps Script → variável `ANTHROPIC_API_KEY` | Setup único |
| 2 | **ID da Planilha** | Google Apps Script → variável `SHEET_ID` | Setup único |
| 3 | **URL do backend** | `config.js` → campo `backendUrl` | Setup único |

---

## Exemplo de config.js final

```javascript
const CONFIG = {
  backendUrl: 'https://script.google.com/macros/s/AKfycbx1234567890abcdefg/exec'
};
```

---

## Contingência / modo offline

Se o backend falhar durante o evento:
- O quiz continua funcionando normalmente
- Prompts são gerados localmente (template + escolhas)
- 10 prompts pré-gerados de backup em `js/api.js`
- Os dados NÃO são salvos no Sheets (só quando backend volta)

---

## Atualizar o backend após implantação

1. Abra o editor do Apps Script
2. Faça as alterações
3. **Implantar → Gerenciar implantações → Lápis (editar)**
4. Mude versão para **"Nova versão"**
5. Clique **Implantar** (a URL não muda)

---

## Valores de Status na planilha

| Status | Significado |
|--------|-------------|
| `generated_by_claude` | Prompt gerado com sucesso pela API Claude |
| `fallback_backend_http_XXX` | Claude retornou erro HTTP XXX; fallback usado |
| `fallback_backend_empty_response` | Claude respondeu mas sem conteúdo |
| `fallback_backend_exception` | Exceção na chamada ao Claude |
| `error` | Erro de validação ou JSON inválido |

---

## Checklist pré-evento

### Backend
- [ ] API key Anthropic ativa e com crédito suficiente
- [ ] Google Sheet criada com aba "Prompts" e headers na linha 1
- [ ] Apps Script implantado e URL copiada
- [ ] Teste GET: URL no navegador retorna `{"status":"ok",...}`
- [ ] Teste POST: completar quiz e ver linha na planilha com status `generated_by_claude`

### Frontend
- [ ] `config.js` com a URL correta do backend
- [ ] Quiz completo funciona: welcome → 4 etapas → loading → resultado
- [ ] Botão COPIAR copia o prompt para a área de transferência
- [ ] Botão CRIAR OUTRO PROMPT reinicia do zero
- [ ] Botão VOLTAR navega corretamente entre etapas
- [ ] Testado em mobile (Chrome Android / Safari iOS)
- [ ] Testado em desktop/tablet (dispositivo do evento)

### Fallback
- [ ] Com backend URL errada, quiz gera prompt local (não quebra)
- [ ] Sem config.js, quiz funciona com fallback

### Publicação
- [ ] GitHub Pages ativo e URL pública acessível
- [ ] Todas as telas carregam corretamente na URL pública
- [ ] QR Code gerado apontando para a URL

### Dia do evento
- [ ] Testar o quiz no local do evento (rede WiFi)
- [ ] Notebook com internet móvel de backup
- [ ] Planilha compartilhada aberta para monitorar em tempo real
- [ ] 10 prompts pré-gerados impressos como contingência
