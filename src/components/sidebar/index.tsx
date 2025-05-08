import { useCallback, useContext, useEffect, useRef } from 'react';
import FileView from './FileView';
import LogoView from './LogoView';
import ProfileView from './ProfileView';
import idealContext from '@/controller/idealContext';

export default function Sidebar() {
	const { state, dispatch } = useContext(idealContext);
	const sideBarRef = useRef<HTMLDivElement>(null);
	const isSidebarOpen = state.isSidebarOpen;

	const handleSidebarView = useCallback(
		(event: MouseEvent) => {
			if (state.newFileCreate || state.newFolderCreate) {
				// dispatch({
				// 	type: 'toggleSidebar',
				// 	payload: { ...state, isSidebarOpen: true },
				// });
				return;
			}
			if (event.clientX < 50) {
				// dispatch({
				// 	type: 'toggleSidebar',
				// 	payload: { ...state, isSidebarOpen: true },
				// });
			} else if (
				sideBarRef.current &&
				event.clientX >
					sideBarRef.current?.clientWidth +
						sideBarRef.current?.offsetLeft
			) {
				// dispatch({
				// 	type: 'toggleSidebar',
				// 	payload: { ...state, isSidebarOpen: false },
				// });
			}
		},
		[dispatch, state]
	);

	useEffect(() => {
		document.addEventListener('mousemove', handleSidebarView);
		return () => {
			document.removeEventListener('mousemove', handleSidebarView);
		};
	}, [dispatch, handleSidebarView]);

	if (!isSidebarOpen) {
		return null;
	}

	return (
		<div
			ref={sideBarRef}
			id="sidebar"
			className="bg-[#202020] z-50 transition-all animate-sidebarOpen fixed left-0 flex flex-col w-full md:w-1/4 xl:w-1/6 h-full"
		>
			<LogoView />
			<FileView />
			<ProfileView />
		</div>
	);
}
