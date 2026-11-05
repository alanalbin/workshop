'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb,
  Sparkles,
  RotateCw,
  Compass,
  Zap,
  Target,
  Layers,
  Rocket,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import TouchInteractiveTilt from '@/components/ui/TouchInteractiveTilt';

interface WorkshopStage {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  color: string;
  threeColor: number;
  icon: React.ElementType;
  description: string;
  exercise: string;
  deliverable: string;
}

const STAGES: WorkshopStage[] = [
  {
    id: 'discovery',
    number: '01',
    title: 'Problem Discovery',
    subtitle: 'Symptom Sorting & Root Causes',
    color: '#7c3aed',
    threeColor: 0x7c3aed,
    icon: Target,
    description: 'Differentiating surface complaints from underlying structural friction using the 5-Whys framework.',
    exercise: 'Classify 15 real-world engineering campus challenges into Problem vs. Symptom vs. Premature Solution.',
    deliverable: '1 Validated Problem Statement Canvas',
  },
  {
    id: 'empathy',
    number: '02',
    title: 'Empathy Discovery',
    subtitle: 'User Interviews & Friction Mapping',
    color: '#9333ea',
    threeColor: 0x9333ea,
    icon: Compass,
    description: 'Uncovering unarticulated user needs through structured observation, empathy worksheets, and stakeholder journeys.',
    exercise: 'Map the emotional highs and pain points of students, faculty, or community members for the target issue.',
    deliverable: '1 User Empathy & Persona Grid',
  },
  {
    id: 'crazy8s',
    number: '03',
    title: 'Crazy 8s Sprint',
    subtitle: 'Rapid Divergent Ideation',
    color: '#ea580c',
    threeColor: 0xea580c,
    icon: Zap,
    description: 'A fast-paced core design sprint method challenging every student to sketch 8 distinct solutions in 8 minutes.',
    exercise: 'Fold chart paper into 8 rectangles, spend 60 seconds per frame, and break free from initial conventional ideas.',
    deliverable: '8 Raw Conceptual Sketches per Student',
  },
  {
    id: 'possibility',
    number: '04',
    title: 'Prototype & Pitch',
    subtitle: 'Low-Fi Build to Pitch Deck',
    color: '#059669',
    threeColor: 0x059669,
    icon: Rocket,
    description: 'Synthesizing ideas into paper prototypes and pitching the concept before peers and mentors in a 3-minute shark tank.',
    exercise: 'Build chart-paper prototypes and present with Problem-Solution-Market-Impact value proposition slides.',
    deliverable: '1 Functional Prototype Poster + Pitch Deck',
  },
];

const IDEA_PROMPTS = [
  {
    title: 'Smart Campus Energy Auditor',
    problem: 'Empty lecture halls leave ACs and high-draw lab equipment powered during off-peak hours.',
    possibility: 'Edge-AI low-cost PIR mesh sensor that auto-toggles breaker relays with 0 manual intervention.',
  },
  {
    title: 'Malabar Monsoon Flood Warning Mesh',
    problem: 'Rural river tributaries lack telemetry stations, causing sudden road and crop inundation in Kasaragod.',
    possibility: 'Solar-powered ultrasonic water level buoys sending LoRa alerts to village council dashboards.',
  },
  {
    title: 'Coconut Husk Bio-Insulation Panels',
    problem: 'Excess agrarian coconut coir is discarded while engineering workshops require acoustic dampening.',
    possibility: 'Pressed coir-starch composite acoustic ceiling panels with fire-retardant salt bath treatment.',
  },
  {
    title: 'Hands-Free Lab Attendance Scanner',
    problem: 'Physical sign-in registers cause bottlenecks and proxies at college department entry desks.',
    possibility: 'Sub-second QR badge verification kiosk synced to Cloud Firestore with live seat accounting.',
  },
];

