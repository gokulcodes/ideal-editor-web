import idealContext from '@/controller/idealContext';
import CanvasOptions from '../../canvas/CanvasOptions';
import { useContext } from 'react';

function Header() {
	const { state } = useContext(idealContext);

	if (state.isFocusMode) {
		return null;
	}

	return (
		<header className="flex flex-row justify-between w-11/12 md:w-6/12 xl:w-8/12 mt-4">
			<div className="flex justify-between w-full gap-2">
				<div className="flex items-center gap-2">
					<img
						src="/outline.png"
						alt="file-mode"
						className="dark:invert-0 invert w-8 h-8"
					/>
					{state.currentContent && (
						<p className="text-2xl font-title capitalize">
							{state.currentContent?.name}
						</p>
					)}
				</div>
				<CanvasOptions />
			</div>
		</header>
	);
}

export default Header;
