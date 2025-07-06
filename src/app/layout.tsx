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
					dangerouslySetInnerHTML={{
						__html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-MQPHH2CQ');`,
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
			<body>
				{children}
				<noscript>
					<iframe
						src="https://www.googletagmanager.com/ns.html?id=GTM-MQPHH2CQ"
						height="0"
						width="0"
						style={{ display: 'none', visibility: 'hidden' }}
					></iframe>
				</noscript>
			</body>
		</html>
	);
}
