import withPWA from 'next-pwa';
// import type { NextConfig } from 'next';

const nextConfig = {
	// async headers() {
	// 	return [
	// 		{
	// 			source: '/:path*', // Apply to all paths
	// 			headers: [
	// 				{
	// 					key: 'Content-Security-Policy',
	// 					value: `
	// 			  default-src 'self';
	// 			`
	// 						.replace(/\s{2,}/g, ' ')
	// 						.trim(), // Remove extra whitespace for cleaner header
	// 				},
	// 			],
	// 		},
	// 	];
	// },
};

export default withPWA({
	/* config options here */
	// devIndicators: false,
	dest: 'public',
	disable: process.env.NODE_ENV === 'development',
	register: true,
	skipWaiting: true,
})(nextConfig);

// nextConfig;

// export default withPWA({
// 	// dest: 'public', // destination directory for the PWA files
// 	// disable: false, // disable PWA in the development environment
// 	// register: true, // register the PWA service worker
// 	// skipWaiting: true, // skip waiting for service worker activation
// })(nextConfig);
