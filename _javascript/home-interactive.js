/**
 * Home Interactive - Entry Point
 * Interactive physics-based homepage with Matter.js
 */

import { basic, initSidebar, initTopbar } from './modules/layouts';
import { initPhysicsEngine } from './modules/components/physics-engine';

// Initialize standard layout components
initSidebar();
initTopbar();
basic();

// Initialize interactive physics features
// Only if user hasn't disabled motion
if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  // Wait for DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPhysicsEngine);
  } else {
    initPhysicsEngine();
  }
} else {
  console.log('Physics disabled due to reduced motion preference');
}
