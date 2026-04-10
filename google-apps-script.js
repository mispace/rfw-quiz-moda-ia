/**
 * ============================================================
 * Google Apps Script — Backend do Quiz "Crie Moda com IA"
 * RFW 2026 / SENAC RJ
 * ============================================================
 *
 * O QUE ESTE BACKEND FAZ (uma chamada):
 *   1. Recebe nome, email e 4 escolhas do frontend
 *   2. Valida os campos obrigatórios
 *   3. Gera o prompt via Claude API (Anthropic)
 *   4. Salva tudo no Google Sheets
 *   5. Retorna JSON: { success, prompt, source }
 *
 * CAMPOS QUE VOCÊ PRECISA PREENCHER (linha ~40):
 *   ANTHROPIC_API_KEY  → chave da Anthropic (console.anthropic.com)
 *   SHEET_ID           → ID da Google Sheet (da URL)
 *
 * SETUP COMPLETO:
 *   1. Crie uma Google Sheet → renomeie a aba para "Prompts"
 *   2. Linha 1 (headers): Timestamp | Nome | Email | Estilo | Look | Atitude | Mundo | Prompt Gerado | Status
 *   3. Copie o ID da planilha (na URL entre /d/ e /edit)
 *   4. Extensões > Apps Script → apague tudo → cole este código
 *   5. Preencha ANTHROPIC_API_KEY e SHEET_ID abaixo
 *   6. Implantar > Nova implantação > Aplicativo da Web
 *      - Executar como: Eu
 *      - Quem tem acesso: Qualquer pessoa
 *   7. Autorize permissões → copie a URL gerada
 *   8. Cole a URL no config.js do frontend (campo backendUrl)
 */

// ===========================================
// >>> PREENCHER COM SEUS DADOS <<<
// ===========================================
var ANTHROPIC_API_KEY = 'sk-ant-COLE_SUA_CHAVE_AQUI';
var SHEET_ID = 'COLE_O_ID_DA_PLANILHA_AQUI';
// ===========================================

// ========================
// SYSTEM PROMPT (Claude)
// ========================
var SYSTEM_PROMPT =
  'Você é um diretor criativo especialista em prompt engineering para geração de imagens de moda editorial com IA.\n\n' +
  'O usuário fez 6 escolhas criativas: Produto, Estilo, Cartela de Cor, Quem Veste, Locação e Sensação.\n' +
  'Sua tarefa é transformar essas escolhas em um prompt profissional de altíssima qualidade para Midjourney.\n\n' +
  'CONCEITO:\n' +
  'Toda imagem gerada deve parecer um editorial de moda para a capa da revista Vogue. Foto em altíssima qualidade, com textura e caimento realista dos tecidos, textura de pele visível, tirada por um fotógrafo de moda renomado com câmera profissional. O modelo deve estar em pose editorial.\n\n' +
  'FÓRMULA DO PROMPT:\n' +
  'fashion editorial + quem veste (modelo com descrição física) + produto (peça de roupa com detalhes ricos de tecido, corte, caimento, acabamento) + estilo + cartela de cor aplicada à peça e ao cenário + locação/cenário + sensação/atmosfera + iluminação profissional + qualidade técnica + --ar 2:3\n\n' +
  'REGRAS OBRIGATÓRIAS:\n' +
  '1. Sempre em inglês\n' +
  '2. Começar com "fashion editorial"\n' +
  '3. Incluir o modelo (quem veste) com descrição física respeitosa e realista\n' +
  '4. Ser extremamente descritivo com materiais, texturas de tecido, caimento e acabamento da peça\n' +
  '5. Descrever textura de pele realista, cabelo, maquiagem editorial\n' +
  '6. Aplicar a cartela de cor ao look, maquiagem e atmosfera\n' +
  '7. Descrever o cenário/locação com detalhes visuais cinematográficos\n' +
  '8. A sensação deve influenciar a atmosfera, iluminação, expressão e mood geral\n' +
  '9. Incluir: "shot on Hasselblad H6D, 100mm lens, ultra high resolution, natural skin texture, fabric texture detail, professional fashion photography"\n' +
  '10. NUNCA incluir nomes de fotógrafos reais (Mario Testino, Annie Leibovitz, etc)\n' +
  '11. Terminar com --ar 2:3 (SEM --style raw, SEM --v)\n' +
  '12. Retornar APENAS o prompt, sem explicações ou formatação extra\n\n' +
  'REGRA ESPECIAL PARA ALIENS:\n' +
  'Se o modelo for alien/alienígena, OBRIGATORIAMENTE descrever com MUITA ênfase: smooth metallic grey-blue skin with soft pearlescent reflections, large almond-shaped glossy black eyes with natural reflections, slightly elongated head, high cheekbones, narrow chin, long thick eyelashes, NON-HUMAN alien creature. Repetir "alien" e "non-human" várias vezes no prompt para garantir que o Midjourney não gere uma pessoa humana normal.\n\n' +
  'EXEMPLO:\n' +
  'fashion editorial, beautiful Black woman with glowing dark skin and sculptural short hair, wearing a flowing long gown in liquid emerald silk with deep side slit and draped neckline, romantic ethereal style, soft pastel color palette with blush pink and lavender accents in makeup and background, standing in a lush tropical garden with dappled golden sunlight filtering through palm leaves, evoking a feeling of lightness and serenity, soft natural backlighting with warm golden rim light, shot on Hasselblad H6D, 100mm lens, ultra high resolution, natural skin texture, visible fabric grain and draping detail, professional fashion photography --ar 2:3';


