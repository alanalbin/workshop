'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface BackgroundCanvas3DProps {
  onReplayIntro?: () => void;
}

export default function BackgroundCanvas3D({ onReplayIntro }: BackgroundCanvas3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);

  useEffect(() => {
    // 1. WebGL Support Check
    try {
      const testCanvas = document.createElement('canvas');
      const gl =
        testCanvas.getContext('webgl2') ||
        testCanvas.getContext('webgl') ||
        testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch {
      setWebglSupported(false);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const isMobile = window.innerWidth < 768;

    // 2. Three.js Scene, Fog & Camera
    const scene = new THREE.Scene();
    // Soft slate fog matching the theme (#e8ecf2)
    const themeBgColor = 0xe8ecf2;
    scene.fog = new THREE.FogExp2(themeBgColor, isMobile ? 0.0035 : 0.0022);

    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 95);

    // 3. Renderer with High Dynamic Range & Alpha
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'high-performance',
      precision: isMobile ? 'mediump' : 'highp',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(isMobile ? 1.0 : Math.min(window.devicePixelRatio, 1.5));
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.pointerEvents = 'none';
    container.appendChild(renderer.domElement);

    // 4. Lighting Setup (Soft Studio Ambient + Vibrant Ideation Lights)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    mainKeyLight.position.set(15, 30, 40);
    scene.add(mainKeyLight);

    const purpleLight = new THREE.PointLight(0x7c3aed, 4.0, 160);
    purpleLight.position.set(-30, 20, 20);
    scene.add(purpleLight);

    const amberLight = new THREE.PointLight(0xf59e0b, 3.5, 160);
    amberLight.position.set(30, -20, 20);
    scene.add(amberLight);

    // Dynamic Cursor Probe Light that tracks mouse
    const cursorLight = new THREE.PointLight(0x9333ea, 2.5, 90);
    cursorLight.position.set(0, 0, 30);
    scene.add(cursorLight);

    // 5. THE WORKSHOP 3D "PROBLEM TO POSSIBILITY" CORE
    // A central multifaceted ideation crystal that gracefully hovers in the background
    const coreGroup = new THREE.Group();
    coreGroup.position.set(0, 0, -10);
    scene.add(coreGroup);

    // Faceted Innovation Crystal (Icosahedron)
    const crystalRadius = isMobile ? 10 : 16;
    const crystalGeo = new THREE.IcosahedronGeometry(crystalRadius, 1);
    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: 0x8b5cf6,
      emissive: 0x3b0764,
      emissiveIntensity: 0.25,
      roughness: 0.18,
      metalness: 0.15,
      transmission: 0.45,
      thickness: 2.0,
      transparent: true,
      opacity: 0.85,
    });
    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    coreGroup.add(crystalMesh);

    // Wireframe Idea Skeleton (Dodecahedron cage representing structured problem solving)
    const cageGeo = new THREE.DodecahedronGeometry(crystalRadius * 1.35, 0);
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0x7c3aed,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const cageMesh = new THREE.Mesh(cageGeo, cageMat);
    coreGroup.add(cageMesh);

    // Dual Orbital Possibility Rings (representing Divergent & Convergent thinking)
    const ring1Geo = new THREE.TorusGeometry(crystalRadius * 1.85, 0.12, 16, 120);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.55,
    });
    const ring1Mesh = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1Mesh.rotation.x = Math.PI / 2.8;
    ring1Mesh.rotation.y = Math.PI / 6;
    coreGroup.add(ring1Mesh);

    const ring2Geo = new THREE.TorusGeometry(crystalRadius * 2.2, 0.08, 16, 120);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x9333ea,
      transparent: true,
      opacity: 0.45,
    });
    const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2Mesh.rotation.x = -Math.PI / 3;
    ring2Mesh.rotation.y = -Math.PI / 5;
    coreGroup.add(ring2Mesh);

    // 6. FLOATING GEOMETRIC IDEATION NODES (Scattered Problem & Solution Concept Nodes)
    const nodeCount = isMobile ? 18 : 34;
    const nodeMeshes: THREE.Mesh[] = [];
    const nodeBasePos: THREE.Vector3[] = [];
    const nodeSpeeds: { rotX: number; rotY: number; bobSpeed: number; bobOffset: number }[] = [];

    const nodeColors = [0x7c3aed, 0x9333ea, 0xf59e0b, 0xea580c, 0x10b981];
    const nodeGeos = [
      new THREE.OctahedronGeometry(1.2, 0),
      new THREE.TetrahedronGeometry(1.4, 0),
      new THREE.IcosahedronGeometry(1.1, 0),
      new THREE.BoxGeometry(1.3, 1.3, 1.3),
    ];

    for (let i = 0; i < nodeCount; i++) {
      const geo = nodeGeos[i % nodeGeos.length];
      const color = nodeColors[i % nodeColors.length];
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.35,
        roughness: 0.2,
        metalness: 0.25,
        transparent: true,
        opacity: 0.8,
      });

      const mesh = new THREE.Mesh(geo, mat);

      // Distribute in a spherical cloud around the view
      const angle = Math.random() * Math.PI * 2;
      const radius = 28 + Math.random() * 45;
      const x = Math.cos(angle) * radius * 1.5;
      const y = (Math.random() - 0.5) * 60;
      const z = (Math.random() - 0.5) * 45 - 10;

      mesh.position.set(x, y, z);
      scene.add(mesh);
      nodeMeshes.push(mesh);
      nodeBasePos.push(new THREE.Vector3(x, y, z));

      nodeSpeeds.push({
        rotX: (Math.random() - 0.5) * 0.02,
        rotY: (Math.random() - 0.5) * 0.02,
        bobSpeed: 0.8 + Math.random() * 1.2,
        bobOffset: Math.random() * Math.PI * 2,
      });
    }

    // 7. INTERACTIVE SYNAPTIC CONSTELLATION LINES (Idea Connections)
    const maxConnections = isMobile ? 40 : 85;
    const linePositions = new Float32Array(maxConnections * 6);
    const lineColors = new Float32Array(maxConnections * 6);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.45,
      blending: THREE.NormalBlending,
    });
    const lineMesh = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lineMesh);

    // 8. FLOATING IDEA SPARK PARTICLES
    const sparkCount = isMobile ? 90 : 180;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPositions = new Float32Array(sparkCount * 3);
    const sparkColors = new Float32Array(sparkCount * 3);

    for (let i = 0; i < sparkCount; i++) {
      const i3 = i * 3;
      sparkPositions[i3] = (Math.random() - 0.5) * 140;
      sparkPositions[i3 + 1] = (Math.random() - 0.5) * 110;
      sparkPositions[i3 + 2] = (Math.random() - 0.5) * 80;

      // Purple to Amber particles
      const isAmber = Math.random() > 0.6;
      if (isAmber) {
        sparkColors[i3] = 0.96;
        sparkColors[i3 + 1] = 0.62;
        sparkColors[i3 + 2] = 0.12;
      } else {
        sparkColors[i3] = 0.52;
        sparkColors[i3 + 1] = 0.28;
        sparkColors[i3 + 2] = 0.94;
      }
    }

    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
    sparkGeo.setAttribute('color', new THREE.BufferAttribute(sparkColors, 3));

    const sparkMat = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
    });
    const sparkField = new THREE.Points(sparkGeo, sparkMat);
    scene.add(sparkField);

    // 9. CLICK RIPPLE WAVE (Luminous Radial Possibility Shockwave)
    const rippleGeo = new THREE.RingGeometry(0.5, 1.4, 48);
    const rippleMat = new THREE.MeshBasicMaterial({
      color: 0x9333ea,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    const rippleMesh = new THREE.Mesh(rippleGeo, rippleMat);
    rippleMesh.position.set(0, 0, 5);
    scene.add(rippleMesh);

    let isRippling = false;
    let rippleScale = 1.0;

    // 10. INTERACTION LISTENERS: Mouse Move, Touch, Scroll, Click
    const mouse = { x: 0, y: 0 };
    const targetMouse = { x: 0, y: 0 };
    const mouse3D = new THREE.Vector3(0, 0, 0);
    const raycaster = new THREE.Raycaster();
    const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    let scrollY = 0;
    let targetScrollY = 0;

    const onPointerMove = (e: MouseEvent) => {
      targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        targetMouse.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        targetMouse.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
      }
    };

    const onScroll = () => {
      targetScrollY = window.scrollY;
    };

    const onWindowClick = (e: MouseEvent) => {
      // Trigger a luminous ideation ripple from click location
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(new THREE.Vector2(normX, normY), camera);
      const hit = new THREE.Vector3();
      raycaster.ray.intersectPlane(planeZ, hit);

      if (hit) {
        rippleMesh.position.set(hit.x, hit.y, 2);
        rippleScale = 1.0;
        isRippling = true;
        crystalMat.emissiveIntensity = 0.9;
      }
    };

    const onResize = () => {
      if (!container) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('click', onWindowClick, { passive: true });
    window.addEventListener('resize', onResize);

    // 11. 60 FPS SIMULATION LOOP
    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.08);
      const elapsed = clock.getElapsedTime();

      // Smooth pointer & scroll interpolation
      mouse.x += (targetMouse.x - mouse.x) * 0.06;
      mouse.y += (targetMouse.y - mouse.y) * 0.06;
      scrollY += (targetScrollY - scrollY) * 0.06;

      // Project mouse into 3D world space
      raycaster.setFromCamera(new THREE.Vector2(mouse.x, mouse.y), camera);
      raycaster.ray.intersectPlane(planeZ, mouse3D);

      // Glide cursor light
      cursorLight.position.set(mouse3D.x, mouse3D.y, 25);

      // Smooth camera parallax based on cursor and scroll
      const camTargetX = mouse.x * 9;
      const camTargetY = mouse.y * 6 - scrollY * 0.016;
      camera.position.x += (camTargetX - camera.position.x) * 0.045;
      camera.position.y += (camTargetY - camera.position.y) * 0.045;
      camera.lookAt(0, -scrollY * 0.012, 0);

      // Central Innovation Core rotation & gyroscopic tilt toward cursor
      coreGroup.rotation.y = elapsed * 0.25 + mouse.x * 0.45;
      coreGroup.rotation.x = Math.sin(elapsed * 0.3) * 0.15 + mouse.y * 0.35;
      cageMesh.rotation.y = -elapsed * 0.2;
      ring1Mesh.rotation.z = elapsed * 0.35;
      ring2Mesh.rotation.z = -elapsed * 0.28;

      // Soft crystal breathing & relaxation
      const breath = 1.0 + Math.sin(elapsed * 1.2) * 0.035;
      crystalMesh.scale.set(breath, breath, breath);
      crystalMat.emissiveIntensity += (0.25 - crystalMat.emissiveIntensity) * 0.06;

      // Handle Click Ripple Wave
      if (isRippling) {
        rippleScale += delta * 55;
        rippleMesh.scale.set(rippleScale, rippleScale, 1);
        rippleMat.opacity = Math.max(0, 0.75 - rippleScale / 60);
        if (rippleScale > 60) {
          isRippling = false;
        }
      }

      // Update Floating Ideation Nodes (Interactive repulsion & attraction)
      let lineIdx = 0;
      const linePosArr = (lineGeo.attributes.position as THREE.BufferAttribute).array as Float32Array;
      const lineColArr = (lineGeo.attributes.color as THREE.BufferAttribute).array as Float32Array;

      for (let i = 0; i < nodeCount; i++) {
        const mesh = nodeMeshes[i];
        const base = nodeBasePos[i];
        const speed = nodeSpeeds[i];

        // Harmonic bobbing
        mesh.rotation.x += speed.rotX;
        mesh.rotation.y += speed.rotY;
        const bobY = Math.sin(elapsed * speed.bobSpeed + speed.bobOffset) * 2.2;
        let targetX = base.x;
        let targetY = base.y + bobY;
        const targetZ = base.z;

        // Interactive mouse repulsion/magnetism
        const dx = targetX - mouse3D.x;
        const dy = targetY - mouse3D.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < 900 && distSq > 0.1) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / 30) * 4.5;
          targetX += (dx / dist) * force;
          targetY += (dy / dist) * force;
        }

        mesh.position.x += (targetX - mesh.position.x) * 0.08;
        mesh.position.y += (targetY - mesh.position.y) * 0.08;
        mesh.position.z += (targetZ - mesh.position.z) * 0.08;

        // Build dynamic constellation lines between nearby ideation nodes
        for (let j = i + 1; j < nodeCount; j++) {
          if (lineIdx >= maxConnections * 6) break;

          const mesh2 = nodeMeshes[j];
          const distNodes = mesh.position.distanceTo(mesh2.position);

          if (distNodes < 22) {
            linePosArr[lineIdx] = mesh.position.x;
            linePosArr[lineIdx + 1] = mesh.position.y;
            linePosArr[lineIdx + 2] = mesh.position.z;

            linePosArr[lineIdx + 3] = mesh2.position.x;
            linePosArr[lineIdx + 4] = mesh2.position.y;
            linePosArr[lineIdx + 5] = mesh2.position.z;

            const alpha = 1 - distNodes / 22;
            lineColArr[lineIdx] = 0.49 * alpha;
            lineColArr[lineIdx + 1] = 0.23 * alpha;
            lineColArr[lineIdx + 2] = 0.93 * alpha;

            lineColArr[lineIdx + 3] = 0.96 * alpha;
            lineColArr[lineIdx + 4] = 0.62 * alpha;
            lineColArr[lineIdx + 5] = 0.12 * alpha;

            lineIdx += 6;
          }
        }
      }

      // Clear remaining lines if fewer connections
      for (let k = lineIdx; k < maxConnections * 6; k++) {
        linePosArr[k] = 0;
        lineColArr[k] = 0;
      }
      (lineGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      (lineGeo.attributes.color as THREE.BufferAttribute).needsUpdate = true;

      // Slow spark drift
      sparkField.rotation.y = -elapsed * 0.02;
      sparkField.rotation.x = Math.sin(elapsed * 0.03) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // 12. Cleanup on Unmount
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('click', onWindowClick);
      window.removeEventListener('resize', onResize);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      crystalGeo.dispose();
      crystalMat.dispose();
      cageGeo.dispose();
      cageMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      sparkGeo.dispose();
      sparkMat.dispose();
      rippleGeo.dispose();
      rippleMat.dispose();
      nodeGeos.forEach((g) => g.dispose());
      nodeMeshes.forEach((m) => (m.material as THREE.Material).dispose());
      renderer.dispose();
    };
  }, []);

  if (!webglSupported) {
    return (
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-[#e8ecf2]"
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    />
  );
}