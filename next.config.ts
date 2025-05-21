import withPWA from 'next-pwa';
// import type { NextConfig } from 'next';

const nextConfig = withPWA({
	/* config options here */
	// devIndicators: false,
	dest: 'public',
	disable: process.env.NODE_ENV === 'development',
	register: true,
	skipWaiting: true,
});

export default nextConfig;

// export default withPWA({
// 	// dest: 'public', // destination directory for the PWA files
// 	// disable: false, // disable PWA in the development environment
// 	// register: true, // register the PWA service worker
// 	// skipWaiting: true, // skip waiting for service worker activation
// })(nextConfig);