// ==============================
// ENDPOINT POST (chamado pelo frontend)
// ==============================
function doPost(e) {
  // --- Parse do JSON ---
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    _salvarErro('', '', 'JSON inválido: ' + err.message);
    return _json({ success: false, error: 'JSON inválido', source: 'error' });
  }

  var nome     = _trim(data.nome);
  var email    = _trim(data.email);
  var produto  = _trim(data.produto);
  var estilo   = _trim(data.estilo);
  var cor      = _trim(data.cor);
  var modelo   = _trim(data.modelo);
  var locacao  = _trim(data.locacao);
  var sensacao = _trim(data.sensacao);

  // --- Validação ---
  var camposFaltando = [];
  if (!nome)     camposFaltando.push('nome');
  if (!email)    camposFaltando.push('email');
  if (!produto)  camposFaltando.push('produto');
  if (!estilo)   camposFaltando.push('estilo');
  if (!cor)      camposFaltando.push('cor');
  if (!modelo)   camposFaltando.push('modelo');
  if (!locacao)  camposFaltando.push('locacao');
  if (!sensacao) camposFaltando.push('sensacao');

  if (camposFaltando.length > 0) {
    _salvarErro(nome, email, 'Campos faltando: ' + camposFaltando.join(', '));
    return _json({
      success: false,
      error: 'Campos obrigatórios faltando: ' + camposFaltando.join(', '),
      source: 'error'
    });
  }

  // --- Gerar prompt completo (Claude) ---
  var resultado = _gerarPromptClaude(produto, estilo, cor, modelo, locacao, sensacao);

  // --- Prompt simples EN (para referencia) ---
  var promptSimples = 'Fashion editorial: ' + modelo + ' wearing ' + produto +
    ', ' + estilo + ', ' + cor + ' color palette, set in ' + locacao +
    ', evoking ' + sensacao + ' --ar 2:3';

  // --- Salvar no Sheets (com os dois prompts) ---
  _salvarNoSheets(nome, email, produto, estilo, cor, modelo, locacao, sensacao, promptSimples, resultado.prompt, resultado.status);

  // --- Retornar ao frontend ---
  return _json({
    success: true,
    prompt: resultado.prompt,
    source: resultado.source
  });
}


