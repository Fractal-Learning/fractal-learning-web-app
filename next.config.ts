import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    // Allow ngrok domains for development
    '*.ngrok-free.dev',
    '*.ngrok.io',
    '*.ngrok-app.com',
  ],
};

export default nextConfig;
