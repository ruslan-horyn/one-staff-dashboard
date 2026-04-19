import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	// Enable standalone output for optimized Docker builds
	output: 'standalone',
	typedRoutes: true,
};

export default nextConfig;
