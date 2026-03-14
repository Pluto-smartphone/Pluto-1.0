import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    remotePatterns: [
      // Supabase public bucket URLs (set your project ref at runtime)
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
};

export default nextConfig;

