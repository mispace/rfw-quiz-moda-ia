/* ========================================
   RFW Quiz Moda IA - Main Quiz Logic
   ======================================== */

const Quiz = {
  // Total steps
  TOTAL_STEPS: 6,

  // State
  currentStep: 0,
  userData: { nome: '', email: '' },
  choices: { produto: '', estilo: '', cor: '', modelo: '', locacao: '', sensacao: '' },
  choiceLabels: { produto: '', estilo: '', cor: '', modelo: '', locacao: '', sensacao: '' },
  generatedPrompt: '',
  promptSource: '',

  // Quiz data — 6 passos, 10 opcoes cada
  steps: [
    {
      key: 'produto',
      title: 'ESCOLHA O PRODUTO',
      subtitle: 'Qual peca de roupa voce quer criar?',
      options: [
        { id: 'vestido-curto', label: 'Vestido Curto', value: 'short cocktail dress', emoji: '👗' },
        { id: 'vestido-longo', label: 'Vestido Longo', value: 'long flowing gown', emoji: '👗' },
        { id: 'macacao', label: 'Macacão', value: 'structured jumpsuit', emoji: '🩱' },
        { id: 'calca-blusa-jaqueta', label: 'Calça, Blusa e Jaqueta', value: 'pants, blouse and jacket ensemble', emoji: '🧥' },
        { id: 'shorts-camisa', label: 'Shorts e Camisa', value: 'shorts and shirt set', emoji: '👕' },
        { id: 'bermuda-blusa', label: 'Bermuda e Blusa', value: 'bermuda shorts and blouse', emoji: '👚' },
        { id: 'saia-blusa', label: 'Saia Curta e Blusa', value: 'short skirt and blouse', emoji: '👗' },
        { id: 'camisa-saia', label: 'Camisa e Saia', value: 'oversized shirt and skirt', emoji: '👔' },
        { id: 'jaqueta-shorts', label: 'Jaqueta e Shorts', value: 'jacket and shorts combination', emoji: '🧥' },
        { id: 'calca-blusa', label: 'Calça e Blusa', value: 'tailored pants and elegant blouse', emoji: '👖' }
      ]
    },
    {
      key: 'estilo',
      title: 'ESCOLHA O ESTILO',
      subtitle: 'Qual estetica define sua criacao?',
      options: [
        { id: 'casual', label: 'Casual', value: 'casual relaxed style', emoji: '😎' },
        { id: 'esportivo', label: 'Esportivo', value: 'sporty athletic style', emoji: '⚡' },
        { id: 'romantico', label: 'Romântico', value: 'romantic ethereal style', emoji: '🌸' },
        { id: 'futurista-tech', label: 'Futurista Tech', value: 'futuristic tech style', emoji: '🔮' },
        { id: 'criativo', label: 'Criativo', value: 'creative avant-garde style', emoji: '🎨' },
        { id: 'minimalista', label: 'Minimalista', value: 'minimalist clean style', emoji: '◻️' },
        { id: 'vintage', label: 'Vintage', value: 'vintage retro style', emoji: '📷' },
        { id: 'boho-chic', label: 'Boho Chic', value: 'bohemian chic style', emoji: '🌿' },
        { id: 'classico', label: 'Clássico', value: 'classic timeless style', emoji: '✨' },
        { id: 'street-style', label: 'Street Style', value: 'urban street style', emoji: '🏙️' }
      ]
    },
    {
      key: 'cor',
      title: 'ESCOLHA A CARTELA DE COR',
      subtitle: 'Qual paleta de cores voce imagina?',
      options: [
        { id: 'tons-neutros', label: 'Tons Neutros', value: 'neutral tones palette', emoji: '🤍' },
        { id: 'tons-pasteis', label: 'Tons Pastéis', value: 'soft pastel colors', emoji: '🩷' },
        { id: 'monocromatico', label: 'Monocromático', value: 'monochromatic single-tone palette', emoji: '⬛' },
        { id: 'tons-vibrantes', label: 'Tons Vibrantes', value: 'vibrant bold colors', emoji: '🌈' },
        { id: 'tons-terrosos', label: 'Tons Terrosos', value: 'earthy warm tones', emoji: '🤎' },
        { id: 'neutros-quentes', label: 'Neutros Quentes', value: 'warm neutral tones', emoji: '🧡' },
        { id: 'pasteis-terrosos', label: 'Pastéis Terrosos', value: 'dusty earthy pastels', emoji: '🌾' },
        { id: 'metalicos', label: 'Metálicos', value: 'metallic gold silver chrome tones', emoji: '🪙' },
        { id: 'iridescente', label: 'Iridescente', value: 'iridescent holographic shifting colors', emoji: '🫧' },
        { id: 'cores-primarias', label: 'Cores Primárias', value: 'bold primary colors red blue yellow', emoji: '🔴' }
      ]
    },
    {
      key: 'modelo',
      title: 'QUEM VESTE?',
      subtitle: 'Escolha quem vai usar sua criacao.',
      options: [
        { id: 'mulher-negra', label: 'Mulher Negra', value: 'beautiful Black woman', emoji: '👩🏿' },
        { id: 'homem-negro', label: 'Homem Negro', value: 'handsome Black man', emoji: '👨🏿' },
        { id: 'mulher-branca', label: 'Mulher Branca', value: 'beautiful Caucasian woman', emoji: '👩🏻' },
        { id: 'homem-branco', label: 'Homem Branco', value: 'handsome Caucasian man', emoji: '👨🏻' },
        { id: 'mulher-oriental', label: 'Mulher Oriental', value: 'beautiful East Asian woman', emoji: '👩🏻' },
        { id: 'homem-oriental', label: 'Homem Oriental', value: 'handsome East Asian man', emoji: '👨🏻' },
        { id: 'mulher-alienigena', label: 'Mulher Alienígena', value: 'alien woman with blue-green skin tone and large dark eyes, full body editorial pose', emoji: '👽' },
        { id: 'homem-alienigena', label: 'Homem Alienígena', value: 'alien man with blue-green skin tone and large dark eyes, full body editorial pose', emoji: '👽' },
        { id: 'mulher-albina', label: 'Mulher Albina', value: 'beautiful albino woman with white hair', emoji: '🤍' },
        { id: 'homem-albino', label: 'Homem Albino', value: 'handsome albino man with white hair', emoji: '🤍' }
      ]
    },
    {
      key: 'locacao',
      title: 'ESCOLHA A LOCAÇÃO',
      subtitle: 'Onde sua imagem ganha vida?',
      options: [
        { id: 'planeta-marte', label: 'Planeta Marte', value: 'Mars planet surface, red desert terrain, alien sky', emoji: '🔴' },
        { id: 'passarela-desfile', label: 'Passarela de Desfile', value: 'fashion runway with dramatic spotlights', emoji: '✨' },
        { id: 'rooftop-por-do-sol', label: 'Pôr do Sol no Rooftop', value: 'rooftop at sunset with dramatic sky and city skyline', emoji: '🌅' },
        { id: 'noite-em-festa', label: 'Noite em Festa', value: 'glamorous nightlife party with neon lights', emoji: '🪩' },
        { id: 'jardim', label: 'Jardim', value: 'lush garden with blooming flowers and dappled sunlight', emoji: '🌿' },
        { id: 'galeria-de-arte', label: 'Galeria de Arte', value: 'contemporary art gallery with white walls', emoji: '🖼️' },
        { id: 'parede-grafitti', label: 'Parede de Grafitti', value: 'vibrant graffiti wall backdrop, bold street art', emoji: '🎨' },
        { id: 'festival-anos-70', label: 'Festival nos Anos 70', value: '1970s music festival atmosphere, retro bohemian', emoji: '✌️' },
        { id: 'lua', label: 'Lua', value: 'lunar surface with Earth visible in black sky', emoji: '🌙' },
        { id: 'praia', label: 'Praia', value: 'pristine beach with turquoise water and golden light', emoji: '🏖️' }
      ]
    },
    {
      key: 'sensacao',
      title: 'ESCOLHA A SENSAÇÃO',
      subtitle: 'Qual sentimento sua imagem transmite?',
      options: [
        { id: 'leveza', label: 'Leveza', value: 'feeling of lightness, floating fabrics, airy atmosphere', emoji: '🕊️' },
        { id: 'desejo', label: 'Desejo', value: 'feeling of desire, sensual warmth, rich velvet tones', emoji: '🔥' },
        { id: 'felicidade', label: 'Felicidade', value: 'feeling of happiness, bright warm energy, joyful radiance', emoji: '😊' },
        { id: 'glamour', label: 'Glamour', value: 'feeling of glamour, crystal sparkle, Hollywood opulence', emoji: '💎' },
        { id: 'inovacao-futuro', label: 'Inovação / Futuro', value: 'feeling of innovation, holographic light, cutting-edge technology', emoji: '🚀' },
        { id: 'rebeldia', label: 'Rebeldia', value: 'feeling of rebellion, punk energy, raw defiance', emoji: '⚡' },
        { id: 'sofisticacao', label: 'Sofisticação', value: 'feeling of sophistication, refined elegance, quiet luxury', emoji: '🥂' },
        { id: 'conforto', label: 'Conforto', value: 'feeling of comfort, soft textures, cozy warmth', emoji: '☁️' },
        { id: 'fantasia', label: 'Fantasia', value: 'feeling of fantasy, magical sparkle, enchanted dreamworld', emoji: '🦋' },
        { id: 'liberdade', label: 'Liberdade', value: 'feeling of freedom, vast open sky, windblown movement', emoji: '🌊' }
      ]
    }
  ],

  /**
   * Initialize the quiz
   */
  init() {
    this._loadConfig();
    this._bindEvents();
    this._createParticles();
    this._initMouseTrail();
  },

  /**
   * Load backend URL from config.js
   */
  _loadConfig() {
    if (typeof CONFIG !== 'undefined') {
      API.init({ backendUrl: CONFIG.backendUrl || '' });
    }
  },

  /**
   * Bind all event listeners
   */
  _bindEvents() {
    // Welcome form
    const form = Utils.$('#form-welcome');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this._handleWelcomeSubmit();
    });

    // Back button
    Utils.$('#btn-voltar').addEventListener('click', () => this._goBack());

    // Copy button
    Utils.$('#btn-copy').addEventListener('click', () => this._copyPrompt());

    // New prompt button
    Utils.$('#btn-novo').addEventListener('click', () => this._restart());

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.currentStep > 0 && this.currentStep <= 4) {
        this._goBack();
      }
    });
  },

  /**
   * Handle welcome form submission
   */
  _handleWelcomeSubmit() {
    const nome = Utils.$('#input-nome').value.trim();
    const email = Utils.$('#input-email').value.trim();

    // Validate
    let valid = true;

    if (!nome) {
      Utils.$('#input-nome').classList.add('error');
      valid = false;
    } else {
      Utils.$('#input-nome').classList.remove('error');
    }

    if (!email || !Utils.isValidEmail(email)) {
      Utils.$('#input-email').classList.add('error');
      valid = false;
    } else {
      Utils.$('#input-email').classList.remove('error');
    }

    if (!valid) return;

    this.userData = { nome, email };
    this.currentStep = 1;
    this._showQuizStep(1);
    this._switchScreen('screen-quiz');
  },

  /**
   * Show a specific quiz step
   */
  _showQuizStep(step) {
    const stepData = this.steps[step - 1];
    const progress = Math.round((step / this.TOTAL_STEPS) * 100);

    // Update progress
    Utils.$('#progress-label').textContent = `${progress}%`;
    Utils.$('#progress-fill').style.width = `${progress}%`;
    Utils.$('#step-indicator').textContent = `PASSO ${step} DE ${this.TOTAL_STEPS}`;
    Utils.$('#step-title').textContent = stepData.title;

    // Update step nav
    this._updateStepNav(step);

    // Build options grid
    const grid = Utils.$('#options-grid');
    grid.innerHTML = '';

    stepData.options.forEach((option) => {
      const card = document.createElement('div');
      card.className = 'option-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', option.label);
      card.dataset.value = option.value;
      card.dataset.id = option.id;
      card.dataset.label = option.label;

      const imgSrc = `assets/images/${stepData.key}/${option.id}.jpg`;
      const imgTopIds = ['mulher-alienigena'];
      const imgClass = 'option-image' + (imgTopIds.includes(option.id) ? ' img-top' : '');

      card.innerHTML = `
        <div class="option-placeholder">${option.emoji}</div>
        <img class="${imgClass}" src="${imgSrc}" alt="${option.label}" loading="lazy"
             onerror="this.style.display='none'; this.previousElementSibling.style.display='flex';"
             onload="this.previousElementSibling.style.display='none';">
        <div class="option-label">${option.label}</div>
        <div class="check-overlay">
          <div class="check-icon">
            <span class="material-symbols-rounded" style="font-variation-settings:'FILL' 1;font-size:20px;color:white;">check</span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => this._selectOption(card, stepData.key, option));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this._selectOption(card, stepData.key, option);
        }
      });

      grid.appendChild(card);
    });
  },

  /**
   * Update step navigation indicator
   */
  _updateStepNav(activeStep) {
    for (let i = 1; i <= this.TOTAL_STEPS; i++) {
      const el = Utils.$(`#step-nav-${i}`);
      if (!el) continue;
      if (i === activeStep) {
        el.classList.add('text-primary', 'border-primary');
        el.classList.remove('text-slate-400', 'border-transparent');
      } else if (i < activeStep) {
        el.classList.add('text-primary/60', 'border-transparent');
        el.classList.remove('text-primary', 'border-primary', 'text-slate-400');
      } else {
        el.classList.add('text-slate-400', 'border-transparent');
        el.classList.remove('text-primary', 'border-primary', 'text-primary/60');
      }
    }
  },

  /**
   * Handle option selection
   */
  _selectOption(card, key, option) {
    // Mark selected
    Utils.$$('.option-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');

    // Store choice
    this.choices[key] = option.value;
    this.choiceLabels[key] = option.label;

    // Auto-advance after delay
    setTimeout(() => {
      if (this.currentStep < this.TOTAL_STEPS) {
        this.currentStep++;
        this._showQuizStep(this.currentStep);
        // Scroll to top of quiz
        Utils.$('#screen-quiz').scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // All steps complete, generate prompt
        this._generateAndShowResult();
      }
    }, 600);
  },

  /**
   * Go back one step
   */
  _goBack() {
    if (this.currentStep <= 1) {
      this.currentStep = 0;
      this._switchScreen('screen-welcome');
      return;
    }

    this.currentStep--;
    this._showQuizStep(this.currentStep);
  },

  /**
   * Generate prompt and show result
   */
  async _generateAndShowResult() {
    // Show loading
    this._switchScreen('screen-loading');
    this._startLoadingAnimation();

    const startTime = Date.now();

    try {
      // Uma chamada ao backend: gera prompt via Claude + salva no Sheets
      const result = await API.generatePrompt({
        nome: this.userData.nome,
        email: this.userData.email,
        choices: this.choices
      });
      this.generatedPrompt = result.prompt;
      this.promptSource = result.source;
    } catch (error) {
      console.error('Error generating prompt:', error);
      const backup = API.getBackupPrompt();
      this.generatedPrompt = backup.prompt;
      this.promptSource = backup.source;
    }

    // Ensure minimum 2s loading time
    const elapsed = Date.now() - startTime;
    if (elapsed < 2000) {
      await new Promise(resolve => setTimeout(resolve, 2000 - elapsed));
    }

    // Show result
    this._showResult();
  },

  /**
   * Start loading screen animation
   */
  _startLoadingAnimation() {
    let progress = 0;
    const fill = Utils.$('#loading-progress-fill');
    const label = Utils.$('#loading-progress-label');
    const phraseEl = Utils.$('#loading-phrase');

    // Reset
    fill.style.width = '0%';
    label.textContent = '0%';

    // Phrase rotation (subtitle + title)
    const titleEl = Utils.$('#loading-title');
    const titles = ['Desenhando seu prompt...', 'Costurando suas escolhas...', 'Montando seu editorial...'];
    let titleIndex = 0;

    phraseEl.textContent = Utils.getRandomPhrase();
    if (titleEl) titleEl.textContent = titles[0];

    this._phraseInterval = setInterval(() => {
      phraseEl.style.opacity = '0';
      setTimeout(() => {
        phraseEl.textContent = Utils.getRandomPhrase();
        phraseEl.style.opacity = '1';
      }, 300);

      if (titleEl) {
        titleIndex = (titleIndex + 1) % titles.length;
        titleEl.style.opacity = '0';
        setTimeout(() => {
          titleEl.textContent = titles[titleIndex];
          titleEl.style.opacity = '1';
        }, 300);
      }
    }, 2500);

    // Progress animation
    this._progressInterval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress > 95) progress = 95;
      fill.style.width = `${progress}%`;
      label.textContent = `${Math.round(progress)}%`;
    }, 400);
  },

  /**
   * Stop loading animation
   */
  _stopLoadingAnimation() {
    clearInterval(this._phraseInterval);
    clearInterval(this._progressInterval);

    const fill = Utils.$('#loading-progress-fill');
    const label = Utils.$('#loading-progress-label');
    fill.style.width = '100%';
    label.textContent = '100%';
  },

  /**
   * Show result screen
   */
  _showResult() {
    this._stopLoadingAnimation();

    // Build the visible prompt in PT with highlighted choices + tooltips
    const L = this.choiceLabels;
    const tip = (text, category) =>
      `<strong class="text-primary cursor-help border-b border-dotted border-primary/40 relative group">${text}<span class="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-on-surface text-white text-[0.5rem] font-normal tracking-wide opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">${category}</span></strong>`;

    // Camera per style
    const cameras = {
      'Casual': 'Canon EOS R5',
      'Esportivo': 'Sony A7 IV',
      'Romântico': 'Canon EOS R5 com lente 85mm soft focus',
      'Futurista Tech': 'Sony A1',
      'Criativo': 'Leica SL2',
      'Minimalista': 'Hasselblad X2D',
      'Vintage': 'Fujifilm X-T5 com simulacao de filme',
      'Boho Chic': 'Canon EOS R5 com luz natural',
      'Clássico': 'Hasselblad H6D',
      'Street Style': 'Canon G7X com flash'
    };
    const camera = cameras[L.estilo] || 'Hasselblad H6D';

    // Preposicao para locacao
    const prep = this._preposicaoLocacao(L.locacao);

    const promptPT_HTML =
      `Editorial de moda hiper-realista com ${tip(L.modelo, 'Modelo')} em alta definicao, ` +
      `vestindo ${tip(L.produto, 'Produto')} com caimento e texturas realistas. ` +
      `O tecido das roupas sera nos tons ${tip(L.cor, 'Cor')} e o estilo ${tip(L.estilo, 'Estilo')}. ` +
      `O editorial foi feito ${prep} ${tip(L.locacao, 'Locacao')} e transmite a sensacao de ${tip(L.sensacao, 'Sensacao')}. ` +
      `Foto tirada por uma ${camera}.` +
      `<span class="block mt-2 pt-2 border-t border-primary/10 text-[0.6rem] text-on-surface-variant font-normal not-italic">Tamanho: 2:3 (vertical/retrato)</span>`;

    // Plain text version for clipboard (works well in Gemini)
    const promptPT_plain =
      `Editorial de moda hiper-realista com ${L.modelo} em alta definicao, ` +
      `vestindo ${L.produto} com caimento e texturas realistas. ` +
      `O tecido das roupas sera nos tons ${L.cor} e o estilo ${L.estilo}. ` +
      `O editorial foi feito ${prep} ${L.locacao} e transmite a sensacao de ${L.sensacao}. ` +
      `Foto tirada por uma ${camera}. Tamanho: 2:3`;

    // Show PT version to user (with HTML formatting)
    Utils.$('#prompt-text').innerHTML = promptPT_HTML;

    // Store versions
    this._promptEN = this.generatedPrompt;  // Full Claude EN (for spreadsheet)
    this._promptPT = promptPT_plain;         // PT plain (for clipboard)

    // Fill user name
    const nameEl = Utils.$('#result-user-name');
    if (nameEl) {
      const firstName = this.userData.nome.split(' ')[0];
      nameEl.textContent = firstName;
    }

    // Fill choices summary as tags
    const choicesContainer = Utils.$('#result-choices');
    const categories = {
      produto: 'Produto',
      estilo: 'Estilo',
      cor: 'Cor',
      modelo: 'Modelo',
      locacao: 'Locacao',
      sensacao: 'Sensacao'
    };

    choicesContainer.innerHTML = Object.entries(categories).map(([key, label], i) =>
      `<div class="choice-tag-animated inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/8 border border-primary/15 font-body text-[0.55rem] font-bold tracking-wide" style="animation-delay: ${0.6 + i * 0.1}s;">
        <span class="text-primary uppercase">${label}:</span>
        <span class="text-on-surface">${this.choiceLabels[key]}</span>
      </div>`
    ).join('');

    // Reset copy button
    Utils.$('#copy-label').textContent = 'COPIAR';
    Utils.$('#btn-copy').classList.remove('copied');

    // Switch to result
    this._switchScreen('screen-result');

    // Trigger confetti
    this._fireConfetti();
  },

  /**
   * Mini confetti burst on result screen
   */
  _fireConfetti() {
    const canvas = Utils.$('#confetti-canvas');
    if (!canvas) return;
    canvas.style.display = 'block';
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#6448b2', '#ab8ffe', '#a02d70', '#ff8bc5', '#005da7', '#9fc6ff'];
    const particles = [];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 1) * 14 - 4,
        size: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        gravity: 0.25,
        opacity: 1
      });
    }

    let frame = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach(p => {
        p.x += p.vx;
        p.vy += p.gravity;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.opacity -= 0.008;

        if (p.opacity > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation * Math.PI / 180);
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        }
      });

      frame++;
      if (alive && frame < 180) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.display = 'none';
      }
    };
    requestAnimationFrame(animate);
  },

  /**
   * Copy prompt to clipboard
   */
  async _copyPrompt() {
    const success = await Utils.copyToClipboard(this._promptPT || this.generatedPrompt);
    const btn = Utils.$('#btn-copy');
    const label = Utils.$('#copy-label');

    if (success) {
      btn.classList.add('copied');
      label.textContent = '✓ COPIADO!';

      setTimeout(() => {
        btn.classList.remove('copied');
        label.textContent = 'COPIAR';
      }, 2500);
    }
  },

  /**
   * Restart quiz
   */
  _restart() {
    this.currentStep = 0;
    this.choices = { produto: '', estilo: '', cor: '', modelo: '', locacao: '', sensacao: '' };
    this.choiceLabels = { produto: '', estilo: '', cor: '', modelo: '', locacao: '', sensacao: '' };
    this.generatedPrompt = '';
    this.promptSource = '';

    this._switchScreen('screen-welcome');
  },

  /**
   * Switch between screens
   */
  _switchScreen(targetId) {
    const screens = Utils.$$('.screen');
    const target = Utils.$(`#${targetId}`);

    screens.forEach(screen => {
      if (screen.classList.contains('active')) {
        screen.classList.remove('active');
        screen.classList.add('slide-left');
        // Remove slide-left after transition
        setTimeout(() => {
          screen.classList.remove('slide-left');
        }, 600);
      }
    });

    // Small delay for transition effect
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        target.classList.add('active');
      });
    });
  },

  /**
   * Create floating particles for loading screen
   */
  _createParticles() {
    const container = Utils.$('#loading-particles');
    if (!container) return;

    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDuration = `${3 + Math.random() * 4}s`;
      particle.style.animationDelay = `${Math.random() * 3}s`;
      particle.style.height = `${8 + Math.random() * 16}px`;
      particle.style.opacity = `${0.1 + Math.random() * 0.3}`;
      container.appendChild(particle);
    }
  },

  /**
   * Preposicao correta para cada locacao
   */
  _preposicaoLocacao(locacao) {
    const mapa = {
      'Planeta Marte': 'no',
      'Passarela de Desfile': 'em uma',
      'Pôr do Sol no Rooftop': 'em um',
      'Noite em Festa': 'em uma',
      'Jardim': 'em um',
      'Galeria de Arte': 'em uma',
      'Parede de Grafitti': 'em uma',
      'Festival nos Anos 70': 'em um',
      'Lua': 'na',
      'Praia': 'na'
    };
    return mapa[locacao] || 'em';
  },

  /**
   * Mouse trail effect on welcome screen
   */
  _initMouseTrail() {
    const canvas = Utils.$('#mouse-trail-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const colors = ['#ab8ffe', '#ff8bc5', '#9fc6ff', '#6448b2'];
    const particles = [];
    let mouseX = 0, mouseY = 0;
    let isWelcome = true;

    const resize = () => {
      const section = Utils.$('#screen-welcome');
      if (section) {
        canvas.width = section.offsetWidth;
        canvas.height = section.offsetHeight;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    // Track screen changes
    const observer = new MutationObserver(() => {
      const welcome = Utils.$('#screen-welcome');
      isWelcome = welcome && welcome.classList.contains('active');
      if (!isWelcome) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    });
    observer.observe(Utils.$('#screen-welcome'), { attributes: true, attributeFilter: ['class'] });

    // Track mouse on welcome screen
    Utils.$('#screen-welcome').addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;

      // Spawn particles
      for (let i = 0; i < 2; i++) {
        particles.push({
          x: mouseX,
          y: mouseY,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          size: Math.random() * 4 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 1
        });
      }
    });

    // Animate
    const animate = () => {
      if (!isWelcome) {
        requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        p.size *= 0.98;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = p.life * 0.6;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Limit particles
      if (particles.length > 100) {
        particles.splice(0, particles.length - 100);
      }

      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  Quiz.init();
});
