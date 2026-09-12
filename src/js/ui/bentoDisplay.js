/**
 * Quantum Bento Grid Display Renderer
 */

export class BentoDisplay {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  pad(n) {
    return String(n).padStart(2, '0');
  }

  update(timeData, isSecondChanged) {
    if (!this.container) return;

    const daysEl = this.container.querySelector('[data-bento="days"]');
    const hoursEl = this.container.querySelector('[data-bento="hours"]');
    const minsEl = this.container.querySelector('[data-bento="minutes"]');
    const secsEl = this.container.querySelector('[data-bento="seconds"]');
    const progressFill = this.container.querySelector('#bento-progress-fill');
    const percentBadge = this.container.querySelector('#bento-percent-badge');
    const msTicker = this.container.querySelector('#bento-ms-ticker');

    if (daysEl) daysEl.textContent = this.pad(timeData.days);
    if (hoursEl) hoursEl.textContent = this.pad(timeData.hours);
    if (minsEl) minsEl.textContent = this.pad(timeData.minutes);
    if (secsEl) secsEl.textContent = this.pad(timeData.seconds);

    if (progressFill) {
      progressFill.style.width = `${timeData.progressPercent.toFixed(1)}%`;
    }

    if (percentBadge) {
      percentBadge.textContent = `${timeData.progressPercent.toFixed(1)}% Selesai`;
    }

    if (msTicker) {
      msTicker.textContent = `.${this.pad(timeData.millis)}s`;
    }
  }
}
