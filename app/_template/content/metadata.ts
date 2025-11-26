import { Metadata } from 'next';

export const templateMetadata: Metadata = {
  metadataBase: new URL('https://clerk-nextjs-app-router.vercel.app/'),
  title: 'Fractal Learning',
  description:
    'A simple and powerful Next.js template featuring authentication and user management powered by Clerk.',
  openGraph: { images: ['/og.png'] },
};

// Default metadata for when template is removed
export const defaultMetadata: Metadata = {
  title: 'Fractal Learning',
  description: 'Fractal Learning Platform',
};
