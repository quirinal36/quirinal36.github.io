/**
 * Particle System Module
 * Creates and manages physics particles with different shapes and colors
 */

// Matter.js is loaded via CDN (see _includes/js-selector.html)
const Matter = window.Matter;

/**
 * Get theme-aware colors from CSS custom properties
 */
export function getThemeColors() {
  // Try to get colors from CSS custom properties
  const root = document.documentElement;
  const isDark = root.getAttribute('data-mode') === 'dark';

  if (isDark) {
    return ['#4c9aff', '#ff6b9d', '#c69eff', '#ffab00'];
  } else {
    return ['#0052cc', '#ff5630', '#6554c0', '#ff8b00'];
  }
}

/**
 * Create particles with random shapes and positions
 * @param {Matter.World} world - Matter.js world
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} count - Number of particles to create
 * @returns {Array} Array of Matter.js bodies
 */
export function createParticles(world, width, height, count) {
  const particles = [];
  const colors = getThemeColors();
  const shapes = ['circle', 'rectangle', 'triangle'];

  for (let i = 0; i < count; i++) {
    // Random position
    const x = Math.random() * width;
    const y = Math.random() * height;

    // Random shape
    const shape = shapes[Math.floor(Math.random() * shapes.length)];

    // Random size
    const size = 15 + Math.random() * 20;

    // Random color
    const color = colors[Math.floor(Math.random() * colors.length)];

    // Create particle based on shape
    let particle;

    switch (shape) {
      case 'circle':
        particle = Matter.Bodies.circle(x, y, size, {
          restitution: 0.6,
          friction: 0.01,
          frictionAir: 0.01,
          render: {
            fillStyle: color
          }
        });
        break;

      case 'rectangle':
        particle = Matter.Bodies.rectangle(x, y, size * 1.5, size * 1.5, {
          restitution: 0.6,
          friction: 0.01,
          frictionAir: 0.01,
          chamfer: { radius: 5 },
          render: {
            fillStyle: color
          }
        });
        break;

      case 'triangle':
        particle = Matter.Bodies.polygon(x, y, 3, size, {
          restitution: 0.6,
          friction: 0.01,
          frictionAir: 0.01,
          render: {
            fillStyle: color
          }
        });
        break;

      default:
        particle = Matter.Bodies.circle(x, y, size);
    }

    // Give initial random velocity
    Matter.Body.setVelocity(particle, {
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2
    });

    // Give initial random angular velocity
    Matter.Body.setAngularVelocity(particle, (Math.random() - 0.5) * 0.1);

    particles.push(particle);
  }

  // Add particles to world
  Matter.World.add(world, particles);

  return particles;
}

/**
 * Create a single particle at specific position
 * @param {Matter.World} world - Matter.js world
 * @param {number} x - X position
 * @param {number} y - Y position
 * @returns {Matter.Body} Created particle
 */
export function createSingleParticle(world, x, y) {
  const colors = getThemeColors();
  const shapes = ['circle', 'rectangle', 'triangle'];
  const shape = shapes[Math.floor(Math.random() * shapes.length)];
  const size = 15 + Math.random() * 20;
  const color = colors[Math.floor(Math.random() * colors.length)];

  let particle;

  switch (shape) {
    case 'circle':
      particle = Matter.Bodies.circle(x, y, size, {
        restitution: 0.6,
        friction: 0.01,
        frictionAir: 0.01,
        render: {
          fillStyle: color
        }
      });
      break;

    case 'rectangle':
      particle = Matter.Bodies.rectangle(x, y, size * 1.5, size * 1.5, {
        restitution: 0.6,
        friction: 0.01,
        frictionAir: 0.01,
        chamfer: { radius: 5 },
        render: {
          fillStyle: color
        }
      });
      break;

    case 'triangle':
      particle = Matter.Bodies.polygon(x, y, 3, size, {
        restitution: 0.6,
        friction: 0.01,
        frictionAir: 0.01,
        render: {
          fillStyle: color
        }
      });
      break;

    default:
      particle = Matter.Bodies.circle(x, y, size);
  }

  // Give initial velocity
  Matter.Body.setVelocity(particle, {
    x: (Math.random() - 0.5) * 5,
    y: (Math.random() - 0.5) * 5
  });

  Matter.World.add(world, particle);

  return particle;
}
