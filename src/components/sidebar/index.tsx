import { memo, useCallback, useContext, useEffect, useRef } from 'react';
import FileView from './FileView';
import LogoView from './LogoView';
import ProfileView from './ProfileView';
import idealContext from '@/controller/idealContext';

function Sidebar() {
	const { state, dispatch } = useContext(idealContext);
	const sideBarRef = useRef<HTMLDivElement>(null);
	const isSidebarOpen = state.isSidebarOpen;

	const handleSidebarView = useCallback(
		// on every mouse move this function will be triggered. needs optimizatino
		(event: MouseEvent) => {
			if (state.newFileCreate || state.newFolderCreate) {
				dispatch({
					type: 'toggleSidebar',
					payload: { ...state, isSidebarOpen: true },
				});
				return;
			}
			if (event.clientX < 50) {
				dispatch({
					type: 'toggleSidebar',
					payload: {
						...state,
						isSidebarOpen: true,
					},
				});
			} else if (
				sideBarRef.current &&
				event.clientX >
					sideBarRef.current?.clientWidth +
						sideBarRef.current?.offsetLeft
			) {
				dispatch({
					type: 'toggleSidebar',
					payload: { ...state, isSidebarOpen: false },
				});
			}
		},
		[dispatch, state]
	);

	useEffect(() => {
		// document.addEventListener('mousemove', handleSidebarView);
		return () => {
			// document.removeEventListener('mousemove', handleSidebarView);
		};
	}, [dispatch, handleSidebarView]);

	if (!isSidebarOpen || state.isFocusMode) {
		return null;
	}

	return (
		<div
			ref={sideBarRef}
			id="sidebar"
			className={`bg-[#141414] ${state.isSidebarAnimate ? 'animate-translate' : 'animate-translate1'} sticky left-0 top-0 bottom-0 z-50 transition-all h-[100vh] flex flex-col w-full md:w-1/3 xl:w-1/5 border-r border-white/5`}
		>
			<LogoView />
			<FileView />
			<ProfileView />
		</div>
	);
}

export default memo(Sidebar);
