/**
 * Kinetic Typography Renderer (Apple Event Style)
 */

export class KineticDisplay {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  pad(n) {
    return String(n).padStart(2, '0');
  }

  update(timeData, isSecondChanged) {
    if (!this.container) return;

    const daysEl = this.container.querySelector('[data-kinetic="days"]');
    const hoursEl = this.container.querySelector('[data-kinetic="hours"]');
    const minutesEl = this.container.querySelector('[data-kinetic="minutes"]');
    const secondsEl = this.container.querySelector('[data-kinetic="seconds"]');

    if (daysEl) daysEl.textContent = this.pad(timeData.days);
    if (hoursEl) hoursEl.textContent = this.pad(timeData.hours);
    if (minutesEl) minutesEl.textContent = this.pad(timeData.minutes);
    if (secondsEl) secondsEl.textContent = this.pad(timeData.seconds);

    // Subtle pulse effect on second tick
    if (isSecondChanged && secondsEl) {
      secondsEl.classList.remove('animate-pulse-glow');
      void secondsEl.offsetWidth;
      secondsEl.classList.add('animate-pulse-glow');
    }
  }
}
