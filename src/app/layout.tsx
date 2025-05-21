import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
	title: 'Ideal | Infinite writing experience',
	description:
		'A minimal, fast, and distraction-free text editor built for the web. Perfect for taking quick notes, writing drafts, or capturing ideas on the go — all with seamless cloud storage.',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<link
					rel="manifest"
					href="/manifest.json"
				/>
				<link
					rel="preconnect"
					href="https://fonts.googleapis.com"
				/>
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Host+Grotesk:ital,wght@0,300..800;1,300..800&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap"
					rel="stylesheet"
				/>
			</head>
			<body>{children}</body>
		</html>
	);
}
