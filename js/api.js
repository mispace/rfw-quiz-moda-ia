/* ========================================
   RFW Quiz Moda IA - API Integration
   Arquitetura: Frontend → Google Apps Script → Claude API + Sheets
   Zero API keys no navegador.
   ======================================== */

const API = {
  // URL pública do Google Apps Script — única config do frontend
  backendUrl: '',

  // Cache por sessão (mesmas escolhas = mesmo prompt, sem nova chamada)
  _cache: new Map(),

  // Timeout para chamada ao backend (ms)
  TIMEOUT_MS: 30000,

  /**
   * Inicializa com a URL do backend
   */
  init(config) {
    if (config && config.backendUrl) {
      this.backendUrl = config.backendUrl;
    }
  },

  /**
   * Envia dados ao backend e recebe { success, prompt, source }
   * UMA chamada faz tudo: gera prompt + salva no Sheets
   *
   * @param {Object} payload - { nome, email, choices: {estilo, look, atitude, mundo} }
   * @returns {Object} { prompt: string, source: 'claude'|'fallback_backend'|'fallback_local' }
   */
  async generatePrompt(payload) {
    const cacheKey = Utils.hashChoices(payload.choices);

    if (this._cache.has(cacheKey)) {
      return this._cache.get(cacheKey);
    }

    // Sem backend → fallback local direto
    if (!this.backendUrl) {
      console.warn('Backend URL não configurada — usando gerador local.');
      return this._fallbackLocal(payload.choices);
    }

    try {
      const result = await this._callBackend(payload);
      this._cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.warn('Erro na comunicação com o backend:', error.message);
      return this._fallbackLocal(payload.choices);
    }
  },

  /**
   * POST ao Google Apps Script com timeout e proteção contra HTML/erro
   */
  async _callBackend(payload) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

    let response;
    try {
      response = await fetch(this.backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          nome: payload.nome,
          email: payload.email,
          produto: payload.choices.produto,
          estilo: payload.choices.estilo,
          cor: payload.choices.cor,
          modelo: payload.choices.modelo,
          locacao: payload.choices.locacao,
          sensacao: payload.choices.sensacao
        }),
        signal: controller.signal
      });
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Timeout: backend não respondeu em ' + (this.TIMEOUT_MS / 1000) + 's');
      }
      throw err;
    }
    clearTimeout(timeoutId);

    // Ler corpo como texto primeiro — protege contra HTML inesperado
    const rawText = await response.text();

    if (!response.ok) {
      throw new Error('Backend HTTP ' + response.status + ': ' + rawText.substring(0, 200));
    }

    // Tentar parsear JSON
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (parseErr) {
      // Backend retornou algo que não é JSON (ex: página de erro HTML do Google)
      throw new Error('Resposta não é JSON: ' + rawText.substring(0, 120));
    }

    if (!data.success || !data.prompt) {
      throw new Error(data.error || 'Resposta inválida do backend');
    }

    return {
      prompt: data.prompt,
      source: data.source || 'backend'
    };
  },

  /**
   * Fallback local — gera prompt no navegador, sem API
   * Usado quando: backend offline, sem URL, timeout, ou resposta inválida
   */
  _fallbackLocal(choices) {
    const prompt = 'fashion editorial, ' + choices.modelo +
      ' wearing ' + choices.produto + ', ' + choices.estilo + ', ' +
      choices.cor + ' color palette, set in ' + choices.locacao +
      ', evoking ' + choices.sensacao + ', shot on Hasselblad H6D, 100mm lens, ' +
      'ultra high resolution, natural skin texture, fabric texture detail, ' +
      'professional fashion photography --ar 2:3';

    const result = { prompt: prompt, source: 'fallback_local' };
    const cacheKey = Utils.hashChoices(choices);
    this._cache.set(cacheKey, result);
    return result;
  },

  /**
   * 10 prompts de backup pré-gerados (contingência total para evento)
   */
  backupPrompts: [
    'Fashion editorial photograph, modern minimalist style, flowing long dress in ivory silk with asymmetric draping and clean architectural lines, full garment view, floating ethereally suspended in air, refined understated elegance, infinite white studio background with soft diffused lighting, ultra high resolution, sharp textile details, professional editorial photography --ar 2:3 --style raw --v 6.1',
    'Fashion editorial photograph, futuristic tech style, structured metallic blazer with holographic finish and geometric panels, full garment view, static frontal editorial pose with powerful stance, cutting-edge sophistication, minimalist industrial loft with concrete walls and cool blue ambient light, ultra high resolution, crisp details, cinematic fashion photography --ar 2:3 --style raw --v 6.1',
    'Fashion editorial photograph, romantic ethereal style, flowing tulle gown in soft blush pink with layered organza and delicate embroidery, full garment view, spinning in circular motion with fabric flowing outward, dreamlike feminine grace, lush Brazilian tropical garden with exuberant greenery, ultra high resolution, soft focus details, editorial fashion photography --ar 2:3 --style raw --v 6.1',
    'Fashion editorial photograph, vintage classic style, tailored trench coat in warm camel cashmere with structured shoulders and cinched belt, full garment view, walking confidently with purpose, timeless Hollywood glamour, Milan street during golden hour with chic European architecture, ultra high resolution, warm tonal details, professional editorial photography --ar 2:3 --style raw --v 6.1',
    'Fashion editorial photograph, urban streetwear style, oversized leather bomber jacket with bold graphic details, full garment view, dramatic movement with hair and fabric in wind, confident street energy, colorful Rio de Janeiro street with traditional tiles, ultra high resolution, sharp details, contemporary fashion photography --ar 2:3 --style raw --v 6.1',
    'Fashion editorial photograph, haute couture editorial style, sculptural one-piece with origami folds in midnight blue silk, full garment view, body positioned diagonally with dynamic visual tension, dramatic artistic elegance, contemporary art gallery with white walls and geometric architecture, ultra high resolution, sharp details, high fashion photography --ar 2:3 --style raw --v 6.1',
    'Fashion editorial photograph, boho artistic style, textured knit matching set in warm terracotta with artisan macrame details, full garment view, arms raised celebrating freedom, free-spirited bohemian joy, deserted monochromatic beach with sand and sky minimalism, ultra high resolution, natural texture details, editorial fashion photography --ar 2:3 --style raw --v 6.1',
    'Fashion editorial photograph, timeless luxury style, monochromatic matching set in rich burgundy wool with impeccable tailoring, full garment view, seated elegantly with relaxed sophistication, refined classic presence, rooftop at sunset with dramatic sky silhouette, ultra high resolution, sharp details, professional editorial photography --ar 2:3 --style raw --v 6.1',
    'Fashion editorial photograph, avant-garde experimental style, deconstructed asymmetric dress with exposed seams and mixed fabrics, full garment view, extreme close-up on texture and material detail, conceptual design innovation, surreal salt desert with expansive natural texture, ultra high resolution, intricate material details, artistic fashion photography --ar 2:3 --style raw --v 6.1',
    'Fashion editorial photograph, neo-traditional Brazilian style, structured wide-leg jumpsuit with tropical print in vibrant green and gold, full garment view, looking back over shoulder with mysterious narrative, contemporary cultural fusion, Rio Fashion Week runway with dramatic spotlights, ultra high resolution, vivid color details, professional editorial photography --ar 2:3 --style raw --v 6.1'
  ],

  /**
   * Retorna prompt backup aleatório (contingência se tudo falhar)
   */
  getBackupPrompt() {
    return {
      prompt: this.backupPrompts[Math.floor(Math.random() * this.backupPrompts.length)],
      source: 'backup_local'
    };
  }
};
