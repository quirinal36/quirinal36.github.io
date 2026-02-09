/**
 * Mouse Tracker Module
 * Tracks mouse/touch position for physics interactions
 */

// Module state
let mousePosition = { x: 0, y: 0 };
let isTracking = false;

/**
 * Check if device has touch screen
 */
export function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Initialize mouse tracking on canvas
 * @param {HTMLCanvasElement} canvas - Canvas element to track
 */
export function initMouseTracker(canvas) {
  if (!canvas) {
    console.error('Canvas element required for mouse tracking');
    return;
  }

  // Mouse events
  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mouseenter', () => {
    isTracking = true;
  });
  canvas.addEventListener('mouseleave', () => {
    isTracking = false;
  });

  // Touch events for mobile
  if (isTouchDevice()) {
    canvas.addEventListener('touchstart', handleTouch, { passive: false });
    canvas.addEventListener('touchmove', handleTouch, { passive: false });
    canvas.addEventListener('touchend', () => {
      isTracking = false;
    });
  }

  console.log('Mouse tracker initialized');
}

/**
 * Handle mouse move event
 * @param {MouseEvent} event
 */
function handleMouseMove(event) {
  const rect = event.target.getBoundingClientRect();
  mousePosition.x = event.clientX - rect.left;
  mousePosition.y = event.clientY - rect.top;
  isTracking = true;
}

/**
 * Handle touch event
 * @param {TouchEvent} event
 */
function handleTouch(event) {
  event.preventDefault(); // Prevent scrolling

  if (event.touches.length > 0) {
    const touch = event.touches[0];
    const rect = event.target.getBoundingClientRect();
    mousePosition.x = touch.clientX - rect.left;
    mousePosition.y = touch.clientY - rect.top;
    isTracking = true;
  }
}

/**
 * Get current mouse position
 * @returns {Object|null} Mouse position {x, y} or null if not tracking
 */
export function getMousePosition() {
  return isTracking ? mousePosition : null;
}

/**
 * Check if mouse is currently being tracked
 * @returns {boolean}
 */
export function isMouseTracking() {
  return isTracking;
}
