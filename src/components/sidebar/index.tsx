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
			className={`${state.isSidebarAnimate ? 'animate-sidebarOpen' : 'animate-sidebarClose'} h-[100vh] overflow-hidden absolute right-0 bottom-0 w-10/12 md:w-1/6 shadow-2xl`}
		>
			<div
				ref={sideBarRef}
				id="sidebar"
				className={`dark:bg-[#101010]/10 backdrop-blur-3xl w-full absolute z-50 h-[100vh] flex flex-col border-l border-black/20 dark:border-white/20`}
			>
				<LogoView />
				<FileView />
				<ProfileView />
			</div>
		</aside>
	);
}

export default memo(Sidebar);
