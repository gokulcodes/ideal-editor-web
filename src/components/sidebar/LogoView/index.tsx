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
		<div className="flex flex-row items-center justify-between p-4 border-b border-white/10">
			<img
				className="w-24 h-auto"
				src="/logo-title.png"
				alt="ideal-logo"
			/>
			<button
				onClick={handleSidebarCollapse}
				className="p-2 cursor-pointer hover:bg-white/5 border border-white/10 rounded-sm"
			>
				<TbLayoutSidebarLeftCollapse />
			</button>
		</div>
	);
}
