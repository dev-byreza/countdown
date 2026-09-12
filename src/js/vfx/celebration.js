/**
 * Zero-Moment Confetti & Fireworks Particle Engine
 */

export class CelebrationVFX {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.isActive = false;
    this.colors = ['#00f2fe', '#4facfe', '#fcee0a', '#ff0055', '#00f5d4', '#ff8c69', '#ffffff', '#ffd700'];

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  triggerBlast(durationMs = 6000) {
    this.isActive = true;
    const count = 160;

    // Burst from bottom corners and center
    const origins = [
      { x: this.width * 0.2, y: this.height * 0.9 },
      { x: this.width * 0.5, y: this.height * 0.6 },
      { x: this.width * 0.8, y: this.height * 0.9 }
    ];

    origins.forEach(orig => {
      for (let i = 0; i < count / origins.length; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.5;
        const speed = Math.random() * 14 + 8;
        
        this.particles.push({
          x: orig.x,
          y: orig.y,
          vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 4,
          vy: Math.sin(angle) * speed - Math.random() * 5,
          color: this.colors[Math.floor(Math.random() * this.colors.length)],
          size: Math.random() * 8 + 4,
          rotation: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 12,
          gravity: 0.28,
          wobble: Math.random() * 10,
          wobbleSpeed: Math.random() * 0.1 + 0.05,
          alpha: 1,
          decay: Math.random() * 0.006 + 0.003
        });
      }
    });

    if (!this.animating) {
      this.animating = true;
      this.render();
    }

    setTimeout(() => {
      this.isActive = false;
    }, durationMs);
  }

  render = () => {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.98;
      p.rotation += p.rotSpeed;
      p.wobble += p.wobbleSpeed;
      p.alpha -= p.decay;

      if (p.alpha <= 0 || p.y > this.height + 50) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x + Math.sin(p.wobble) * 4, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = Math.max(0, p.alpha);

      // Draw ribbon / rectangular confetti
      this.ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      requestAnimationFrame(this.render);
    } else {
      this.animating = false;
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  };
}
