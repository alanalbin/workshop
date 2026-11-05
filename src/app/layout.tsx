import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { AuthProvider } from '@/context/AuthContext';
import AuthModal from '@/components/auth/AuthModal';
import ScrollProgressBar from '@/components/ui/ScrollProgressBar';

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
};

export const viewport: Viewport = {
  themeColor: '#05030a',
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
    <html lang="en" className={`dark scroll-smooth ${spaceGrotesk.variable}`} data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </head>
      <body className={`min-h-screen flex flex-col bg-[#05030a] text-slate-100 ${spaceGrotesk.className} selection:bg-purple-600 selection:text-white antialiased relative`}>
        {/* Ambient Brand Watermark Background */}
        <div 
          className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden" 
          aria-hidden="true"
        >
          <img
            src="/logos/kmct-college.png"
            alt=""
            className="w-[850px] max-w-[90vw] h-auto object-contain opacity-[0.035] select-none filter blur-[0.4px] scale-110"
          />
        </div>
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
