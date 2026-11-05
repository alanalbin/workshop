import React from 'react';
import type { Metadata } from 'next';
import GallerySection from '@/components/gallery/GallerySection';

export const metadata: Metadata = {
  title: 'Gallery — Workshop Memories | KMCT Kasaragod',
  description:
    'Browse high-resolution event photographs from KMCT Kasaragod. Use our AI Biometric Face Scanner and OCR to find your moments instantly.',
};

export const dynamic = 'force-dynamic';

export default function GalleryPage() {
  return (
    <div className="min-h-screen pt-16 flex flex-col relative bg-transparent overflow-x-hidden">
      <GallerySection id="gallery-page" />
    </div>
  );
}
