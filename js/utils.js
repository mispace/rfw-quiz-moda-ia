/* ========================================
   RFW Quiz Moda IA - Utilities
   ======================================== */

const Utils = {
  /**
   * Select a DOM element
   */
  $(selector) {
    return document.querySelector(selector);
  },

  /**
   * Select all DOM elements
   */
  $$(selector) {
    return document.querySelectorAll(selector);
  },

  /**
   * Basic email validation
   */
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  /**
   * Copy text to clipboard
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return true;
      } catch {
        document.body.removeChild(textarea);
        return false;
      }
    }
  },

  /**
   * Generate placeholder SVG data URL for option cards
   */
  generatePlaceholder(text, hue) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:hsl(${hue},25%,22%)"/>
          <stop offset="100%" style="stop-color:hsl(${hue},30%,16%)"/>
        </linearGradient>
      </defs>
      <rect width="300" height="400" fill="url(#g)"/>
      <text x="150" y="190" text-anchor="middle" fill="rgba(255,255,255,0.15)" font-family="sans-serif" font-size="14" font-weight="600">${text}</text>
    </svg>`;
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  },

  /**
   * Simple hash for caching
   */
  hashChoices(choices) {
    return `${choices.estilo}|${choices.look}|${choices.atitude}|${choices.mundo}`;
  },

  /**
   * Debounce function
   */
  debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  /**
   * Preload an image
   */
  preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = reject;
      img.src = src;
    });
  },

  /**
   * Loading phrases
   */
  loadingPhrases: [
    'Desenhando seu prompt...',
    'Costurando suas escolhas...',
    'Ajustando o caimento perfeito...',
    'Escolhendo a luz ideal...',
    'Preparando o editorial...',
    'Montando o look na passarela...',
    'Finalizando os detalhes...',
    'Criando algo único para você...'
  ],

  /**
   * Get random loading phrase
   */
  getRandomPhrase() {
    return this.loadingPhrases[Math.floor(Math.random() * this.loadingPhrases.length)];
  }
};
