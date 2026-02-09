// Particle system for background stars and effects

class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: 0, y: 0 };

        this.resize();
        this.init();
        this.setupListeners();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupListeners() {
        window.addEventListener('resize', () => this.resize());

        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    init() {
        // Create star field
        const particleCount = 200;

        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                z: Math.random() * 1000,
                size: Math.random() * 2,
                baseSize: Math.random() * 2,
                speedX: (Math.random() - 0.5) * 0.2,
                speedY: (Math.random() - 0.5) * 0.2,
                brightness: Math.random() * 0.5 + 0.5,
                twinkleSpeed: Math.random() * 0.02 + 0.01,
                twinkleOffset: Math.random() * Math.PI * 2,
            });
        }
    }

    drawParticle(p, time) {
        // Map z-depth to position (parallax)
        const scale = 1000 / (1000 + p.z);
        const x2d = (p.x - this.canvas.width / 2) * scale + this.canvas.width / 2;
        const y2d = (p.y - this.canvas.height / 2) * scale + this.canvas.height / 2;

        // Twinkle effect
        const twinkle = Math.sin(time * p.twinkleSpeed + p.twinkleOffset) * 0.3 + 0.7;
        const alpha = p.brightness * twinkle * scale;

        // Size based on depth
        const size = p.baseSize * scale;

        // Draw star
        const gradient = this.ctx.createRadialGradient(x2d, y2d, 0, x2d, y2d, size * 2);
        gradient.addColorStop(0, `rgba(0, 255, 255, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(123, 104, 238, ${alpha * 0.5})`);
        gradient.addColorStop(1, `rgba(0, 255, 255, 0)`);

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x2d, y2d, size * 2, 0, Math.PI * 2);
        this.ctx.fill();

        // Core
        this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        this.ctx.beginPath();
        this.ctx.arc(x2d, y2d, size * 0.5, 0, Math.PI * 2);
        this.ctx.fill();
    }

    updateParticle(p) {
        // Drift
        p.x += p.speedX;
        p.y += p.speedY;

        // Mouse influence
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const influenceRadius = 200;

        if (distance < influenceRadius) {
            const force = (influenceRadius - distance) / influenceRadius;
            p.x -= (dx / distance) * force * 0.5;
            p.y -= (dy / distance) * force * 0.5;
        }

        // Wrap around edges
        if (p.x < 0) p.x = this.canvas.width;
        if (p.x > this.canvas.width) p.x = 0;
        if (p.y < 0) p.y = this.canvas.height;
        if (p.y > this.canvas.height) p.y = 0;
    }

    drawConnections() {
        // Draw connections between nearby particles
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i];
                const p2 = this.particles[j];

                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = 150;

                if (distance < maxDistance) {
                    const alpha = (1 - distance / maxDistance) * 0.1;
                    this.ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            }
        }
    }

    animate() {
        const time = performance.now() * 0.001;

        // Clear with fade effect
        this.ctx.fillStyle = 'rgba(10, 10, 15, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw connections first (behind particles)
        this.drawConnections();

        // Update and draw particles
        for (const particle of this.particles) {
            this.updateParticle(particle);
            this.drawParticle(particle, time);
        }

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('particles');
    new ParticleSystem(canvas);
});
