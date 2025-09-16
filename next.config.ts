import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['res.cloudinary.com', 'wallpaperaccess.com'],
  },
  // Allow cross-origin requests in development and production
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
  // Development: Allow cross-origin requests from Replit preview
  ...(process.env.NODE_ENV === 'development' && {
    allowedDevOrigins: [
      'http://localhost:5000',
      'https://localhost:5000',
      // Auto-allow Replit preview domains (correct format)
      ...(process.env.REPLIT_DOMAINS 
        ? [`https://${process.env.REPLIT_DOMAINS}`]
        : []
      )
    ],
  }),
};

export default nextConfig;
