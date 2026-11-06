'use client';

import React, { useEffect, useRef } from 'react';

export default function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    let cachedTotalHeight = 1;

    const measure = () => {
      cachedTotalHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    };

    measure();

    const updateProgress = () => {
      if (barRef.current) {
        const progress = Math.min(1, Math.max(0, window.scrollY / cachedTotalHeight));
        barRef.current.style.transform = `scaleX(${progress})`;
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', measure, { passive: true });
    updateProgress();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] z-[100] pointer-events-none bg-transparent">
      <div
        ref={barRef}
        className="h-full w-full bg-gradient-to-r from-sky-500 via-indigo-500 to-amber-500 origin-left will-change-transform shadow-[0_0_12px_rgba(2,132,199,0.8)]"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  );
}

