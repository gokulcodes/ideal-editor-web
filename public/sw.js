if (!self.define) {
	let e,
		s = {};
	const n = (n, a) => (
		(n = new URL(n + '.js', a).href),
		s[n] ||
			new Promise((s) => {
				if ('document' in self) {
					const e = document.createElement('script');
					(e.src = n), (e.onload = s), document.head.appendChild(e);
				} else (e = n), importScripts(n), s();
			}).then(() => {
				let e = s[n];
				if (!e)
					throw new Error(`Module ${n} didn’t register its module`);
				return e;
			})
	);
	self.define = (a, i) => {
		const c =
			e ||
			('document' in self ? document.currentScript.src : '') ||
			location.href;
		if (s[c]) return;
		let o = {};
		const t = (e) => n(e, c),
			r = { module: { uri: c }, exports: o, require: t };
		s[c] = Promise.all(a.map((e) => r[e] || t(e))).then(
			(e) => (i(...e), o)
		);
	};
}
define(['./workbox-4754cb34'], function (e) {
	'use strict';
	importScripts(),
		self.skipWaiting(),
		e.clientsClaim(),
		e.precacheAndRoute(
			[
				{
					url: '/Ideal.png',
					revision: '57ca89cb8230b5fb285dab287277194d',
				},
				{
					url: '/_next/app-build-manifest.json',
					revision: '5154b0c368b3778210ace09fca1e9bd3',
				},
				{
					url: '/_next/static/HoAUzgO4YsFj2INoTp3AC/_buildManifest.js',
					revision: '56313a2fa41efe17a9286c47ac6aacba',
				},
				{
					url: '/_next/static/HoAUzgO4YsFj2INoTp3AC/_ssgManifest.js',
					revision: 'b6652df95db52feb4daf4eca35380933',
				},
				{
					url: '/_next/static/chunks/4bd1b696-84e0f3dc3456f47f.js',
					revision: 'HoAUzgO4YsFj2INoTp3AC',
				},
				{
					url: '/_next/static/chunks/684-a441e54baa7de093.js',
					revision: 'HoAUzgO4YsFj2INoTp3AC',
				},
				{
					url: '/_next/static/chunks/app/_not-found/page-76d913d0dbd0e4fc.js',
					revision: 'HoAUzgO4YsFj2INoTp3AC',
				},
				{
					url: '/_next/static/chunks/app/layout-7c8f29bd08f87e92.js',
					revision: 'HoAUzgO4YsFj2INoTp3AC',
				},
				{
					url: '/_next/static/chunks/app/page-fa13d5e8a2193924.js',
					revision: 'HoAUzgO4YsFj2INoTp3AC',
				},
				{
					url: '/_next/static/chunks/framework-f593a28cde54158e.js',
					revision: 'HoAUzgO4YsFj2INoTp3AC',
				},
				{
					url: '/_next/static/chunks/main-1964cc3b2bd7d260.js',
					revision: 'HoAUzgO4YsFj2INoTp3AC',
				},
				{
					url: '/_next/static/chunks/main-app-6f81686056efb916.js',
					revision: 'HoAUzgO4YsFj2INoTp3AC',
				},
				{
					url: '/_next/static/chunks/pages/_app-da15c11dea942c36.js',
					revision: 'HoAUzgO4YsFj2INoTp3AC',
				},
				{
					url: '/_next/static/chunks/pages/_error-cc3f077a18ea1793.js',
					revision: 'HoAUzgO4YsFj2INoTp3AC',
				},
				{
					url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
					revision: '846118c33b2c0e922d7b3a7676f81f6f',
				},
				{
					url: '/_next/static/chunks/webpack-60d835819e29e072.js',
					revision: 'HoAUzgO4YsFj2INoTp3AC',
				},
				{
					url: '/_next/static/css/1fd314e09e666f17.css',
					revision: '1fd314e09e666f17',
				},
				{
					url: '/file.svg',
					revision: 'd09f95206c3fa0bb9bd9fefabfd0ea71',
				},
				{
					url: '/folder-closed.png',
					revision: 'd99d32408655b807e3fd32de2a19e09f',
				},
				{
					url: '/folder-open.png',
					revision: 'f3fb840e58a20d669b4dcd54d102f4b4',
				},
				{
					url: '/globe.svg',
					revision: '2aaafa6a49b6563925fe440891e32717',
				},
				{
					url: '/icon512_maskable copy.png',
					revision: 'c7d8881ac94044d50d72a766fc92e1d0',
				},
				{
					url: '/icon512_rounded.png',
					revision: 'c7d8881ac94044d50d72a766fc92e1d0',
				},
				{
					url: '/icons/add-file.png',
					revision: '71559dab7a12b28cdca71a552a3c36f9',
				},
				{
					url: '/icons/add-folder.png',
					revision: '49d68eb4c3cbc772ce2f7d26574b7867',
				},
				{
					url: '/icons/ai.png',
					revision: '9cec50076614dc9308293278dcf4a616',
				},
				{
					url: '/icons/avatar.png',
					revision: 'e459835010bf256bf5e3f7423b43bc51',
				},
				{
					url: '/icons/checked.png',
					revision: 'd9e98fad1051952695a4c3f85172b0db',
				},
				{
					url: '/icons/file.png',
					revision: 'de598710d2ebf3cdef3d7f37606ce03e',
				},
				{
					url: '/icons/focus-mode.png',
					revision: '201016d5c790440aef12d4d4bd45fe86',
				},
				{
					url: '/icons/github.png',
					revision: '1b9b9f71269e504156ce9d89a00f2551',
				},
				{
					url: '/icons/reader-mode.png',
					revision: '4f60a896df443758f4a78f8a7fa858d5',
				},
				{
					url: '/icons/sidebar.png',
					revision: 'c4262aaac1f4cde19b48629a63380055',
				},
				{
					url: '/logo-title.png',
					revision: '6b6a83e1febf5d43a319016b6287335b',
				},
				{
					url: '/logo.png',
					revision: '35267262effb0cf85c71afba559d0b21',
				},
				{
					url: '/manifest.json',
					revision: '269f8d4d3a02b941ea20962bbd8f3582',
				},
				{
					url: '/next.svg',
					revision: '8e061864f388b47f33a1c3780831193e',
				},
				{
					url: '/outline.png',
					revision: 'cab9ca4a94b89e2a73c041d69932c27c',
				},
				{
					url: '/poster.png',
					revision: '2b37fa8e0f8c0ea3934aae3a04015cf6',
				},
				{
					url: '/robot.txt',
					revision: '9bf0754534343464e8ee18255dfce5b9',
				},
				{
					url: '/sitemap.xml',
					revision: '3442dda9392d07272252147b57624164',
				},
				{
					url: '/vercel.svg',
					revision: 'c0af2f507b369b085b35ef4bbe3bcf1e',
				},
				{
					url: '/window.svg',
					revision: 'a2760511c65806022ad20adf74370ff3',
				},
			],
			{ ignoreURLParametersMatching: [] }
		),
		e.cleanupOutdatedCaches(),
		e.registerRoute(
			'/',
			new e.NetworkFirst({
				cacheName: 'start-url',
				plugins: [
					{
						cacheWillUpdate: async ({
							request: e,
							response: s,
							event: n,
							state: a,
						}) =>
							s && 'opaqueredirect' === s.type
								? new Response(s.body, {
										status: 200,
										statusText: 'OK',
										headers: s.headers,
									})
								: s,
					},
				],
			}),
			'GET'
		),
		e.registerRoute(
			/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
			new e.CacheFirst({
				cacheName: 'google-fonts-webfonts',
				plugins: [
					new e.ExpirationPlugin({
						maxEntries: 4,
						maxAgeSeconds: 31536e3,
					}),
				],
			}),
			'GET'
		),
		e.registerRoute(
			/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
			new e.StaleWhileRevalidate({
				cacheName: 'google-fonts-stylesheets',
				plugins: [
					new e.ExpirationPlugin({
						maxEntries: 4,
						maxAgeSeconds: 604800,
					}),
				],
			}),
			'GET'
		),
		e.registerRoute(
			/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
			new e.StaleWhileRevalidate({
				cacheName: 'static-font-assets',
				plugins: [
					new e.ExpirationPlugin({
						maxEntries: 4,
						maxAgeSeconds: 604800,
					}),
				],
			}),
			'GET'
		),
		e.registerRoute(
			/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
			new e.StaleWhileRevalidate({
				cacheName: 'static-image-assets',
				plugins: [
					new e.ExpirationPlugin({
						maxEntries: 64,
						maxAgeSeconds: 86400,
					}),
				],
			}),
			'GET'
		),
		e.registerRoute(
			/\/_next\/image\?url=.+$/i,
			new e.StaleWhileRevalidate({
				cacheName: 'next-image',
				plugins: [
					new e.ExpirationPlugin({
						maxEntries: 64,
						maxAgeSeconds: 86400,
					}),
				],
			}),
			'GET'
		),
		e.registerRoute(
			/\.(?:mp3|wav|ogg)$/i,
			new e.CacheFirst({
				cacheName: 'static-audio-assets',
				plugins: [
					new e.RangeRequestsPlugin(),
					new e.ExpirationPlugin({
						maxEntries: 32,
						maxAgeSeconds: 86400,
					}),
				],
			}),
			'GET'
		),
		e.registerRoute(
			/\.(?:mp4)$/i,
			new e.CacheFirst({
				cacheName: 'static-video-assets',
				plugins: [
					new e.RangeRequestsPlugin(),
					new e.ExpirationPlugin({
						maxEntries: 32,
						maxAgeSeconds: 86400,
					}),
				],
			}),
			'GET'
		),
		e.registerRoute(
			/\.(?:js)$/i,
			new e.StaleWhileRevalidate({
				cacheName: 'static-js-assets',
				plugins: [
					new e.ExpirationPlugin({
						maxEntries: 32,
						maxAgeSeconds: 86400,
					}),
				],
			}),
			'GET'
		),
		e.registerRoute(
			/\.(?:css|less)$/i,
			new e.StaleWhileRevalidate({
				cacheName: 'static-style-assets',
				plugins: [
					new e.ExpirationPlugin({
						maxEntries: 32,
						maxAgeSeconds: 86400,
					}),
				],
			}),
			'GET'
		),
		e.registerRoute(
			/\/_next\/data\/.+\/.+\.json$/i,
			new e.StaleWhileRevalidate({
				cacheName: 'next-data',
				plugins: [
					new e.ExpirationPlugin({
						maxEntries: 32,
						maxAgeSeconds: 86400,
					}),
				],
			}),
			'GET'
		),
		e.registerRoute(
			/\.(?:json|xml|csv)$/i,
			new e.NetworkFirst({
				cacheName: 'static-data-assets',
				plugins: [
					new e.ExpirationPlugin({
						maxEntries: 32,
						maxAgeSeconds: 86400,
					}),
				],
			}),
			'GET'
		),
		e.registerRoute(
			({ url: e }) => {
				if (!(self.origin === e.origin)) return !1;
				const s = e.pathname;
				return !s.startsWith('/api/auth/') && !!s.startsWith('/api/');
			},
			new e.NetworkFirst({
				cacheName: 'apis',
				networkTimeoutSeconds: 10,
				plugins: [
					new e.ExpirationPlugin({
						maxEntries: 16,
						maxAgeSeconds: 86400,
					}),
				],
			}),
			'GET'
		),
		e.registerRoute(
			({ url: e }) => {
				if (!(self.origin === e.origin)) return !1;
				return !e.pathname.startsWith('/api/');
			},
			new e.NetworkFirst({
				cacheName: 'others',
				networkTimeoutSeconds: 10,
				plugins: [
					new e.ExpirationPlugin({
						maxEntries: 32,
						maxAgeSeconds: 86400,
					}),
				],
			}),
			'GET'
		),
		e.registerRoute(
			({ url: e }) => !(self.origin === e.origin),
			new e.NetworkFirst({
				cacheName: 'cross-origin',
				networkTimeoutSeconds: 10,
				plugins: [
					new e.ExpirationPlugin({
						maxEntries: 32,
						maxAgeSeconds: 3600,
					}),
				],
			}),
			'GET'
		);
});
