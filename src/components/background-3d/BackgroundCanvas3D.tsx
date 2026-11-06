'use client';

import React, { useEffect, useRef } from 'react';

interface BackgroundCanvas3DProps {
  onReplayIntro?: () => void;
}

interface Particle3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  baseRadius: number;
  color: string;
  glowColor: string;
  baseAlpha: number;
  pulsePhase: number;
  pulseSpeed: number;
  screenX: number;
  screenY: number;
  proj: number;
}

export default function BackgroundCanvas3D({ onReplayIntro }: BackgroundCanvas3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true,
    });
    if (!ctx) return;

    let animId: number | null = null;
    let isRunning = true;
    let lastTime = performance.now();

    // Check device capability
    const isMobile =
      typeof window !== 'undefined' &&
      (window.innerWidth < 768 || 'ontouchstart' in window);

    // Screen dimensions & sizing with devicePixelRatio clamping
    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = isMobile ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.5);

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();

    // Mouse coordinates for subtle interactive gravity on desktop
    const mouse = {
      x: -9999,
      y: -9999,
      targetX: -9999,
      targetY: -9999,
      active: false,
    };

    // Parallax scroll camera tracker
    let scrollY = window.scrollY || 0;
    let targetScrollY = scrollY;

    // Palette: Atmospheric Sky, Soft Indigo, Luminous Amber, Crisp Cyan
    const colors = [
      { core: '#0284c7', glow: 'rgba(2, 132, 199, 0.45)' }, // Sky
      { core: '#0ea5e9', glow: 'rgba(14, 165, 233, 0.45)' }, // Cyan
      { core: '#4f46e5', glow: 'rgba(79, 70, 229, 0.4)' },  // Indigo
      { core: '#d97706', glow: 'rgba(217, 119, 6, 0.45)' },  // Amber
      { core: '#ea580c', glow: 'rgba(234, 88, 12, 0.4)' },   // Orange
    ];

    // Particle count: 36 on mobile for 120 FPS feather-light rendering; 72 on desktop
    const count = isMobile ? 36 : 72;
    const particles: Particle3D[] = [];

    const spawnRadiusX = width * 0.9;
    const spawnRadiusY = height * 1.2;

    for (let i = 0; i < count; i++) {
      const col = colors[Math.floor(Math.random() * colors.length)];
      particles.push({
        x: (Math.random() - 0.5) * spawnRadiusX,
        y: (Math.random() - 0.5) * spawnRadiusY,
        z: Math.random() * 500 - 150, // Depth from -150 to +350
        vx: (Math.random() - 0.5) * (isMobile ? 0.35 : 0.5),
        vy: (Math.random() - 0.5) * (isMobile ? 0.35 : 0.5),
        vz: (Math.random() - 0.5) * 0.3,
        baseRadius: Math.random() * 1.8 + (isMobile ? 1.6 : 1.8),
        color: col.core,
        glowColor: col.glow,
        baseAlpha: Math.random() * 0.35 + 0.45,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.025 + 0.015,
        screenX: 0,
        screenY: 0,
        proj: 1,
      });
    }

    // Connect distance threshold in 3D (squared to prevent Math.sqrt)
    const maxDist = isMobile ? 100 : 135;
    const maxDistSq = maxDist * maxDist;

    // FOV for 3D Perspective Projection
    const fov = 380;

    // Animation Loop
    let time = 0;

    const render = (now: number) => {
      if (!isRunning) return;

      const dt = Math.min((now - lastTime) / 1000, 0.1); // Clamp delta time to avoid large jumps
      lastTime = now;
      time += dt;

      // Smooth scroll interpolation for gentle 3D parallax
      targetScrollY = window.scrollY || 0;
      scrollY += (targetScrollY - scrollY) * (isMobile ? 0.15 : 0.1);

      // Smooth mouse follow on desktop
      if (!isMobile && mouse.active) {
        mouse.x += (mouse.targetX - mouse.x) * 0.1;
        mouse.y += (mouse.targetY - mouse.y) * 0.1;
      }

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      const halfW = width * 0.5;
      const halfH = height * 0.5;

      // 1. Draw Flowing Luminous Aurora Wave Gradients (Soft, living sky atmosphere)
      // Subtle sine wave oscillations create organic flowing aurora without GPU stress
      const aX1 = halfW + Math.sin(time * 0.35) * (width * 0.22);
      const aY1 = halfH * 0.65 + Math.cos(time * 0.4) * (height * 0.15);
      const rad1 = Math.max(width, height) * (isMobile ? 0.6 : 0.5);

      const g1 = ctx.createRadialGradient(aX1, aY1, 0, aX1, aY1, rad1);
      g1.addColorStop(0, 'rgba(56, 189, 248, 0.18)'); // Sky cyan
      g1.addColorStop(0.5, 'rgba(99, 102, 241, 0.08)'); // Indigo
      g1.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, width, height);

      // Warm sunrise solar accent aura
      const aX2 = halfW * 1.35 + Math.cos(time * 0.28) * (width * 0.18);
      const aY2 = halfH * 1.1 + Math.sin(time * 0.32) * (height * 0.14);
      const rad2 = Math.max(width, height) * (isMobile ? 0.5 : 0.42);

      const g2 = ctx.createRadialGradient(aX2, aY2, 0, aX2, aY2, rad2);
      g2.addColorStop(0, 'rgba(245, 158, 11, 0.14)'); // Amber solar glow
      g2.addColorStop(0.6, 'rgba(234, 88, 12, 0.05)'); // Orange
      g2.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, width, height);

      // 2. Update and Project 3D Ideation Particles
      const boundX = width * 0.55;
      const boundY = height * 0.7;

      for (let i = 0; i < count; i++) {
        const p = particles[i];

        // Move in 3D space with gentle harmonic drift
        p.x += p.vx + Math.sin(time * 0.8 + p.pulsePhase) * 0.15;
        p.y += p.vy + Math.cos(time * 0.7 + p.pulsePhase) * 0.15;
        p.z += p.vz;

        // Wrap around boundaries smoothly
        if (p.x < -boundX) p.x = boundX;
        else if (p.x > boundX) p.x = -boundX;

        if (p.y < -boundY) p.y = boundY;
        else if (p.y > boundY) p.y = -boundY;

        if (p.z < -150) p.z = 350;
        else if (p.z > 350) p.z = -150;

        // Interactive mouse repulsion/attraction on desktop
        if (!isMobile && mouse.active) {
          const mdx = p.screenX - mouse.x;
          const mdy = p.screenY - mouse.y;
          const mDistSq = mdx * mdx + mdy * mdy;
          if (mDistSq < 22500 && mDistSq > 1) { // 150px radius
            const mDist = Math.sqrt(mDistSq);
            const force = (1 - mDist / 150) * 0.8;
            p.x += (mdx / mDist) * force * 15;
            p.y += (mdy / mDist) * force * 15;
          }
        }

        // 3D Perspective Projection
        const effZ = p.z + 150; // shift for positive depth
        const proj = fov / (fov + effZ);
        p.proj = proj;

        // Camera scroll parallax (subtle vertical shift with depth)
        const scrollParallaxY = scrollY * (0.08 + (1 - proj) * 0.12);

        p.screenX = halfW + p.x * proj;
        p.screenY = halfH + (p.y - scrollParallaxY) * proj;
      }

      // 3. Render 3D Synaptic Idea Connections (Lines)
      ctx.lineWidth = isMobile ? 0.8 : 1.0;
      for (let i = 0; i < count; i++) {
        const p1 = particles[i];
        if (p1.screenX < -50 || p1.screenX > width + 50 || p1.screenY < -50 || p1.screenY > height + 50) {
          continue;
        }

        for (let j = i + 1; j < count; j++) {
          const p2 = particles[j];

          // Rapid 2D screen distance cull before 3D
          const dx = p1.screenX - p2.screenX;
          const dy = p1.screenY - p2.screenY;
          const distSq2D = dx * dx + dy * dy;

          if (distSq2D < maxDistSq) {
            const dz = p1.z - p2.z;
            const distSq3D = distSq2D + dz * dz * 0.25;

            if (distSq3D < maxDistSq) {
              const alphaRatio = 1 - distSq3D / maxDistSq;
              const lineAlpha = alphaRatio * 0.28 * Math.min(p1.proj, p2.proj);

              ctx.strokeStyle = `rgba(2, 132, 199, ${lineAlpha.toFixed(3)})`;
              ctx.beginPath();
              ctx.moveTo(p1.screenX, p1.screenY);
              ctx.lineTo(p2.screenX, p2.screenY);
              ctx.stroke();
            }
          }
        }
      }

      // 4. Render Glowing Particle Nodes
      for (let i = 0; i < count; i++) {
        const p = particles[i];

        if (p.screenX < -20 || p.screenX > width + 20 || p.screenY < -20 || p.screenY > height + 20) {
          continue;
        }

        const renderRadius = Math.max(0.8, p.baseRadius * p.proj);
        const pulse = Math.sin(time * 3 + p.pulsePhase) * 0.15;
        const alpha = Math.min(1, Math.max(0.1, (p.baseAlpha + pulse) * p.proj));

        // Soft outer glow aura
        ctx.fillStyle = p.glowColor;
        ctx.globalAlpha = alpha * 0.6;
        ctx.beginPath();
        ctx.arc(p.screenX, p.screenY, renderRadius * 2.6, 0, Math.PI * 2);
        ctx.fill();

        // Bright high-definition core node
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.screenX, p.screenY, renderRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(render);
    };

    // Event listeners
    const handleResize = () => {
      resizeCanvas();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isRunning = false;
        if (animId) cancelAnimationFrame(animId);
      } else {
        if (!isRunning) {
          isRunning = true;
          lastTime = performance.now();
          animId = requestAnimationFrame(render);
        }
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('visibilitychange', handleVisibilityChange);

    if (!isMobile) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('mouseleave', handleMouseLeave);
    }

    // Start 60-120fps animation loop
    animId = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      if (!isMobile) {
        window.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <div
      id="dynamic-3d-background"
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none"
      style={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(180deg, #dbeafe 0%, #eff6ff 35%, #f8fafc 70%, #ffffff 100%)',
      }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block pointer-events-none"
      />
    </div>
  );
}
