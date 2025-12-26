/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exclude saarthi-pwa from Next.js compilation (it's a separate Vite project)
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/saarthi-pwa/**'],
    };
    return config;
  },
  // Exclude from TypeScript checking
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    // Ignore saarthi-pwa during linting
    ignoreDuringBuilds: false,
    dirs: ['src', 'app'],
  },
};

export default nextConfig;
