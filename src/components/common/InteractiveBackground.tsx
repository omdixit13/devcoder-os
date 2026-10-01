import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

type BackgroundMode = 'celestial' | 'matrix' | 'grid' | 'off';

interface Particle {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  color: string;
  alpha: number;
}

export default function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { reducedMotion } = useAppStore();
  const [mode, setMode] = useState<BackgroundMode>('celestial');
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    if (reducedMotion || mode === 'off') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates in normalized -1 to +1 range
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / width) * 2 - 1;
      mouseY = (e.clientY / height) * 2 - 1;
      targetRotY = mouseX * 0.45;
      targetRotX = -mouseY * 0.35;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('resize', handleResize);

    // ---------------------------------------------
    // Mode 1: 3D Celestial Neural Mesh
    // ---------------------------------------------
    const particleCount = 75;
    const particles: Particle[] = [];
    const colors = ['#cc9166', '#e2e3e9', '#777a88', '#9194a1', '#cc9166'];

    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * width * 1.2;
      const y = (Math.random() - 0.5) * height * 1.2;
      const z = (Math.random() - 0.5) * 600;
      particles.push({
        x,
        y,
        z,
        baseX: x,
        baseY: y,
        baseZ: z,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.2,
      });
    }

    // ---------------------------------------------
    // Mode 2: Matrix Cyber Rain Drops
    // ---------------------------------------------
    const columns = Math.floor(width / 24);
    const rainDrops: number[] = Array.from({ length: columns }).fill(1) as number[];
    const matrixChars = '01λ{}:;=>constletasyncimport010101#@!';

    let lastTime = 0;

    const render = (time: number) => {
      // Smooth 3D rotation damping
      currentRotX += (targetRotX - currentRotX) * 0.05;
      currentRotY += (targetRotY - currentRotY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Deep vignette background gradient
      const bgGrad = ctx.createRadialGradient(
        width / 2 + currentRotY * 150,
        height / 2 + currentRotX * 100,
        100,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.8
      );
      bgGrad.addColorStop(0, 'rgba(18, 19, 23, 0.45)');
      bgGrad.addColorStop(0.5, 'rgba(8, 8, 10, 0.7)');
      bgGrad.addColorStop(1, 'rgba(4, 4, 6, 0.95)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      if (mode === 'matrix') {
        // Matrix Cyber Rain
        ctx.fillStyle = 'rgba(204, 145, 102, 0.15)';
        ctx.font = '11px monospace';
        for (let i = 0; i < rainDrops.length; i++) {
          const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
          const x = i * 24;
          const y = rainDrops[i] * 20;

          ctx.fillStyle = i % 3 === 0 ? 'rgba(204, 145, 102, 0.35)' : 'rgba(145, 148, 161, 0.18)';
          ctx.fillText(char, x, y);

          if (y > height && Math.random() > 0.975) {
            rainDrops[i] = 0;
          }
          rainDrops[i]++;
        }
      } else if (mode === 'grid') {
        // 3D Perspective Cyber Floor Grid
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.strokeStyle = 'rgba(204, 145, 102, 0.08)';
        ctx.lineWidth = 1;

        const fov = 400;
        const horizon = 60 + currentRotX * 80;

        // Radiating perspective lines
        for (let x = -width; x <= width; x += 60) {
          ctx.beginPath();
          ctx.moveTo(currentRotY * 100, horizon);
          ctx.lineTo(x * 2, height);
          ctx.stroke();
        }

        // Horizontal cross lines with exponential spacing
        for (let z = 20; z < height; z = z * 1.35 + 15) {
          ctx.beginPath();
          ctx.moveTo(-width, horizon + z);
          ctx.lineTo(width, horizon + z);
          ctx.stroke();
        }
        ctx.restore();
      } else {
        // Mode: Celestial 3D Neural Mesh (Default, highly aesthetic)
        const fov = 350;
        const projected: { x: number; y: number; z: number; size: number; color: string; alpha: number }[] = [];

        // Project 3D particles to 2D screen with rotation
        const cosY = Math.cos(currentRotY);
        const sinY = Math.sin(currentRotY);
        const cosX = Math.cos(currentRotX);
        const sinX = Math.sin(currentRotX);

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          // Gentle ambient drift
          p.x += p.vx;
          p.y += p.vy;
          p.z += p.vz;

          // Soft boundary wrap
          if (p.x < -width) p.x = width;
          if (p.x > width) p.x = -width;
          if (p.y < -height) p.y = height;
          if (p.y > height) p.y = -height;
          if (p.z < -300) p.z = 300;
          if (p.z > 300) p.z = -300;

          // 3D Rotation Y
          let x1 = p.x * cosY - p.z * sinY;
          let z1 = p.z * cosY + p.x * sinY;

          // 3D Rotation X
          let y1 = p.y * cosX - z1 * sinX;
          let z2 = z1 * cosX + p.y * sinX + 500; // translate forward

          if (z2 > 10) {
            const scale = fov / z2;
            const sx = width / 2 + x1 * scale;
            const sy = height / 2 + y1 * scale;
            const size = Math.max(0.5, p.size * scale);
            const alpha = Math.min(0.7, (1 - z2 / 900) * p.alpha);

            projected.push({ x: sx, y: sy, z: z2, size, color: p.color, alpha });
          }
        }

        // Draw connecting hairline web lines between nearby particles
        const maxDist = 110;
        ctx.lineWidth = 0.65;
        for (let i = 0; i < projected.length; i++) {
          for (let j = i + 1; j < projected.length; j++) {
            const dx = projected[i].x - projected[j].x;
            const dy = projected[i].y - projected[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < maxDist) {
              const lineAlpha = (1 - dist / maxDist) * 0.16 * projected[i].alpha;
              ctx.strokeStyle = `rgba(204, 145, 102, ${lineAlpha})`;
              ctx.beginPath();
              ctx.moveTo(projected[i].x, projected[i].y);
              ctx.lineTo(projected[j].x, projected[j].y);
              ctx.stroke();
            }
          }
        }

        // Draw particle nodes
        for (let i = 0; i < projected.length; i++) {
          const pt = projected[i];
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          ctx.fillStyle = pt.color === '#cc9166' 
            ? `rgba(204, 145, 102, ${pt.alpha})`
            : `rgba(226, 227, 233, ${pt.alpha * 0.6})`;
          ctx.fill();

          // Subtle glow on copper nodes
          if (pt.color === '#cc9166' && pt.size > 1.8) {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, pt.size * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(204, 145, 102, ${pt.alpha * 0.15})`;
            ctx.fill();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [mode, reducedMotion]);

  if (reducedMotion || mode === 'off') {
    return (
      <div 
        className="fixed inset-0 pointer-events-none -z-10 bg-obsidian"
        style={{
          backgroundImage: 'radial-gradient(ellipse at 50% 20%, rgba(204, 145, 102, 0.04) 0%, rgba(8, 8, 10, 0.98) 75%)',
        }}
      />
    );
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none -z-10 w-full h-full opacity-80 transition-opacity duration-700"
      />

      {/* Discreet Ambient Theme Switcher in Bottom Left (Desktop only to prevent mobile nav collision) */}
      <div className="hidden md:block fixed bottom-3 left-4 z-30">
        <div className="relative">
          <button
            onClick={() => setShowControls(!showControls)}
            title="Interactive 3D Atmosphere"
            className="px-2.5 py-1 rounded-full bg-surface-2/70 hover:bg-surface-3/90 border border-border-subtle/60 backdrop-blur-md text-[10px] font-mono text-text-tertiary hover:text-accent-copper transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent-copper animate-pulse" />
            <span>3D {mode.toUpperCase()}</span>
          </button>

          {showControls && (
            <div className="absolute bottom-8 left-0 p-2 bg-surface-2/95 border border-border-default rounded-xl backdrop-blur-xl shadow-2xl flex flex-col gap-1 w-36 animate-slide-up">
              <span className="text-[9px] uppercase tracking-wider text-text-tertiary px-2 py-0.5">Atmosphere</span>
              {(['celestial', 'matrix', 'grid', 'off'] as BackgroundMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMode(m);
                    setShowControls(false);
                  }}
                  className={`px-2 py-1 rounded-lg text-left text-2xs transition-colors flex items-center justify-between ${
                    mode === m 
                      ? 'bg-surface-4 text-accent-copper font-medium' 
                      : 'text-text-secondary hover:bg-surface-3'
                  }`}
                >
                  <span className="capitalize">{m}</span>
                  {mode === m && <span className="text-2xs">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
