import type { NextConfig } from "next";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8090'

const nextConfig: NextConfig = {
  async rewrites() {
    // Proxy API calls in dev to avoid CORS and corporate proxy issues
    // All frontend calls to /api/* will be forwarded to the backend
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/:path*`,
      },
    ]
  },
};

export default nextConfig;
