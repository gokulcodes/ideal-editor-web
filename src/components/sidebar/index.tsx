'use client';
import { memo, useContext, useRef } from 'react';
import FileView from './FileView';
import LogoView from './LogoView';
import ProfileView from './ProfileView';
import idealContext from '@/controller/idealContext';

function Sidebar() {
	const { state } = useContext(idealContext);
	const sideBarRef = useRef<HTMLDivElement>(null);
	const isSidebarOpen = state.isSidebarOpen;

	if (!isSidebarOpen || state.isFocusMode) {
		return null;
	}

	return (
		<aside className="h-[100vh] overflow-hidden  absolute right-0 bottom-0 w-full shadow-2xl">
			<div
				ref={sideBarRef}
				id="sidebar"
				className={`bg-background/40 ${state.isSidebarAnimate ? 'animate-sidebarOpen' : 'animate-sidebarClose'} backdrop-blur-3xl w-10/12 md:w-1/5 absolute right-0 z-50 h-[100vh] flex flex-col border-l border-black/20 dark:border-white/20`}
			>
				<LogoView />
				<FileView />
				<ProfileView />
			</div>
		</aside>
	);
}

export default memo(Sidebar);
