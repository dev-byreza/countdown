/**
 * Chronos Suite - Main Application Controller (Next-Gen Modern Edition)
 */

import { CountdownTimer } from './core/timer.js';
import { StorageManager, getDefaultPresets } from './core/storage.js';
import { SoundManager } from './audio/soundManager.js';
import { BackgroundCanvas } from './vfx/background.js';
import { CelebrationVFX } from './vfx/celebration.js';
import { FlipDisplay } from './ui/flipDisplay.js';
import { RingDisplay } from './ui/ringDisplay.js';
import { KineticDisplay } from './ui/kineticDisplay.js';
import { BentoDisplay } from './ui/bentoDisplay.js';
import { encodeTimerToUrl, decodeTimerFromUrl } from './utils/urlCodec.js';

class AppController {
  constructor() {
    this.storage = new StorageManager();
    this.sound = new SoundManager();
    this.bgCanvas = new BackgroundCanvas('bg-canvas');
    this.celebration = new CelebrationVFX('celebration-canvas');

    this.flipDisplay = new FlipDisplay('display-flip');
    this.ringDisplay = new RingDisplay('display-ring');
    this.kineticDisplay = new KineticDisplay('display-kinetic');
    this.bentoDisplay = new BentoDisplay('display-bento');

    this.currentTimer = null;
    this.activeDisplayMode = 'ring';
    this.activeTheme = 'cosmic';
    this.themes = ['cosmic', 'cyberpunk', 'cupertino', 'lofi', 'zen'];

    this.timerEngine = new CountdownTimer({
      onTick: (data, isSecondChanged) => this.handleTick(data, isSecondChanged),
      onZero: () => this.handleFinish()
    });

    this.init();
  }

  init() {
    // Check if loaded from a shareable link
    const sharedTimer = decodeTimerFromUrl();
    if (sharedTimer) {
      this.currentTimer = this.storage.addTimer(sharedTimer);
      this.showToast('Event berhasil dimuat dari link share!');
    } else {
      this.currentTimer = this.storage.getActiveTimer();
    }

    this.activeDisplayMode = this.currentTimer.displayMode || 'ring';
    this.activeTheme = this.currentTimer.theme || 'cosmic';

    this.applyTheme(this.activeTheme);
    this.applyDisplayMode(this.activeDisplayMode);
    this.updateEventMetaUI();

    // Start timer engine
    this.timerEngine.setTarget(this.currentTimer.targetDate, this.currentTimer.startDate);
    this.timerEngine.start();

    // Bind event listeners & keyboard shortcuts
    this.bindEvents();
    this.renderTimerList();
    this.renderPresetsGrid();

    console.log('Chronos Suite Next-Gen initialized successfully.');
  }

  handleTick(timeData, isSecondChanged) {
    if (isSecondChanged && !timeData.isZero) {
      if (this.currentTimer.tickSound && this.currentTimer.tickSound !== 'none') {
        this.sound.playTick(this.currentTimer.tickSound);
      }
    }

    // Render active display mode
    if (this.activeDisplayMode === 'flip') {
      this.flipDisplay.update(timeData, isSecondChanged);
    } else if (this.activeDisplayMode === 'ring') {
      this.ringDisplay.update(timeData);
    } else if (this.activeDisplayMode === 'kinetic') {
      this.kineticDisplay.update(timeData, isSecondChanged);
    } else if (this.activeDisplayMode === 'bento') {
      this.bentoDisplay.update(timeData, isSecondChanged);
    }

    // Update document title with remaining countdown
    if (!timeData.isZero) {
      const formatted = `${timeData.days}d ${timeData.hours}h ${timeData.minutes}m ${timeData.seconds}s`;
      document.title = `⏱️ ${formatted} | ${this.currentTimer.title}`;
    }
  }

  handleFinish() {
    document.title = `🎉 Event Started! | ${this.currentTimer.title}`;
    const finishBanner = document.getElementById('finish-banner');
    if (finishBanner) finishBanner.classList.add('active');

    // Trigger celebration sound & visual fireworks/confetti
    this.sound.playCelebration();
    this.celebration.triggerBlast(9000);
    this.showToast('Waktu telah habis! Selebrasi dimulai 🎉', 'success');
  }

