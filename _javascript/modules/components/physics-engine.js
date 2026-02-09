/**
 * Physics Engine Module
 * Manages Matter.js physics simulation and particle rendering
 */

// Matter.js is loaded via CDN (see _includes/js-selector.html)
const Matter = window.Matter;
import { createParticles, getThemeColors } from './particle-system';
import { initMouseTracker, getMousePosition, isTouchDevice } from './mouse-tracker';

// Configuration
const CONFIG = {
  particleCount: isTouchDevice() ? 15 : 50,
  targetFPS: isTouchDevice() ? 30 : 60,
  interactionRadius: isTouchDevice() ? 150 : 250,
  forceMagnitude: 0.0005,
  gravity: { x: 0, y: 0.3 }
};

// Module state
let engine, world, canvas, ctx, particles;
let animationId = null;
let isPaused = false;

/**
 * Initialize the physics engine
 */
export function initPhysicsEngine() {
  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    console.log('Reduced motion preferred - skipping physics');
    return;
  }

  // Get canvas element
  canvas = document.getElementById('physics-canvas');
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }

  // Set up canvas context
  ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('Could not get canvas context');
    return;
  }

  // Initialize Matter.js
  engine = Matter.Engine.create();
  world = engine.world;

  // Configure gravity
  engine.gravity.x = CONFIG.gravity.x;
  engine.gravity.y = CONFIG.gravity.y;

  // Set canvas size
  resizeCanvas();

  // Create boundaries (invisible walls)
  createBoundaries();

  // Create particles
  particles = createParticles(world, canvas.width, canvas.height, CONFIG.particleCount);

  // Initialize mouse tracking
  initMouseTracker(canvas);

  // Set up event listeners
  window.addEventListener('resize', resizeCanvas);
  setupPauseToggle();

  // Start the simulation
  startSimulation();

  console.log('Physics engine initialized with', particles.length, 'particles');
}

/**
 * Create invisible boundaries (walls) around the canvas
 */
function createBoundaries() {
  const thickness = 50;
  const options = {
    isStatic: true,
    render: {
      visible: false
    }
  };

  const boundaries = [
    // Top
    Matter.Bodies.rectangle(canvas.width / 2, -thickness / 2, canvas.width, thickness, options),
    // Bottom
    Matter.Bodies.rectangle(canvas.width / 2, canvas.height + thickness / 2, canvas.width, thickness, options),
    // Left
    Matter.Bodies.rectangle(-thickness / 2, canvas.height / 2, thickness, canvas.height, options),
    // Right
    Matter.Bodies.rectangle(canvas.width + thickness / 2, canvas.height / 2, thickness, canvas.height, options)
  ];

  Matter.World.add(world, boundaries);
}

/**
 * Resize canvas to fill viewport
 */
function resizeCanvas() {
  if (!canvas) return;

  const oldWidth = canvas.width;
  const oldHeight = canvas.height;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // If particles exist, scale their positions
  if (particles && oldWidth > 0 && oldHeight > 0) {
    const scaleX = canvas.width / oldWidth;
    const scaleY = canvas.height / oldHeight;

    particles.forEach((particle) => {
      Matter.Body.setPosition(particle, {
        x: particle.position.x * scaleX,
        y: particle.position.y * scaleY
      });
    });
  }

  // Remove old boundaries and create new ones
  if (world) {
    const bodiesToRemove = Matter.Composite.allBodies(world).filter((body) => body.isStatic);
    Matter.World.remove(world, bodiesToRemove);
    createBoundaries();
  }
}

/**
 * Set up pause/play toggle button
 */
function setupPauseToggle() {
  const toggleBtn = document.getElementById('physics-toggle');
  if (!toggleBtn) return;

  // Load saved preference
  const savedState = localStorage.getItem('physics-paused');
  if (savedState === 'true') {
    pauseSimulation();
  }

  toggleBtn.addEventListener('click', () => {
    if (isPaused) {
      resumeSimulation();
    } else {
      pauseSimulation();
    }
  });

  // Keyboard shortcut (Space or P)
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'KeyP') {
      // Only if not focused on input elements
      if (!['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        toggleBtn.click();
      }
    }
  });
}

