import idealContext from '@/controller/idealContext';
import CanvasOptions from '../../canvas/CanvasOptions';
import { TbLayoutSidebarLeftCollapse } from 'react-icons/tb';
import { useContext } from 'react';

function Header() {
	const { state, dispatch } = useContext(idealContext);

	function handleSidebarCollapse() {
		dispatch({
			type: 'sidebarAnimate',
			payload: { ...state, isSidebarAnimate: true },
		});
		setTimeout(() => {
			dispatch({
				type: 'toggleSidebar',
				payload: { ...state, isSidebarOpen: true },
			});
		}, 400);
	}

	if (state.isFocusMode) {
		return null;
	}

	return (
		<div className="flex flex-row justify-between w-11/12 md:w-9/12 mt-10">
			<div className="flex gap-2">
				{!state.isSidebarOpen ? (
					<button
						onClick={handleSidebarCollapse}
						className="p-2 cursor-pointer hover:bg-white/5 border border-white/10 rounded-sm"
					>
						<TbLayoutSidebarLeftCollapse />
					</button>
				) : null}
				<img
					src="/logo-title.png"
					alt="outlogo"
					className="w-24 h-auto"
				/>
			</div>
			<CanvasOptions />
		</div>
	);
}

export default Header;
