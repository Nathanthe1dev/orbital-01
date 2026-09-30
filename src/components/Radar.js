export class RadarController {
  constructor(canvasId, entitiesGetter) {
    this.canvas = document.querySelector(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.getEntities = entitiesGetter;
    this.angle = 0;
    this.visible = true;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = 160;
    this.canvas.height = 160;
    this.radius = this.canvas.width / 2;
  }

  toggle() {
    this.visible = !this.visible;
    const container = document.querySelector('#radar-container');
    if (container) container.style.display = this.visible ? 'block' : 'none';
  }

  update() {
    if (!this.visible || !this.ctx) return;

    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const center = width / 2;
    const scale = 8; // World units to radar pixels ratio

    // 1. Clear & Draw Background Grid
    ctx.clearRect(0, 0, width, height);

    ctx.beginPath();
    ctx.arc(center, center, center - 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Concentric Range Rings
    [0.3, 0.65].forEach(r => {
      ctx.beginPath();
      ctx.arc(center, center, (center - 2) * r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(center, 0); ctx.lineTo(center, height);
    ctx.moveTo(0, center); ctx.lineTo(width, center);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.stroke();

    // 2. Dynamic Radar Sweep Line
    this.angle += 0.04;
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, center - 2, this.angle, this.angle + 0.2);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.fill();

    // 3. Render Object Contact Blips
    const entities = this.getEntities();
    entities.forEach(item => {
      const pos = item.object.position;
      const radarX = center + pos.x * scale;
      const radarY = center + pos.z * scale;

      // Stay within radar boundaries
      const dist = Math.hypot(radarX - center, radarY - center);
      if (dist < center - 4) {
        ctx.beginPath();
        ctx.arc(radarX, radarY, item.size || 3, 0, Math.PI * 2);
        ctx.fillStyle = item.color || '#38bdf8';
        ctx.shadowColor = item.color || '#38bdf8';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });
  }
}