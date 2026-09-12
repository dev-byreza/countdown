/**
 * 3D Flip Clock DOM Renderer
 */

export class FlipDisplay {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.prevValues = { days: null, hours: null, minutes: null, seconds: null };
  }

  pad(n) {
    return String(n).padStart(2, '0');
  }

  update(timeData, isSecondChanged) {
    if (!this.container) return;

    const units = [
      { key: 'days', val: this.pad(timeData.days), label: 'Hari' },
      { key: 'hours', val: this.pad(timeData.hours), label: 'Jam' },
      { key: 'minutes', val: this.pad(timeData.minutes), label: 'Menit' },
      { key: 'seconds', val: this.pad(timeData.seconds), label: 'Detik' }
    ];

    units.forEach((unit, index) => {
      const cardEl = this.container.querySelector(`[data-unit="${unit.key}"]`);
      if (!cardEl) return;

      const currentStr = unit.val;
      const prevStr = this.prevValues[unit.key];

      if (prevStr !== currentStr) {
        this.animateCard(cardEl, currentStr, prevStr);
        this.prevValues[unit.key] = currentStr;
      }
    });
  }

  animateCard(cardEl, newVal, oldVal) {
    const topSpan = cardEl.querySelector('.flip-card-top span');
    const bottomSpan = cardEl.querySelector('.flip-card-bottom span');

    if (!oldVal) {
      if (topSpan) topSpan.textContent = newVal;
      if (bottomSpan) bottomSpan.textContent = newVal;
      return;
    }

    // Trigger flip animation
    cardEl.classList.remove('flipping');
    void cardEl.offsetWidth; // Force reflow

    if (topSpan) topSpan.textContent = newVal;
    if (bottomSpan) bottomSpan.textContent = newVal;

    cardEl.classList.add('flipping');

    setTimeout(() => {
      cardEl.classList.remove('flipping');
    }, 550);
  }

  reset() {
    this.prevValues = { days: null, hours: null, minutes: null, seconds: null };
  }
}
