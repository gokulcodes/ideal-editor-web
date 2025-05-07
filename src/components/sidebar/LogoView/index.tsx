import idealContext from '@/controller/idealContext';
import { useContext } from 'react';
import { VscNewFile, VscNewFolder } from 'react-icons/vsc';

export default function LogoView() {
	const { state, dispatch } = useContext(idealContext);

	function openFileCreate() {
		dispatch({
			type: 'newFileCreate',
			payload: { ...state, newFileCreate: true },
		});
	}

	function openFolderCreate() {
		dispatch({
			type: 'newFolderCreate',
			payload: { ...state, newFolderCreate: true },
		});
	}

	return (
		<div className="flex flex-row items-center justify-between p-4 border-b border-white/10">
			<img
				className="w-24 h-auto"
				src="/logo-title.png"
				alt="ideal-logo"
			/>
			<div className="flex gap-2">
				<button
					onClick={openFileCreate}
					className="p-2 cursor-pointer hover:bg-white/5 border border-white/10 rounded-sm"
				>
					<VscNewFile />
				</button>
				<button
					onClick={openFolderCreate}
					className="p-2 cursor-pointer hover:bg-white/5 border border-white/10 rounded-sm"
				>
					<VscNewFolder />
				</button>
			</div>
		</div>
	);
}