export default function Workshop3DStudio() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [sparkPromptIndex, setSparkPromptIndex] = useState(0);
  const [isSparking, setIsSparking] = useState(false);

  // References to communicate with 3D animation loop
  const targetRotationYRef = useRef(0);
  const manualRotYRef = useRef(0);
  const manualRotXRef = useRef(0.2);
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const pulseCoreRef = useRef<(() => void) | null>(null);

  const activeStage = STAGES[activeStageIndex];

  // 3D Canvas Lifecycle
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 7.5);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 3. Lighting (Soft studio setup tuned for soft slate theme)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);

    const purpleFillLight = new THREE.PointLight(0x7c3aed, 3.5, 20);
    purpleFillLight.position.set(-6, 3, 2);
    scene.add(purpleFillLight);

    const amberFillLight = new THREE.PointLight(0xf59e0b, 3.0, 20);
    amberFillLight.position.set(6, -2, 2);
    scene.add(amberFillLight);

    // 4. Central 3D Innovation Core (Facet Gem + Wireframe Cage)
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Solid inner core (Icosahedron)
    const innerGeo = new THREE.IcosahedronGeometry(1.35, 1);
    const innerMat = new THREE.MeshPhysicalMaterial({
      color: 0x7c3aed,
      emissive: 0x2e1065,
      roughness: 0.2,
      metalness: 0.15,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1,
      transmission: 0.35,
      thickness: 1.2,
      wireframe: false,
    });
    const innerCore = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerCore);

    // Outer wireframe cage (Dodecahedron)
    const cageGeo = new THREE.DodecahedronGeometry(1.85, 0);
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0x9333ea,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const cageMesh = new THREE.Mesh(cageGeo, cageMat);
    coreGroup.add(cageMesh);

    // Glowing orbital halo ring
    const haloGeo = new THREE.TorusGeometry(2.35, 0.035, 16, 100);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.6,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.rotation.x = Math.PI / 2.3;
    coreGroup.add(haloMesh);

    // 5. 4 Orbiting Workshop Stage Satellites
    const stageNodes: THREE.Mesh[] = [];
    const stageRadius = 2.95;

    STAGES.forEach((stage, index) => {
      const angle = (index / STAGES.length) * Math.PI * 2;
      const x = Math.cos(angle) * stageRadius;
      const z = Math.sin(angle) * stageRadius;

      const nodeGeo = new THREE.SphereGeometry(0.32, 24, 24);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: stage.threeColor,
        emissive: stage.threeColor,
        emissiveIntensity: 0.45,
        roughness: 0.25,
        metalness: 0.3,
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.set(x, 0, z);

      // Mini ring around each satellite
      const ringGeo = new THREE.RingGeometry(0.42, 0.47, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: stage.threeColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      nodeMesh.add(ring);

      coreGroup.add(nodeMesh);
      stageNodes.push(nodeMesh);
    });

    // 6. Floating Spark Particles Cloud
    const particleCount = 75;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 8.5;
      particlePos[i + 1] = (Math.random() - 0.5) * 6.5;
      particlePos[i + 2] = (Math.random() - 0.5) * 6.5;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x7c3aed,
      size: 0.08,
      transparent: true,
      opacity: 0.75,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Function to trigger energetic core pulse
    let pulseScale = 1.0;
    pulseCoreRef.current = () => {
      pulseScale = 1.45;
      innerMat.emissiveIntensity = 1.2;
      cageMat.opacity = 0.9;
    };

    // 7. Mouse / Touch Drag Listeners
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      manualRotYRef.current += dx * 0.007;
      manualRotXRef.current += dy * 0.005;
      manualRotXRef.current = Math.max(-0.6, Math.min(0.6, manualRotXRef.current));
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - lastMousePosRef.current.x;
      const dy = e.touches[0].clientY - lastMousePosRef.current.y;
      manualRotYRef.current += dx * 0.007;
      manualRotXRef.current += dy * 0.005;
      manualRotXRef.current = Math.max(-0.6, Math.min(0.6, manualRotXRef.current));
      lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // 8. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Damped pulse relaxation
      if (pulseScale > 1.0) {
        pulseScale += (1.0 - pulseScale) * 0.08;
        innerCore.scale.set(pulseScale, pulseScale, pulseScale);
        innerMat.emissiveIntensity += (0.25 - innerMat.emissiveIntensity) * 0.08;
        cageMat.opacity += (0.45 - cageMat.opacity) * 0.08;
      }

      // Auto-rotation or smooth alignment to manual rotation
      if (isAutoRotate && !isDraggingRef.current) {
        manualRotYRef.current += 0.006;
      }

      // Smooth interpolation for core rotation
      coreGroup.rotation.y += (manualRotYRef.current - coreGroup.rotation.y) * 0.1;
      coreGroup.rotation.x += (manualRotXRef.current - coreGroup.rotation.x) * 0.1;

      // Internal gear counter-rotation
      innerCore.rotation.y = elapsed * 0.35;
      innerCore.rotation.x = Math.sin(elapsed * 0.5) * 0.2;
      cageMesh.rotation.y = -elapsed * 0.25;
      haloMesh.rotation.z = elapsed * 0.45;

      // Bobbing satellites
      stageNodes.forEach((node, idx) => {
        node.position.y = Math.sin(elapsed * 2 + idx * 1.5) * 0.18;
        node.rotation.y = elapsed * 0.8;
      });

      // Slowly rotate spark particles
      particles.rotation.y = -elapsed * 0.04;
      particles.rotation.x = Math.sin(elapsed * 0.05) * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      innerGeo.dispose();
      innerMat.dispose();
      cageGeo.dispose();
      cageMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, [isAutoRotate]);

  // Stage Switch Handler
  const handleSelectStage = (index: number) => {
    setActiveStageIndex(index);
    pulseCoreRef.current?.();

    // Rotate 3D group so selected stage faces front
    const targetAngle = -(index / STAGES.length) * Math.PI * 2 + Math.PI / 2;
    manualRotYRef.current = targetAngle;
  };

  // Spark Generator Handler
  const handleSparkIdea = () => {
    setIsSparking(true);
    pulseCoreRef.current?.();
    setSparkPromptIndex((prev) => (prev + 1) % IDEA_PROMPTS.length);

    setTimeout(() => {
      setIsSparking(false);
    }, 600);
  };

  const currentPrompt = IDEA_PROMPTS[sparkPromptIndex];

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden bg-[#e8ecf2] border-t border-slate-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-20">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-xs font-bold uppercase tracking-wider text-purple-700 mb-3.5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-spin" />
            <span>Interactive 3D Ideation Studio</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            The Problem to Possibility Engine
          </h2>
          <p className="mt-3 text-slate-700 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Interact with the 4 pillars of the workshop. Drag to orbit the 3D model, click stage satellites, and trigger real-time innovation prompts.
          </p>
        </div>

        {/* Main 3D Studio Showcase Bento Card */}
        <div className="rounded-3xl bg-white border border-slate-300 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Column: Interactive 3D Three.js Viewport (7 Cols) */}
          <div className="lg:col-span-7 relative bg-gradient-to-b from-[#f3f6fa] via-[#e8edf4] to-[#dfe5ec] border-b lg:border-b-0 lg:border-r border-slate-300 min-h-[380px] sm:min-h-[460px] flex flex-col justify-between overflow-hidden select-none">
            
            {/* Top 3D Viewport Toolbar */}
            <div className="p-4 sm:p-5 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800">
                  3D Ideation Core · Live Orbit
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAutoRotate(!isAutoRotate)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                    isAutoRotate
                      ? 'bg-purple-50 text-purple-700 border-purple-200 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                  title="Toggle auto-spin"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isAutoRotate ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{isAutoRotate ? 'Auto Orbit' : 'Manual'}</span>
                </button>
              </div>
            </div>

            {/* 3D WebGL Canvas Mounting Element */}
            <div
              ref={containerRef}
              className="absolute inset-0 cursor-grab active:cursor-grabbing w-full h-full"
            />

            {/* Bottom 3D Viewport Interaction Guide */}
            <div className="p-4 sm:p-5 flex items-center justify-between relative z-10 pointer-events-none">
              <span className="text-[11px] font-mono text-slate-600 bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200">
                👆 Drag to rotate 3D core • Pinch/Scroll to explore
              </span>

              <div className="hidden sm:flex items-center gap-1.5 bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-mono text-slate-700 font-bold">
                <span className="text-purple-700">KMCTCEEM</span> • IIC Q1
              </div>
            </div>
          </div>

          {/* Right Column: Active Stage Details & Ideation Simulator (5 Cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-white space-y-6">
            
            {/* 4 Interactive Stage Selector Pills */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-600 font-bold">
                  Select Workshop Phase:
                </span>
                <span className="text-xs font-bold text-purple-700 font-mono">
                  {activeStage.number} / 04
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {STAGES.map((stg, i) => {
                  const isSel = i === activeStageIndex;
                  return (
                    <button
                      key={stg.id}
                      type="button"
                      onClick={() => handleSelectStage(i)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                        isSel
                          ? 'bg-purple-50 border-purple-300 shadow-2xs ring-1 ring-purple-200'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: stg.color }}
                      />
                      <span className={`text-xs font-bold truncate ${isSel ? 'text-purple-900' : 'text-slate-800'}`}>
                        {stg.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Stage Deep-Dive Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStage.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="p-5 rounded-2xl bg-[#f8fafc] border border-slate-200 space-y-3.5 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white border border-slate-200 shadow-2xs" style={{ color: activeStage.color }}>
                    <activeStage.icon className="w-3.5 h-3.5" />
                    <span>{activeStage.subtitle}</span>
                  </div>
                  <span className="text-xs font-mono font-black text-slate-400">
                    PHASE {activeStage.number}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900">{activeStage.title}</h3>
                  <p className="mt-1 text-xs text-slate-700 leading-relaxed font-medium">
                    {activeStage.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold block">
                      Hands-on Session Exercise
                    </span>
                    <p className="text-slate-800 font-semibold mt-0.5">
                      {activeStage.exercise}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-purple-700 font-bold block">
                      Student Cohort Deliverable
                    </span>
                    <p className="text-purple-900 font-bold mt-0.5 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{activeStage.deliverable}</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Interactive "Spark an Idea" Generator Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-amber-50 to-orange-50 border border-purple-200 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-900">
                    Live Workshop Ideation Spark:
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleSparkIdea}
                  disabled={isSparking}
                  className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isSparking ? 'animate-spin' : ''}`} />
                  <span>Next Spark</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-white/90 border border-slate-200 text-xs space-y-1">
                <p className="font-extrabold text-slate-900 text-sm">{currentPrompt.title}</p>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  <strong className="text-amber-800">Problem:</strong> {currentPrompt.problem}
                </p>
                <p className="text-slate-800 text-[11px] leading-relaxed font-semibold">
                  <strong className="text-emerald-700">Possibility:</strong> {currentPrompt.possibility}
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}