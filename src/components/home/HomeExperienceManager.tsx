'use client';

import React, { useState } from 'react';
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
    </>
  );
}
