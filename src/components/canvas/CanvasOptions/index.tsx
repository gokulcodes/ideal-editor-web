import idealContext from '@/controller/idealContext';
import { useContext } from 'react';
import { MdOutlineChromeReaderMode } from 'react-icons/md';
import { RiFocusLine, RiGithubLine } from 'react-icons/ri';

export default function CanvasOptions() {
	const { state, dispatch } = useContext(idealContext);
	const isReaderMode = state.isReaderMode;
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
	}

	return (
		<div className="flex flex-row gap-2">
			<button
				onClick={handleReaderMode}
				style={{ width: 'fit-content' }}
				className={`border border-white/20 text-white/80 hover:text-white cursor-pointer ${isReaderMode ? 'bg-white/30' : ''} hover:bg-white/20 rounded-md px-4 py-2 flex flex-row  items-center gap-2 justify-start text-sm w-full text-left`}
			>
				<MdOutlineChromeReaderMode />
				Reader Mode
			</button>
			<button
				style={{ width: 'fit-content' }}
				onClick={handleFocusMode}
				className="border border-white/20 text-white/80 hover:text-white cursor-pointer hover:bg-white/20 rounded-md px-4 py-2 flex flex-row  items-center gap-2 justify-start text-sm w-full text-left"
			>
				<RiFocusLine />
				Focus Mode
			</button>
			<a
				href="https://github.com/gokulcodes/ideal-editor-web"
				target="_blank"
				referrerPolicy="no-referrer"
				style={{ width: 'fit-content' }}
				className="border absolute right-4 top-4 border-white/20 text-white/80 hover:text-white cursor-pointer hover:bg-white/20 rounded-md p-3 flex flex-row  items-center gap-2 justify-start text-sm w-full text-left"
			>
				<RiGithubLine size={20} />
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