/**
 * Start the physics simulation
 */
function startSimulation() {
  if (animationId) return; // Already running

  let lastTime = 0;
  const frameDelay = 1000 / CONFIG.targetFPS;

  function animate(timestamp) {
    animationId = requestAnimationFrame(animate);

    // Throttle to target FPS
    if (timestamp - lastTime < frameDelay) {
      return;
    }
    lastTime = timestamp;

    // Update physics
    Matter.Engine.update(engine, 1000 / CONFIG.targetFPS);

    // Apply mouse force
    applyMouseForce();

    // Render
    render();
  }

  animationId = requestAnimationFrame(animate);
}

/**
 * Pause the simulation
 */
function pauseSimulation() {
  isPaused = true;
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  const toggleBtn = document.getElementById('physics-toggle');
  if (toggleBtn) {
    toggleBtn.innerHTML = '<i class="fas fa-play"></i>';
  }

  localStorage.setItem('physics-paused', 'true');
}

/**
 * Resume the simulation
 */
function resumeSimulation() {
  isPaused = false;
  startSimulation();

  const toggleBtn = document.getElementById('physics-toggle');
  if (toggleBtn) {
    toggleBtn.innerHTML = '<i class="fas fa-pause"></i>';
  }

  localStorage.setItem('physics-paused', 'false');
}

/**
 * Apply force to particles based on mouse position
 */
function applyMouseForce() {
  const mouse = getMousePosition();
  if (!mouse || !particles) return;

  particles.forEach((particle) => {
    const dx = mouse.x - particle.position.x;
    const dy = mouse.y - particle.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < CONFIG.interactionRadius && distance > 0) {
      const force = {
        x: (dx / distance) * CONFIG.forceMagnitude,
        y: (dy / distance) * CONFIG.forceMagnitude
      };
      Matter.Body.applyForce(particle, particle.position, force);
    }
  });
}

/**
 * Render the particles on canvas
 */
function render() {
  if (!ctx || !canvas || !particles) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Get theme colors
  const colors = getThemeColors();

  // Draw each particle
  particles.forEach((particle) => {
    ctx.save();

    // Translate to particle position
    ctx.translate(particle.position.x, particle.position.y);
    ctx.rotate(particle.angle);

    // Set particle color
    const color = particle.render.fillStyle || colors[0];
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    // Draw based on shape type
    if (particle.circleRadius) {
      // Circle
      ctx.beginPath();
      ctx.arc(0, 0, particle.circleRadius, 0, Math.PI * 2);
      ctx.fill();
    } else if (particle.vertices) {
      // Polygon (rectangle or triangle)
      ctx.beginPath();
      const vertices = particle.vertices;
      ctx.moveTo(vertices[0].x - particle.position.x, vertices[0].y - particle.position.y);
      for (let i = 1; i < vertices.length; i++) {
        ctx.lineTo(vertices[i].x - particle.position.x, vertices[i].y - particle.position.y);
      }
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  });

  // Optional: Draw mouse interaction radius (for debugging)
  // drawMouseRadius();
}

/**
 * Draw mouse interaction radius (for debugging)
 */
function drawMouseRadius() {
  const mouse = getMousePosition();
  if (!mouse || !ctx) return;

  ctx.save();
  ctx.strokeStyle = 'rgba(100, 150, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, CONFIG.interactionRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/**
 * Update particle colors when theme changes
 */
export function updateParticleColors() {
  if (!particles) return;

  const colors = getThemeColors();

  particles.forEach((particle, index) => {
    particle.render.fillStyle = colors[index % colors.length];
  });
}

// Listen for theme changes
if (typeof MutationObserver !== 'undefined') {
  const observer = new MutationObserver(() => {
    updateParticleColors();
  });

  const target = document.documentElement;
  if (target) {
    observer.observe(target, {
      attributes: true,
      attributeFilter: ['data-mode']
    });
  }
}

// Pause when tab is not visible (battery optimization)
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && !isPaused) {
      pauseSimulation();
    } else if (!document.hidden && isPaused) {
      const savedState = localStorage.getItem('physics-paused');
      if (savedState !== 'true') {
        resumeSimulation();
      }
    }
  });
}
