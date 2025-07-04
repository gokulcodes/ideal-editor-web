/* eslint-disable @next/next/no-img-element */
import idealContext from '@/controller/idealContext';
import { useCallback, useContext } from 'react';

export default function CanvasOptions() {
	const { state, dispatch } = useContext(idealContext);
	// const isReaderMode = state.isReaderMode;
	// const selectedFileId = state.selectedFileId;
	// function handleFocusMode() {
	// 	dispatch({
	// 		type: 'toggleFocusMode',
	// 		payload: { ...state, isFocusMode: true },
	// 	});
	// }

	// function handleReaderMode() {
	// 	dispatch({
	// 		type: 'toggleReaderMode',
	// 		payload: { ...state, isReaderMode: !state.isReaderMode },
	// 	});
	// 	dispatch({
	// 		type: 'sidebarAnimate',
	// 		payload: { ...state, isSidebarAnimate: false },
	// 	});
	// 	dispatch({
	// 		type: 'toggleSidebar',
	// 		payload: { ...state, isSidebarOpen: false },
	// 	});
	// }

	const handleSidebarCollapse = useCallback(() => {
		dispatch({
			type: 'sidebarAnimate',
			payload: { ...state, isSidebarAnimate: true },
		});
		dispatch({
			type: 'toggleSidebar',
			payload: { ...state, isSidebarOpen: true },
		});
	}, [dispatch]);

	return (
		<div className="flex flex-row gap-2">
			{/* {selectedFileId ? (
				<button
					onClick={handleReaderMode}
					style={{ width: 'fit-content' }}
					title="Reader Mode"
					className={`border dark:invert border-black/20 text-black/80 hover:text-black cursor-pointer ${isReaderMode ? 'bg-black/30' : ''} hover:bg-black/20 rounded-md px-4 py-2 flex flex-row  items-center gap-2 justify-start text-sm w-full text-left`}
				>
					<img
						src="/icons/reader-mode.png"
						alt="reader-mode"
						className="w-4 h-4"
					/>
				</button>
			) : null}
			{selectedFileId ? (
				<button
					style={{ width: 'fit-content' }}
					onClick={handleFocusMode}
					title="Focus Mode"
					className="border dark:invert border-black/20 text-black/80 hover:text-black cursor-pointer hover:bg-black/20 rounded-md px-4 py-2 flex flex-row  items-center gap-2 justify-start text-sm w-full text-left"
				>
					<img
						src="/icons/focus-mode.png"
						alt="focus-mode"
						className="w-4 h-4"
					/>
				</button>
			) : null} */}
			{/* {selectedFileId ? (
				<button
					style={{ width: 'fit-content' }}
					// onClick={handleFocusMode}
					title="AI Mode"
					className="border dark:invert border-black/20 text-black/80 hover:text-black cursor-pointer hover:bg-black/20 rounded-md px-4 py-2 flex flex-row  items-center gap-2 justify-start text-sm w-full text-left"
				>
					<img
						src="/icons/ai.png"
						alt="ai-mode"
						className="w-4 h-4"
					/>
				</button>
			) : null} */}
			<a
				href="https://github.com/gokulcodes/ideal-editor-web"
				target="_blank"
				referrerPolicy="no-referrer"
				style={{ width: 'fit-content' }}
				title="Github"
				className="border dark:invert border-black/20 text-black/80 hover:text-black cursor-pointer hover:bg-black/20 rounded-md p-3 flex flex-row  items-center gap-2 justify-start text-sm w-full text-left"
			>
				<img
					src="/icons/github.png"
					alt="reader-mode"
					className="w-4 h-4"
				/>
				{/* Github */}
			</a>
			{!state.isSidebarOpen ? (
				<button
					title="Open Sidebar"
					onClick={handleSidebarCollapse}
					className="px-3 py-2 dark:invert text-black cursor-pointer hover:bg-black/5 border border-black/20 rounded-sm"
				>
					<img
						src="/icons/sidebar.png"
						alt="file-mode"
						className="w-5 h-5"
					/>
				</button>
			) : null}
		</div>
	);
}
