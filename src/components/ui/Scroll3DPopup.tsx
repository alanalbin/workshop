'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

interface Scroll3DPopupProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  distance?: number;
  rotateX?: number;
  enableContinuous3D?: boolean;
}

/**
 * Desktop-only continuous 3D emergence with spring dynamics.
 * Separated into a sub-component so mobile devices never mount or execute useScroll / useSpring.
 */
function DesktopScroll3DPopup({
  children,
  className = '',
  rotateX = 5,
  enableContinuous3D = true,
}: Scroll3DPopupProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 95,
    damping: 28,
    mass: 0.35,
    restDelta: 0.0001,
  });

  const scrollRotateX = useTransform(smoothProgress, [0, 0.22, 0.82, 1], [rotateX, 0, 0, -2]);
  const scrollScale = useTransform(smoothProgress, [0, 0.22, 0.82, 1], [0.94, 1, 1, 0.97]);
  const scrollOpacity = useTransform(smoothProgress, [0, 0.18, 0.86, 1], [0.45, 1, 1, 0.88]);
  const scrollY = useTransform(smoothProgress, [0, 0.22, 0.82, 1], [32, 0, 0, -12]);

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      style={{
        perspective: 1400,
        perspectiveOrigin: '50% 40%',
      }}
    >
      <motion.div
        style={{
          rotateX: enableContinuous3D ? scrollRotateX : 0,
          scale: enableContinuous3D ? scrollScale : 1,
          opacity: enableContinuous3D ? scrollOpacity : 1,
          y: enableContinuous3D ? scrollY : 0,
          transformStyle: 'preserve-3d',
          transformOrigin: '50% 50%',
          willChange: 'transform, opacity',
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export default function Scroll3DPopup(props: Scroll3DPopupProps) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  // On mobile: bypass continuous scroll transforms completely for 100% native 120 FPS compositor scrolling
  if (isMobile) {
    return <div className={`relative ${props.className || ''}`}>{props.children}</div>;
  }

  // On desktop: full 3D perspective spring emergence
  return <DesktopScroll3DPopup {...props} />;
}
