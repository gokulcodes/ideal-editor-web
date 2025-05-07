import { MdOutlineChromeReaderMode } from 'react-icons/md';
import { RiFocusLine } from 'react-icons/ri';

export default function CanvasOptions() {
	return (
		<div className="flex flex-row gap-2  fixed bottom-2 right-2">
			<button
				style={{ width: 'fit-content' }}
				className="border border-white/5 text-white/40 hover:text-white cursor-pointer hover:bg-white/10 rounded-md px-3 py-2 flex flex-row  items-center gap-2 justify-start text-xs w-full text-left"
			>
				<MdOutlineChromeReaderMode />
				Reader Mode
			</button>
			<button
				style={{ width: 'fit-content' }}
				className="border border-white/5 text-white/40 hover:text-white cursor-pointer hover:bg-white/10 rounded-md px-3 py-2 flex flex-row  items-center gap-2 justify-start text-xs w-full text-left"
			>
				<RiFocusLine />
				Focus Mode
			</button>
			<button
				style={{ width: 'fit-content' }}
				className="border border-white/5 text-white/40 hover:text-white cursor-pointer hover:bg-white/10 rounded-md px-3 py-2 flex flex-row  items-center gap-2 justify-start text-xs w-full text-left"
			>
				Ln 19 Col 20
			</button>
		</div>
	);
}
