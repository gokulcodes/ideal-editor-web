'use client';

import Sidebar from '@/components/sidebar';
import Canvas from '@/components/canvas';
import IdealContext, { initialState, reducer } from '@/controller/idealContext';
import { useReducer } from 'react';
import { isMobileDevice } from '@/structure/editorUtils';

export default function Home() {
	const [state, dispatch] = useReducer(reducer, initialState);

	if (isMobileDevice()) {
		return (
			<div className="w-full h-[100vh] flex flex-col items-center justify-center gap-5">
				<img
					src="/outline.png"
					alt="outlogo"
					className="opacity-15 transform scale-100"
				/>
				<h1 className="text-2xl font-bold">Ideal Editor</h1>
				<p className="text-lg opacity-60">
					This editor is not supported on mobile devices.
				</p>
			</div>
		);
	}

	return (
		<IdealContext.Provider value={{ state, dispatch }}>
			{/* <div
				id="wrapper"
				className="flex items-start"
			> */}
			<Sidebar />
			<Canvas />
			{/* </div> */}
		</IdealContext.Provider>
	);
}
