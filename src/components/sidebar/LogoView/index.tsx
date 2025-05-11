import idealContext from '@/controller/idealContext';
import { useContext } from 'react';
import { TbLayoutSidebarLeftCollapse } from 'react-icons/tb';

export default function LogoView() {
	const { state, dispatch } = useContext(idealContext);
	function handleSidebarCollapse() {
		dispatch({
			type: 'sidebarAnimate',
			payload: { ...state, isSidebarAnimate: false },
		});
		setTimeout(() => {
			dispatch({
				type: 'toggleSidebar',
				payload: { ...state, isSidebarOpen: false },
			});
		}, 400);
	}
	return (
		<div className="flex flex-row items-center gap-4 p-4 border-b border-white/20">
			<button
				onClick={handleSidebarCollapse}
				className="p-2 cursor-pointer hover:bg-white/10 border border-white/20 rounded-sm"
			>
				<TbLayoutSidebarLeftCollapse size={24} />
			</button>
			<img
				className="w-20 h-auto"
				src="/ideal.png"
				alt="ideal-logo"
			/>
		</div>
	);
}
