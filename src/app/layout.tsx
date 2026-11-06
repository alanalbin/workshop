import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { AuthProvider } from '@/context/AuthContext';
import AuthModal from '@/components/auth/AuthModal';
import ScrollProgressBar from '@/components/ui/ScrollProgressBar';
import BackgroundCanvas3D from '@/components/background-3d/BackgroundCanvas3D';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'FROM PROBLEM TO POSSIBILITY | Workshop on Problem Solving & Ideation | KMCT Kasaragod',
  description:
    'A hands-on, activity-driven workshop on Problem Solving, Ideation & Pitching at KMCT College of Engineering for Emerging Technologies and Management, Kasaragod under Institution’s Innovation Council (IIC). Resource Person: Mr. Muhammed Shayiz K P. Fee: ₹100 | 70 Seats.',
  keywords: [
    'From Problem to Possibility',
    'Workshop on Problem Solving and Ideation',
    'KMCT College of Engineering Kasaragod',
    'Institution Innovation Council IIC',
    'Muhammed Shayiz K P',
    'KSUM',
    'IEDC',
    'AICTE',
    'Kerala Engineering Students',
    'Ideation Workshop',
  ],
  authors: [{ name: 'Institution’s Innovation Council (IIC) KMCTCEEM' }],
  metadataBase: new URL('https://kmct.org'),
  openGraph: {
    title: 'FROM PROBLEM TO POSSIBILITY | Workshop on Problem Solving & Ideation',
    description:
      'Turn Real-World Challenges into Pitch-Ready Innovations! 1-day hands-on workshop at KMCT College Seminar Hall on 11th November 2026.',
    url: 'https://kmct.org',
    siteName: 'KMCT IIC Workshop',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FROM PROBLEM TO POSSIBILITY | KMCT Kasaragod',
    description: 'Hands-on Workshop on Problem Solving, Ideation & Pitching with Mr. Muhammed Shayiz K P.',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/icon-192.png',
    shortcut: '/icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#68b8d7',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Vanta Clouds & Three.js r134 Runtime Scripts */}
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.clouds.min.js"
          strategy="afterInteractive"
        />
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />
      </head>
      <body className={`min-h-screen flex flex-col bg-transparent text-slate-900 ${spaceGrotesk.className} selection:bg-sky-600 selection:text-white antialiased relative`}>
        {/* Full-Page Interactive 3D Vanta Clouds Background */}
        <BackgroundCanvas3D />
        <ScrollProgressBar />
        <AuthProvider>
          <Navbar />
          <main className="flex-1 relative z-10">{children}</main>
          <Footer />
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}
