import idealContext from '@/controller/idealContext';
import CanvasOptions from '../../canvas/CanvasOptions';
import { useCallback, useContext } from 'react';

function Header() {
	const { state, dispatch } = useContext(idealContext);

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

	if (state.isFocusMode) {
		return null;
	}

	return (
		<header className="flex flex-row justify-between w-11/12 md:w-6/12 xl:w-9/12 mt-4">
			<div className="flex gap-2">
				{!state.isSidebarOpen ? (
					<button
						onClick={handleSidebarCollapse}
						className="p-2 absolute dark:invert text-black left-4 top-4 cursor-pointer hover:bg-black/5 border border-black/20 rounded-sm"
					>
						<img
							src="/icons/sidebar.png"
							alt="file-mode"
							className="w-5 h-5"
						/>
					</button>
				) : null}
				<img
					src="/logo.png"
					alt="outlogo"
					className="w-10 h-10"
				/>
			</div>
			<CanvasOptions />
		</header>
	);
}

export default Header;
