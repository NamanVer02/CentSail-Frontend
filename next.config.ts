import type { NextConfig } from "next";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8090'

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    // Proxy API calls to avoid CORS issues
    // All frontend calls to /api/* will be forwarded to the backend
    // In production, NEXT_PUBLIC_API_URL must be set to your backend URL
    if (!process.env.NEXT_PUBLIC_API_URL && process.env.NODE_ENV === 'production') {
      console.warn('WARNING: NEXT_PUBLIC_API_URL is not set in production!')
    }
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/:path*`,
      },
    ]
  },
};

export default nextConfig;
