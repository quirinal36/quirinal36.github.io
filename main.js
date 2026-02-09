// Main application logic

class GravityBlog {
    constructor() {
        this.physicsWorld = null;
        this.letters = [];
        this.titleText = "GRAVITY";

        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.initPhysics();
        this.createTitleLetters();
        this.initCursor();
        this.updateEntityCount();

        // Add click interactions
        this.initInteractions();
    }

    initPhysics() {
        this.physicsWorld = new PhysicsWorld();

        // Add navigation orbs to physics
        document.querySelectorAll('.orb').forEach(orb => {
            this.physicsWorld.addEntity(orb, 2);
        });

        // Add info cards to physics
        document.querySelectorAll('.card').forEach(card => {
            const mass = parseFloat(card.dataset.mass) || 2;
            this.physicsWorld.addEntity(card, mass);
        });
    }

    createTitleLetters() {
        const container = document.getElementById('title-letters');
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const radius = 200;

        for (let i = 0; i < this.titleText.length; i++) {
            const letter = document.createElement('div');
            letter.className = 'letter';
            letter.textContent = this.titleText[i];

            // Position in a circle
            const angle = (i / this.titleText.length) * Math.PI * 2 - Math.PI / 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            letter.style.left = x + 'px';
            letter.style.top = y + 'px';

            container.appendChild(letter);

            // Add to physics world with higher mass
            const entity = this.physicsWorld.addEntity(letter, 3);
            this.letters.push(entity);
        }
    }

    initCursor() {
        const cursor = document.querySelector('.gravity-cursor');
        const cursorCore = document.querySelector('.cursor-core');
        const cursorRing = document.querySelector('.cursor-ring');

        let mouseX = 0;
        let mouseY = 0;
        let cursorX = 0;
        let cursorY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Smooth cursor follow
        const updateCursor = () => {
            const dx = mouseX - cursorX;
            const dy = mouseY - cursorY;

            cursorX += dx * 0.2;
            cursorY += dy * 0.2;

            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';

            requestAnimationFrame(updateCursor);
        };

        updateCursor();

        // Cursor interactions
        const interactiveElements = document.querySelectorAll('.orb, .card');

        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                cursorRing.style.width = '60px';
                cursorRing.style.height = '60px';
                cursorRing.style.opacity = '1';
            });

            element.addEventListener('mouseleave', () => {
                cursorRing.style.width = '40px';
                cursorRing.style.height = '40px';
                cursorRing.style.opacity = '0.6';
            });
        });
    }

    initInteractions() {
        // Add click effect to create ripple
        document.addEventListener('click', (e) => {
            this.createRipple(e.clientX, e.clientY);
            this.applyClickForce(e.clientX, e.clientY);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ') {
                e.preventDefault();
                this.scatterElements();
            } else if (e.key === 'r' || e.key === 'R') {
                this.resetPositions();
            }
        });
    }

    createRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.style.position = 'fixed';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.width = '10px';
        ripple.style.height = '10px';
        ripple.style.border = '2px solid var(--electric)';
        ripple.style.borderRadius = '50%';
        ripple.style.transform = 'translate(-50%, -50%)';
        ripple.style.pointerEvents = 'none';
        ripple.style.zIndex = '9999';
        ripple.style.animation = 'ripple 1s ease-out forwards';

        document.body.appendChild(ripple);

        setTimeout(() => ripple.remove(), 1000);
    }

    applyClickForce(x, y) {
        // Apply outward force from click point
        this.physicsWorld.entities.forEach(entity => {
            const dx = entity.x - x;
            const dy = entity.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 300 && distance > 0) {
                const force = 10;
                const fx = (dx / distance) * force;
                const fy = (dy / distance) * force;

                entity.applyForce(fx, fy);
            }
        });
    }

    scatterElements() {
        // Scatter all elements randomly
        this.physicsWorld.entities.forEach(entity => {
            const angle = Math.random() * Math.PI * 2;
            const force = 5 + Math.random() * 10;

            entity.applyForce(
                Math.cos(angle) * force,
                Math.sin(angle) * force
            );
        });
    }

    resetPositions() {
        // Smoothly return all elements to original positions
        this.physicsWorld.entities.forEach(entity => {
            entity.vx = 0;
            entity.vy = 0;

            // Apply strong spring force
            const dx = entity.originalX - entity.x;
            const dy = entity.originalY - entity.y;

            entity.applyForce(dx * 0.1, dy * 0.1);
        });
    }

    updateEntityCount() {
        const counter = document.getElementById('entity-count');
        if (counter) {
            counter.textContent = this.physicsWorld.entities.length;
        }
    }
}

// Initialize the application
window.addEventListener('DOMContentLoaded', () => {
    new GravityBlog();
});

// Easter eggs and console messages
console.log('%c GRAVITY BLOG ',
    'background: linear-gradient(90deg, #00ffff, #ff00ff); color: #000; font-size: 20px; padding: 10px; font-weight: bold;');
console.log('%c Physics-based interactive experience ',
    'color: #00ffff; font-size: 12px;');
console.log('%c Commands: ', 'color: #fff; font-weight: bold;');
console.log('%c   SPACE - Scatter elements', 'color: #00ffff;');
console.log('%c   R - Reset positions', 'color: #00ffff;');
console.log('%c   Click - Create ripple force', 'color: #00ffff;');
