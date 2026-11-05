'use client';

import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    THREE?: any;
    VANTA?: {
      CLOUDS?: (options: any) => any;
      [key: string]: any;
    };
  }
}

interface BackgroundCanvas3DProps {
  onReplayIntro?: () => void;
}

export default function BackgroundCanvas3D({ onReplayIntro }: BackgroundCanvas3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const vantaEffectRef = useRef<any>(null);
  const [isVantaLoaded, setIsVantaLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Helper to safely load dynamic scripts
    const loadScript = (src: string, id: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const existing = document.getElementById(id) as HTMLScriptElement | null;
        if (existing) {
          if (existing.getAttribute('data-loaded') === 'true' || (window as any).THREE) {
            resolve();
            return;
          }
          existing.addEventListener('load', () => resolve(), { once: true });
          existing.addEventListener('error', (e) => reject(e), { once: true });
          return;
        }

        const script = document.createElement('script');
        script.id = id;
        script.src = src;
        script.async = true;
        script.onload = () => {
          script.setAttribute('data-loaded', 'true');
          resolve();
        };
        script.onerror = (e) => reject(e);
        document.head.appendChild(script);
      });
    };

    async function initVantaClouds() {
      try {
        // 1. Ensure Three.js r134 is loaded (as required by Vanta.Clouds)
        if (!window.THREE) {
          await loadScript(
            'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js',
            'three-r134-cdn'
          );
        }

        // 2. Ensure Vanta.Clouds is loaded
        if (!window.VANTA?.CLOUDS) {
          await loadScript(
            'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.clouds.min.js',
            'vanta-clouds-cdn'
          );
        }

        if (!mounted || !containerRef.current) return;

        // 3. Destroy any previous instance
        if (vantaEffectRef.current && typeof vantaEffectRef.current.destroy === 'function') {
          vantaEffectRef.current.destroy();
          vantaEffectRef.current = null;
        }

        // 4. Initialize VANTA.CLOUDS with exact user configuration and harmonious workshop colors
        if (window.VANTA?.CLOUDS) {
          vantaEffectRef.current = window.VANTA.CLOUDS({
            el: containerRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            skyColor: 0x68b8d7,
            cloudColor: 0xadc1de,
            cloudShadowColor: 0x183550,
            sunColor: 0xff9919,
            sunGlareColor: 0xff6633,
            sunlightColor: 0xff9933,
            speed: 1.0,
          });
          setIsVantaLoaded(true);
        }
      } catch (err) {
        console.warn('VANTA.CLOUDS initialization failed, falling back to sky atmosphere:', err);
      }
    }

    initVantaClouds();

    return () => {
      mounted = false;
      if (vantaEffectRef.current && typeof vantaEffectRef.current.destroy === 'function') {
        try {
          vantaEffectRef.current.destroy();
        } catch {
          // Safe ignore on rapid unmount
        }
        vantaEffectRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="vanta-clouds-container"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      style={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(180deg, #68b8d7 0%, #adc1de 50%, #e0f2fe 100%)',
      }}
      aria-hidden="true"
    />
  );
}
