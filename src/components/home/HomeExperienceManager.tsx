'use client';

import React, { useState } from 'react';
import BackgroundCanvas3D from '@/components/background-3d/BackgroundCanvas3D';
import BeamIntroLoading from '@/components/intro/BeamIntroLoading';

export default function HomeExperienceManager() {
  const [playIntro, setPlayIntro] = useState(false);
  const [introKey, setIntroKey] = useState(0);

  const handleReplayIntro = () => {
    setIntroKey((prev) => prev + 1);
    setPlayIntro(true);
  };

  return (
    <>
      {playIntro && (
        <BeamIntroLoading
          key={introKey}
          forcePlay={playIntro}
          onComplete={() => setPlayIntro(false)}
        />
      )}

      {/* Interactive Light 3D Canvas Background */}
      <BackgroundCanvas3D onReplayIntro={handleReplayIntro} />
    </>
  );
}
