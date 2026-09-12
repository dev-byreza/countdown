/**
 * Interactive Particle & Starfield Background Canvas
 */

export class BackgroundCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.particleCount = 70;
    this.mouse = { x: null, y: null, radius: 150 };
    this.theme = 'cosmic';

    this.themeColors = {
      cosmic: { p: ['#00f2fe', '#4facfe', '#7f00ff'], line: 'rgba(79, 172, 254, 0.12)' },
      cyberpunk: { p: ['#fcee0a', '#00f0ff', '#ff0055'], line: 'rgba(254, 238, 10, 0.15)' },
      cupertino: { p: ['#2997ff', '#bf5af2', '#ffffff'], line: 'rgba(255, 255, 255, 0.1)' },
      lofi: { p: ['#ff8c69', '#ffb347', '#ff5277'], line: 'rgba(255, 140, 105, 0.15)' },
      zen: { p: ['#00f5d4', '#10b981', '#52b788'], line: 'rgba(0, 245, 212, 0.12)' }
    };

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });

    this.createParticles();
    this.animate();
  }

  setTheme(themeName) {
    if (this.themeColors[themeName]) {
      this.theme = themeName;
      this.createParticles();
    }
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  createParticles() {
    this.particles = [];
    const colors = (this.themeColors[this.theme] || this.themeColors.cosmic).p;

    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2.5 + 0.8,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.7 + 0.3
      });
    }
  }

  animate = () => {
    this.ctx.clearRect(0, 0, this.width, this.height);
    const lineCol = (this.themeColors[this.theme] || this.themeColors.cosmic).line;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      p.x += p.speedX;
      p.y += p.speedY;

      // Wrap edges
      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;

      // Mouse repulsion / attraction
      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.mouse.radius) {
          const force = (this.mouse.radius - dist) / this.mouse.radius;
          p.x -= (dx / dist) * force * 1.5;
          p.y -= (dy / dist) * force * 1.5;
        }
      }

      // Draw particle
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.shadowBlur = p.size * 3;
      this.ctx.shadowColor = p.color;
      this.ctx.fill();
      this.ctx.restore();

      // Connect with near particles
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (dist < 110) {
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = lineCol;
          this.ctx.lineWidth = 1 - dist / 110;
          this.ctx.stroke();
        }
      }
    }

    requestAnimationFrame(this.animate);
  };
}