// ==============================
// ENDPOINT GET (health check)
// ==============================
function doGet() {
  return _json({
    status: 'ok',
    service: 'RFW 2026 Quiz Moda IA',
    timestamp: new Date().toISOString()
  });
}


// ==============================
// CLAUDE API
// ==============================
function _gerarPromptClaude(produto, estilo, cor, modelo, locacao, sensacao) {
  var userMessage =
    'Transforme estas escolhas em um prompt profissional:\n\n' +
    'Produto: ' + produto + '\n' +
    'Estilo: ' + estilo + '\n' +
    'Cartela de cor: ' + cor + '\n' +
    'Quem veste: ' + modelo + '\n' +
    'Locação: ' + locacao + '\n' +
    'Sensação da imagem: ' + sensacao;

  try {
    var response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      payload: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }]
      }),
      muteHttpExceptions: true
    });

    var code = response.getResponseCode();
    var body = response.getContentText();

    if (code !== 200) {
      Logger.log('Claude API HTTP ' + code + ': ' + body.substring(0, 300));
      return {
        prompt: _fallbackPrompt(produto, estilo, cor, modelo, locacao, sensacao),
        source: 'fallback',
        status: 'fallback_backend_http_' + code
      };
    }

    var parsed = JSON.parse(body);

    if (!parsed.content || !parsed.content[0] || !parsed.content[0].text) {
      Logger.log('Claude API resposta sem content: ' + body.substring(0, 300));
      return {
        prompt: _fallbackPrompt(produto, estilo, cor, modelo, locacao, sensacao),
        source: 'fallback',
        status: 'fallback_backend_empty_response'
      };
    }

    return {
      prompt: parsed.content[0].text.trim(),
      source: 'claude',
      status: 'generated_by_claude'
    };

  } catch (err) {
    Logger.log('Claude API exceção: ' + err.message);
    return {
      prompt: _fallbackPrompt(produto, estilo, cor, modelo, locacao, sensacao),
      source: 'fallback',
      status: 'fallback_backend_exception'
    };
  }
}


// ==============================
// FALLBACK (se Claude falhar)
// ==============================
function _fallbackPrompt(produto, estilo, cor, modelo, locacao, sensacao) {
  return 'fashion editorial, ' + modelo + ' wearing ' + produto + ', ' +
    estilo + ', ' + cor + ' color palette, set in ' + locacao +
    ', evoking ' + sensacao + ', shot on Hasselblad H6D, 100mm lens, ' +
    'ultra high resolution, natural skin texture, fabric texture detail, ' +
    'professional fashion photography --ar 2:3';
}


// ==============================
// GOOGLE SHEETS
// ==============================
function _salvarNoSheets(nome, email, produto, estilo, cor, modelo, locacao, sensacao, promptSimples, promptCompleto, status) {
  try {
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Prompts');
    if (!sheet) {
      Logger.log('Aba "Prompts" não encontrada na planilha');
      return;
    }
    sheet.appendRow([
      new Date().toISOString(),  // A: Timestamp
      nome,                      // B: Nome
      email,                     // C: Email
      produto,                   // D: Produto
      estilo,                    // E: Estilo
      cor,                       // F: Cartela de Cor
      modelo,                    // G: Quem Veste
      locacao,                   // H: Locação
      sensacao,                  // I: Sensação
      promptSimples,             // J: Prompt Simples EN
      promptCompleto,            // K: Prompt Completo EN (Claude)
      status                     // L: Status
    ]);
  } catch (err) {
    Logger.log('Sheets erro: ' + err.message);
  }
}

function _salvarErro(nome, email, mensagem) {
  try {
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Prompts');
    if (!sheet) return;
    sheet.appendRow([
      new Date().toISOString(),
      nome || '',
      email || '',
      '', '', '', '', '', '',
      mensagem,
      'error'
    ]);
  } catch (err) {
    Logger.log('Sheets erro ao salvar erro: ' + err.message);
  }
}


// ==============================
// HELPERS
// ==============================
function _json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function _trim(val) {
  return (val || '').toString().trim();
}
1