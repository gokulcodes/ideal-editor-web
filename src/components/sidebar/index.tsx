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
		<aside
			className={`${state.isSidebarAnimate ? 'animate-sidebarOpen' : 'animate-sidebarClose'} h-[100vh] overflow-hidden sticky left-0 top-0 bottom-0 md:w-1/4`}
		>
			<div
				ref={sideBarRef}
				id="sidebar"
				className={`bg-[#f0f0f0] dark:bg-[#101010] w-72 absolute z-50 h-[100vh] flex flex-col border-r border-black/20 dark:border-white/20`}
			>
				<LogoView />
				<FileView />
				<ProfileView />
			</div>
		</aside>
	);
}

export default memo(Sidebar);
