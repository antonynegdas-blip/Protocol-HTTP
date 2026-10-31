export class ControlsUI {
  constructor({ steps, stepAnimator, sceneManager }) {
    this.steps = steps;
    this.animator = stepAnimator;
    this.sceneManager = sceneManager;

    this.currentIndex = 0;
    this.labelsVisible = true;
    this.hudCompact = false;

    this.dockEl = document.getElementById('step-dock');
    this.badgeEl = document.getElementById('step-badge');
    this.tagEl = document.getElementById('step-tag');
    this.titleEl = document.getElementById('step-title');
    this.captionEl = document.getElementById('step-caption');
    this.subActionsEl = document.getElementById('step-subactions');
    this.dotsContainer = document.getElementById('step-dots');

    this.btnPrev = document.getElementById('btn-prev');
    this.btnNext = document.getElementById('btn-next');
    this.btnReplay = document.getElementById('btn-replay');
    this.btnCamera = document.getElementById('btn-camera');
    this.btnLabels = document.getElementById('btn-labels');
    this.btnHudToggle = document.getElementById('btn-hud-toggle');

    this.buildDots();
    this.bindEvents();
    this.syncUI(0);
  }

  buildDots() {
    this.dotsContainer.innerHTML = '';
    this.dotButtons = this.steps.map((step, idx) => {
      const dot = document.createElement('button');
      dot.className = 'step-dot';
      dot.type = 'button';
      dot.title = step.title;
      dot.setAttribute('aria-label', step.title);
      dot.addEventListener('click', () => this.selectStep(idx));
      this.dotsContainer.appendChild(dot);
      return dot;
    });
  }

  bindEvents() {
    this.btnPrev.addEventListener('click', () => {
      if (this.currentIndex > 0) {
        this.selectStep(this.currentIndex - 1, false);
      }
    });

    this.btnNext.addEventListener('click', () => {
      if (this.currentIndex < this.steps.length - 1) {
        this.selectStep(this.currentIndex + 1, false);
      } else {
        this.selectStep(0, false);
      }
    });

    this.btnReplay.addEventListener('click', () => {
      this.animator.replayCurrentStep();
    });

    this.btnCamera.addEventListener('click', () => {
      this.animator.resetCameraOnly();
    });

    this.btnLabels.addEventListener('click', () => {
      this.toggleLabels();
    });

    this.btnHudToggle.addEventListener('click', () => {
      this.toggleHudCompact();
    });

    window.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;

      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        this.btnNext.click();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.btnPrev.click();
      } else if (e.key === 'r' || e.key === 'R') {
        this.animator.replayCurrentStep();
      } else if (e.key === 'c' || e.key === 'C') {
        this.animator.resetCameraOnly();
      } else if (e.key === 'l' || e.key === 'L') {
        this.toggleLabels();
      } else if (e.key === 'h' || e.key === 'H') {
        this.toggleHudCompact();
      }
    });
  }

  toggleLabels() {
    this.labelsVisible = !this.labelsVisible;
    this.sceneManager.setLabelsVisible(this.labelsVisible);
    this.btnLabels.classList.toggle('active', this.labelsVisible);
  }

  toggleHudCompact() {
    this.hudCompact = !this.hudCompact;
    this.dockEl.classList.toggle('compact', this.hudCompact);
    this.btnHudToggle.textContent = this.hudCompact ? '▴ Mostrar Legenda' : '▾ Legenda';
  }

  selectStep(index, flyCamera = true) {
    this.currentIndex = index;
    this.animator.goToStep(index, flyCamera);
    this.syncUI(index);
  }

  syncUI(index) {
    const step = this.steps[index];
    const total = this.steps.length;
    const numStr = String(index + 1).padStart(2, '0');
    const totStr = String(total).padStart(2, '0');

    this.badgeEl.textContent = `PASSO ${numStr} / ${totStr}`;
    this.tagEl.textContent = step.tag;
    this.titleEl.textContent = step.title;
    this.captionEl.textContent = step.caption;

    this.btnPrev.disabled = index === 0;
    if (index === total - 1) {
      this.btnNext.textContent = '↻ Reiniciar do Passo 1';
    } else {
      this.btnNext.textContent = 'Próximo Passo →';
    }

    this.dotButtons.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === index);
      dot.classList.toggle('completed', idx < index);
    });

    // Sub-ações interativas 3D opcionais (ex: testar cada verbo HTTP ou Status Code)
    this.subActionsEl.innerHTML = '';
    if (step.subActions && step.subActions.length > 0) {
      this.subActionsEl.classList.remove('hidden');
      step.subActions.forEach((act, aIdx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'sub-pill' + (aIdx === 0 && act.id === 'ALL' ? ' active' : '');
        btn.style.setProperty('--pill-color', act.color);
        btn.textContent = act.label;
        btn.addEventListener('click', () => {
          Array.from(this.subActionsEl.children).forEach((el) => el.classList.remove('active'));
          btn.classList.add('active');
          this.animator.triggerSubAction(act.id);
        });
        this.subActionsEl.appendChild(btn);
      });
    } else {
      this.subActionsEl.classList.add('hidden');
    }
  }
}
