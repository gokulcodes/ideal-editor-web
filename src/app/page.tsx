'use client';

import Sidebar from '@/components/sidebar';
import Canvas from '@/components/canvas';
import IdealContext, { initialState, reducer } from '@/controller/idealContext';
import { useReducer } from 'react';

export default function Home() {
	const [state, dispatch] = useReducer(reducer, initialState);

	return (
		<IdealContext.Provider value={{ state, dispatch }}>
			{/* <div className='flex items-center justify-center'> */}
			<Sidebar />
			<Canvas />
			{/* </div> */}
		</IdealContext.Provider>
	);
}
