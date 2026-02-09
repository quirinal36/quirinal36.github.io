// Physics engine for gravitational interactions

class PhysicsEntity {
    constructor(element, mass = 1) {
        this.element = element;
        this.mass = mass;

        // Get initial position from CSS
        const rect = element.getBoundingClientRect();
        this.x = rect.left + rect.width / 2;
        this.y = rect.top + rect.height / 2;

        // Velocity
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;

        // Acceleration
        this.ax = 0;
        this.ay = 0;

        // Physics properties
        this.damping = 0.98;
        this.maxSpeed = 3;

        // Store original position for spring back
        this.originalX = this.x;
        this.originalY = this.y;
    }

    applyForce(fx, fy) {
        this.ax += fx / this.mass;
        this.ay += fy / this.mass;
    }

    update(dt = 1) {
        // Apply spring force to original position (weak)
        const springStrength = 0.0005;
        const springDamping = 0.95;

        const dx = this.originalX - this.x;
        const dy = this.originalY - this.y;

        this.applyForce(dx * springStrength, dy * springStrength);

        // Update velocity
        this.vx += this.ax * dt;
        this.vy += this.ay * dt;

        // Apply damping
        this.vx *= this.damping;
        this.vy *= this.damping;

        // Limit speed
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > this.maxSpeed) {
            this.vx = (this.vx / speed) * this.maxSpeed;
            this.vy = (this.vy / speed) * this.maxSpeed;
        }

        // Update position
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Boundary check with bounce
        const margin = 100;
        const width = window.innerWidth;
        const height = window.innerHeight;

        if (this.x < margin) {
            this.x = margin;
            this.vx *= -0.5;
        } else if (this.x > width - margin) {
            this.x = width - margin;
            this.vx *= -0.5;
        }

        if (this.y < margin) {
            this.y = margin;
            this.vy *= -0.5;
        } else if (this.y > height - margin) {
            this.y = height - margin;
            this.vy *= -0.5;
        }

        // Reset acceleration
        this.ax = 0;
        this.ay = 0;

        // Update DOM element position
        this.render();
    }

    render() {
        const rect = this.element.getBoundingClientRect();
        const offsetX = rect.width / 2;
        const offsetY = rect.height / 2;

        this.element.style.transform = `translate(${this.x - offsetX}px, ${this.y - offsetY}px)`;
    }

    distanceTo(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

class PhysicsWorld {
    constructor() {
        this.entities = [];
        this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.gravity = 0.3;
        this.gravityRadius = 300;
        this.repulsionRadius = 100;
        this.lastTime = performance.now();

        this.initMouseTracking();
        this.animate();
    }

    initMouseTracking() {
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    addEntity(element, mass = 1) {
        const entity = new PhysicsEntity(element, mass);
        this.entities.push(entity);
        return entity;
    }

    applyGravity(entity) {
        const dx = this.mouse.x - entity.x;
        const dy = this.mouse.y - entity.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.gravityRadius && distance > this.repulsionRadius) {
            // Attractive force
            const force = (this.gravity * entity.mass) / (distance * 0.01);
            const fx = (dx / distance) * force;
            const fy = (dy / distance) * force;

            entity.applyForce(fx, fy);
        } else if (distance <= this.repulsionRadius && distance > 10) {
            // Repulsive force when too close
            const repulsion = 2;
            const force = (repulsion * entity.mass) / (distance * 0.01);
            const fx = -(dx / distance) * force;
            const fy = -(dy / distance) * force;

            entity.applyForce(fx, fy);
        }
    }

    applyEntityRepulsion() {
        // Prevent entities from overlapping
        for (let i = 0; i < this.entities.length; i++) {
            for (let j = i + 1; j < this.entities.length; j++) {
                const e1 = this.entities[i];
                const e2 = this.entities[j];

                const dx = e2.x - e1.x;
                const dy = e2.y - e1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = 150;

                if (distance < minDistance && distance > 0) {
                    const force = 0.5;
                    const fx = -(dx / distance) * force;
                    const fy = -(dy / distance) * force;

                    e1.applyForce(fx, fy);
                    e2.applyForce(-fx, -fy);
                }
            }
        }
    }

    update() {
        const currentTime = performance.now();
        const dt = Math.min((currentTime - this.lastTime) / 16, 2); // Cap dt
        this.lastTime = currentTime;

        // Apply forces to all entities
        for (const entity of this.entities) {
            this.applyGravity(entity);
        }

        // Apply entity repulsion
        this.applyEntityRepulsion();

        // Update all entities
        for (const entity of this.entities) {
            entity.update(dt);
        }
    }

    animate() {
        this.update();
        requestAnimationFrame(() => this.animate());
    }
}

// Export for use in main.js
window.PhysicsWorld = PhysicsWorld;