  updateEventMetaUI() {
    const titleEl = document.getElementById('event-title-text');
    const categoryEl = document.getElementById('event-category-badge');
    const dateEl = document.getElementById('event-target-formatted');

    if (titleEl) titleEl.textContent = this.currentTimer.title || 'Untitled Event';
    if (categoryEl) categoryEl.textContent = this.currentTimer.category || 'Event';
    
    if (dateEl) {
      const d = new Date(this.currentTimer.targetDate);
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      dateEl.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> ${d.toLocaleDateString('id-ID', options)}`;
    }

    // Reset finish banner
    const finishBanner = document.getElementById('finish-banner');
    if (finishBanner) finishBanner.classList.remove('active');

    // Update ambient sound
    this.sound.setAmbient(this.currentTimer.ambientSound || 'none');
  }

  applyTheme(themeName) {
    this.activeTheme = themeName;
    document.documentElement.setAttribute('data-theme', themeName);
    this.bgCanvas.setTheme(themeName);

    // Update theme selector UI
    document.querySelectorAll('.theme-option-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.themeVal === themeName);
    });

    if (this.currentTimer) {
      this.currentTimer.theme = themeName;
      this.storage.updateTimer(this.currentTimer.id, { theme: themeName });
    }
  }

  applyDisplayMode(mode) {
    this.activeDisplayMode = mode;

    document.querySelectorAll('.display-container').forEach(el => {
      el.style.display = 'none';
    });

    const activeEl = document.getElementById(`display-${mode}`);
    if (activeEl) {
      if (mode === 'bento') {
        activeEl.style.display = 'grid';
      } else {
        activeEl.style.display = 'flex';
      }
    }

    document.querySelectorAll('.mode-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    if (this.currentTimer) {
      this.currentTimer.displayMode = mode;
      this.storage.updateTimer(this.currentTimer.id, { displayMode: mode });
    }
  }

  switchTimer(timerId) {
    const timer = this.storage.timers.find(t => t.id === timerId);
    if (!timer) return;

    this.currentTimer = timer;
    this.storage.setActiveTimerId(timerId);

    this.activeDisplayMode = timer.displayMode || this.activeDisplayMode;
    this.activeTheme = timer.theme || this.activeTheme;

    this.applyTheme(this.activeTheme);
    this.applyDisplayMode(this.activeDisplayMode);
    this.updateEventMetaUI();

    this.flipDisplay.reset();
    this.timerEngine.setTarget(timer.targetDate, timer.startDate || new Date());
    this.timerEngine.start();

    this.renderTimerList();
    this.showToast(`Beralih ke: ${timer.title}`);
  }

  renderTimerList() {
    const listEl = document.getElementById('timer-list-container');
    if (!listEl) return;

    listEl.innerHTML = '';
    this.storage.timers.forEach(t => {
      const item = document.createElement('div');
      item.className = `timer-item ${t.id === this.currentTimer.id ? 'active-item' : ''}`;
      
      const targetD = new Date(t.targetDate).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      
      item.innerHTML = `
        <div style="flex: 1; cursor: pointer;" class="timer-select-area">
          <div class="timer-info-title">${t.title}</div>
          <div class="timer-info-target">🎯 ${targetD} • ${t.theme || 'cosmic'}</div>
        </div>
        <div style="display: flex; gap: 0.4rem;">
          <button class="btn btn-sm btn-delete-timer" style="color: #ff5277; padding: 0.35rem 0.7rem;" title="Hapus">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      `;

      item.querySelector('.timer-select-area').addEventListener('click', () => {
        this.switchTimer(t.id);
        this.closeModal('modal-timers');
      });

      item.querySelector('.btn-delete-timer').addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.storage.timers.length <= 1) {
          this.showToast('Minimal harus ada 1 countdown tersisa!', 'warning');
          return;
        }
        this.storage.deleteTimer(t.id);
        this.renderTimerList();
        if (this.currentTimer.id === t.id) {
          this.switchTimer(this.storage.getActiveTimer().id);
        }
        this.showToast('Countdown dihapus.');
      });

      listEl.appendChild(item);
    });
  }

  renderPresetsGrid() {
    const grid = document.getElementById('presets-grid');
    if (!grid) return;

    const presets = getDefaultPresets();
    grid.innerHTML = '';

    presets.forEach(p => {
      const card = document.createElement('div');
      card.className = 'preset-card';
      card.innerHTML = `
        <div class="preset-name">${p.title}</div>
        <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.2rem;">${p.category}</div>
      `;
      card.addEventListener('click', () => {
        const added = this.storage.addTimer(p);
        this.switchTimer(added.id);
        this.closeModal('modal-create');
        this.showToast(`Template "${p.title}" ditambahkan!`);
      });
      grid.appendChild(card);
    });
  }

  openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('active');
  }

  closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('active');
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    const icon = type === 'success' ? '🎉' : type === 'warning' ? '⚠️' : '⚡';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  bindEvents() {
    // Audio Unlock on first interaction
    document.addEventListener('click', () => this.sound.init(), { once: true });

    // Mode Switches
    document.querySelectorAll('.mode-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        this.applyDisplayMode(btn.dataset.mode);
      });
    });

    // Theme Switches
    document.querySelectorAll('.theme-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.applyTheme(btn.dataset.themeVal);
      });
    });

    // Mute / Sound Toggle
    const soundToggleBtn = document.getElementById('btn-toggle-sound');
    if (soundToggleBtn) {
      soundToggleBtn.addEventListener('click', () => {
        const isMuted = this.sound.toggleMute();
        soundToggleBtn.classList.toggle('muted', isMuted);
        soundToggleBtn.classList.toggle('sound-active', !isMuted);
        
        soundToggleBtn.innerHTML = isMuted 
          ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`
          : `<div class="sound-wave-icon"><div class="sound-wave-bar"></div><div class="sound-wave-bar"></div><div class="sound-wave-bar"></div><div class="sound-wave-bar"></div></div>`;
        
        this.showToast(isMuted ? 'Suara dimatikan (Muted)' : 'Suara aktif (Unmuted)');
      });
    }

    // Fullscreen HUD Toggle
    const fullscreenBtn = document.getElementById('btn-toggle-fullscreen');
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    }

    // Share Modal
    const shareBtn = document.getElementById('btn-share');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        const shareUrl = encodeTimerToUrl(this.currentTimer);
        const inputUrl = document.getElementById('share-url-input');
        if (inputUrl) inputUrl.value = shareUrl;
        this.openModal('modal-share');
      });
    }

    // Copy Share Link Button
    const copyLinkBtn = document.getElementById('btn-copy-share-url');
    if (copyLinkBtn) {
      copyLinkBtn.addEventListener('click', () => {
        const inputUrl = document.getElementById('share-url-input');
        if (inputUrl) {
          navigator.clipboard.writeText(inputUrl.value).then(() => {
            this.showToast('Link berhasil disalin ke clipboard! 📋', 'success');
          });
        }
      });
    }

    // Create New Countdown Button & Form
    const createBtn = document.getElementById('btn-open-create');
    if (createBtn) {
      createBtn.addEventListener('click', () => {
        const tomorrow = new Date(Date.now() + 86400000);
        tomorrow.setHours(12, 0, 0, 0);
        const formattedLocal = tomorrow.toISOString().slice(0, 16);
        const dtInput = document.getElementById('new-timer-datetime');
        if (dtInput) dtInput.value = formattedLocal;

        this.openModal('modal-create');
      });
    }

    // Create Form Submit
    const createForm = document.getElementById('form-create-timer');
    if (createForm) {
      createForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('new-timer-title').value.trim() || 'My Countdown';
        const datetime = document.getElementById('new-timer-datetime').value;
        const theme = document.getElementById('new-timer-theme').value;
        const tickSound = document.getElementById('new-timer-sound').value;
        const ambientSound = document.getElementById('new-timer-ambient').value;

        if (!datetime) {
          this.showToast('Pilih tanggal dan waktu target!', 'warning');
          return;
        }

        const newTimer = this.storage.addTimer({
          title,
          targetDate: new Date(datetime).toISOString(),
          category: 'Custom',
          theme,
          displayMode: this.activeDisplayMode,
          tickSound,
          ambientSound
        });

        this.switchTimer(newTimer.id);
        this.closeModal('modal-create');
        createForm.reset();
        this.showToast(`Countdown "${title}" berhasil dibuat!`, 'success');
      });
    }

    // My Timers Drawer Button
    const myTimersBtn = document.getElementById('btn-open-timers');
    if (myTimersBtn) {
      myTimersBtn.addEventListener('click', () => {
        this.renderTimerList();
        this.openModal('modal-timers');
      });
    }

    // Audio Settings Button
    const audioSettingsBtn = document.getElementById('btn-open-audio-settings');
    if (audioSettingsBtn) {
      audioSettingsBtn.addEventListener('click', () => {
        this.openModal('modal-audio');
      });
    }

    // Volume Slider
    const volSlider = document.getElementById('audio-volume-slider');
    if (volSlider) {
      volSlider.addEventListener('input', (e) => {
        this.sound.setVolume(parseFloat(e.target.value));
      });
    }

    // Ambient Radio Selectors
    document.querySelectorAll('input[name="ambient-radio"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const val = e.target.value;
        this.currentTimer.ambientSound = val;
        this.storage.updateTimer(this.currentTimer.id, { ambientSound: val });
        this.sound.setAmbient(val);
        this.showToast(`Ambient Sound: ${val.toUpperCase()}`);
      });
    });

    // Close Modal Buttons
    document.querySelectorAll('.modal-close-btn, .btn-close-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-backdrop');
        if (modal) modal.classList.remove('active');
      });
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key.toLowerCase() === 'f') {
        this.toggleFullscreen();
      } else if (e.key.toLowerCase() === 'm') {
        const soundToggleBtn = document.getElementById('btn-toggle-sound');
        if (soundToggleBtn) soundToggleBtn.click();
      } else if (e.key.toLowerCase() === 't') {
        const nextIdx = (this.themes.indexOf(this.activeTheme) + 1) % this.themes.length;
        this.applyTheme(this.themes[nextIdx]);
        this.showToast(`Tema: ${this.themes[nextIdx].toUpperCase()}`);
      } else if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop.active').forEach(m => m.classList.remove('active'));
      }
    });

    // Replay Celebration Button in Finished Banner
    const replayBtn = document.getElementById('btn-replay-celebration');
    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        this.sound.playCelebration();
        this.celebration.triggerBlast(7000);
      });
    }
  }

  toggleFullscreen() {
    const isDocFullscreen = !!document.fullscreenElement;
    if (!isDocFullscreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      document.body.classList.add('fullscreen-hud');
      this.showToast('Mode Fullscreen Presentation aktif (Tekan F atau Esc untuk keluar)');
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      document.body.classList.remove('fullscreen-hud');
    }
  }
}

// Start app on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  window.chronosApp = new AppController();
});
