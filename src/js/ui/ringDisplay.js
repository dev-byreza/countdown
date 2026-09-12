/**
 * Ultra-Modern SVG Radial Glow Chrono Ring Renderer
 */

export class RingDisplay {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.radius = 52;
    this.circumference = 2 * Math.PI * this.radius; // ~326.72
  }

  pad(n) {
    return String(n).padStart(2, '0');
  }

  update(timeData) {
    if (!this.container) return;

    const units = [
      { key: 'days', val: timeData.days, max: 365, display: this.pad(timeData.days) },
      { key: 'hours', val: timeData.hours, max: 24, display: this.pad(timeData.hours) },
      { key: 'minutes', val: timeData.minutes, max: 60, display: this.pad(timeData.minutes) },
      { key: 'seconds', val: timeData.seconds, max: 60, display: this.pad(timeData.seconds) }
    ];

    units.forEach(u => {
      const ringUnitEl = this.container.querySelector(`[data-ring="${u.key}"]`);
      if (!ringUnitEl) return;

      const circle = ringUnitEl.querySelector('.ring-circle-progress');
      const valEl = ringUnitEl.querySelector('.ring-val');
      const beacon = ringUnitEl.querySelector('.ring-beacon');

      if (valEl) {
        valEl.textContent = u.display;
      }

      if (circle) {
        const percent = Math.max(0, Math.min(1, u.val / u.max));
        const offset = this.circumference * (1 - percent);
        circle.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
        circle.style.strokeDashoffset = offset;

        // Position glowing beacon dot at the tip of the arc
        if (beacon) {
          const angle = (percent * 360 - 90) * (Math.PI / 180);
          const cx = 60 + this.radius * Math.cos(angle);
          const cy = 60 + this.radius * Math.sin(angle);
          beacon.setAttribute('cx', cx);
          beacon.setAttribute('cy', cy);
          beacon.style.display = percent > 0.01 ? 'block' : 'none';
        }
      }
    });
  }
}
