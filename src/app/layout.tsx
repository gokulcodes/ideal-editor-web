import type { Metadata } from 'next';
import './globals.css';
import Script from 'next/script';

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
	const jsonLd = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'WebSite',
				'@id': 'https://ideal-editor.netlify.app/#website',
				url: 'https://ideal-editor.netlify.app/',
				name: 'Ideal Editor',
				description: 'A simple online code/text editor.',
			},
			{
				'@type': 'SoftwareApplication',
				'@id': 'https://ideal-editor.netlify.app/#application',
				name: 'Ideal Editor',
				url: 'https://ideal-editor.netlify.app/',
				operatingSystem: 'Web',
				applicationCategory: 'DeveloperApplication',
				description: 'An online web-based code and text editor.',
				softwareRequirements: 'Web browser',
			},
		],
	};
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
				<link
					href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Unbounded:wght@200..900&display=swap"
					rel="stylesheet"
				/>
				<script
					async
					src="https://www.googletagmanager.com/gtag/js?id=G-94KGN306PY"
				></script>
				<script
					dangerouslySetInnerHTML={{
						__html: `window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-94KGN306PY');`,
					}}
				></script>
				<Script
					async={true}
					id="schema-json-ld"
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
					strategy="beforeInteractive" // Loads before the page becomes interactive
				/>
			</head>
			<body>{children}</body>
		</html>
	);
}
