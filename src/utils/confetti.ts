/**
 * Elegant Canvas Confetti for DevCareer OS
 * Restrained, calm, aesthetic reinforcement matching Slash colors.
 * Respects prefers-reduced-motion and store preferences.
 */

// Slash Inspired Palette: Gilded gold, Copper, Silver, Warm Cream, Bone
const SLASH_CONFETTI_COLORS = [
  '#ae9357', // Gilded Gold
  '#cc9166', // Copper
  '#c7c9d1', // Silver
  '#fff0cc', // Warm Cream
  '#e2e3e9', // Bone
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  color: string;
  rotation: number;
  vRot: number;
  opacity: number;
}

export function isReducedMotionPreferred(): boolean {
  if (typeof window === 'undefined') return false;

  // 1. Check OS media query
  const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  if (mediaQuery?.matches) return true;

  // 2. Check saved preference in localStorage
  try {
    const saved = localStorage.getItem('bholenath_reduced_motion');
    if (saved === 'true') return true;
  } catch {
    // ignore
  }

  return false;
}

export function triggerConfetti() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // Check reduced motion accessibility
  if (isReducedMotionPreferred()) {
    return;
  }

  // Check if existing canvas is already animating
  const existingCanvas = document.getElementById('bholenath-confetti-canvas');
  if (existingCanvas) {
    existingCanvas.remove();
  }

  const canvas = document.createElement('canvas');
  canvas.id = 'bholenath-confetti-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  // Generate ~45 elegant particles (not thousands like arcade games)
  const count = 48;
  const particles: Particle[] = [];
  const startX = width / 2;
  const startY = height * 0.35;

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const speed = 2 + Math.random() * 5.5;
    particles.push({
      x: startX + (Math.random() - 0.5) * 60,
      y: startY + (Math.random() - 0.5) * 40,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2.5, // initial upward lift
      width: 4 + Math.random() * 5,
      height: 6 + Math.random() * 8,
      color: SLASH_CONFETTI_COLORS[Math.floor(Math.random() * SLASH_CONFETTI_COLORS.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 8,
      opacity: 1,
    });
  }

  const startTime = performance.now();
  const maxDuration = 1800; // 1.8 seconds max

  function render(now: number) {
    const elapsed = now - startTime;
    if (elapsed > maxDuration || !ctx) {
      canvas.remove();
      return;
    }

    ctx.clearRect(0, 0, width, height);
    const fadeRatio = elapsed / maxDuration;

    particles.forEach((p) => {
      // Physics
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.16; // gravity
      p.vx *= 0.985; // air drag
      p.rotation += p.vRot;
      p.opacity = Math.max(0, 1 - fadeRatio * 1.2);

      // Draw particle
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
      ctx.restore();
    });

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}
