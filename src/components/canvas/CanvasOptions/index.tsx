import idealContext from '@/controller/idealContext';
import { useContext } from 'react';

export default function CanvasOptions() {
	const { state, dispatch } = useContext(idealContext);
	const isReaderMode = state.isReaderMode;
	const selectedFileId = state.selectedFileId;
	function handleFocusMode() {
		dispatch({
			type: 'toggleFocusMode',
			payload: { ...state, isFocusMode: true },
		});
	}

	function handleReaderMode() {
		dispatch({
			type: 'toggleReaderMode',
			payload: { ...state, isReaderMode: !state.isReaderMode },
		});
		dispatch({
			type: 'sidebarAnimate',
			payload: { ...state, isSidebarAnimate: false },
		});
		dispatch({
			type: 'toggleSidebar',
			payload: { ...state, isSidebarOpen: false },
		});
	}

	return (
		<div className="flex flex-row gap-2">
			{selectedFileId ? (
				<button
					onClick={handleReaderMode}
					style={{ width: 'fit-content' }}
					className={`border dark:invert border-black/20 text-black/80 hover:text-black cursor-pointer ${isReaderMode ? 'bg-black/30' : ''} hover:bg-black/20 rounded-md px-4 py-2 flex flex-row  items-center gap-2 justify-start text-sm w-full text-left`}
				>
					<img
						src="/icons/reader-mode.png"
						alt="reader-mode"
						className="w-4 h-4"
					/>
					{/* <MdOutlineChromeReaderMode /> */}
					Reader Mode
				</button>
			) : null}
			{selectedFileId ? (
				<button
					style={{ width: 'fit-content' }}
					onClick={handleFocusMode}
					className="border dark:invert border-black/20 text-black/80 hover:text-black cursor-pointer hover:bg-black/20 rounded-md px-4 py-2 flex flex-row  items-center gap-2 justify-start text-sm w-full text-left"
				>
					<img
						src="/icons/focus-mode.png"
						alt="reader-mode"
						className="w-4 h-4"
					/>
					Focus Mode
				</button>
			) : null}
			<a
				href="https://github.com/gokulcodes/ideal-editor-web"
				target="_blank"
				referrerPolicy="no-referrer"
				style={{ width: 'fit-content' }}
				className="border dark:invert absolute right-4 top-4 border-black/20 text-black/80 hover:text-black cursor-pointer hover:bg-black/20 rounded-md p-3 flex flex-row  items-center gap-2 justify-start text-sm w-full text-left"
			>
				<img
					src="/icons/github.png"
					alt="reader-mode"
					className="w-4 h-4"
				/>
				{/* Github */}
			</a>
			{/* <button
				style={{ width: 'fit-content' }}
				className="border border-white/5 text-white/40 hover:text-white cursor-pointer hover:bg-white/10 rounded-md px-3 py-2 flex flex-row  items-center gap-2 justify-start text-xs w-full text-left"
			>
				Ln 19 Col 20
			</button> */}
		</div>
	);
}
