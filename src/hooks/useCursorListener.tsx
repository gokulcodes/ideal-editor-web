import { useCallback, useEffect } from 'react';

export default function useCursorListener(
	editorRef: HTMLDivElement | null,
	cursorRef: HTMLDivElement | null,
	isReaderMode: boolean,
	isFocused: boolean = false
) {
	// const [cursorVisibility, setCursorVisibility] = useState(true);
	const handleCursorUpdate = useCallback(() => {
		if (!cursorRef || !editorRef) {
			return;
		}
		if (isReaderMode || !isFocused) {
			cursorRef.style.display = 'none';
			return;
		}
		cursorRef.style.display = 'flex';
		const activeCursor = document.getElementById('activeCursor');
		const geometry = activeCursor?.getBoundingClientRect();
		// const editorGeometry = editorRef.getBoundingClientRect();
		if (geometry) {
			// console.log(parentNode.id);

			// if (editorGeometry.right - 20 < geometry?.left) {
			// 	console.log('about to get hidden');
			// 	setCursorVisibility(false);
			// } else {
			// 	setCursorVisibility(true);
			// }

			const cursorLeftPos =
					geometry.left - editorRef.offsetLeft + geometry.width,
				cursorTopPos =
					geometry.top - editorRef.offsetTop + window.scrollY - 3,
				cursorHeight = geometry.height;

			cursorRef.style.left = `${cursorLeftPos}px`;
			cursorRef.style.height = `${cursorHeight}px`;
			cursorRef.style.top = `${cursorTopPos}px`;
		}
	}, [cursorRef, isReaderMode, editorRef, isFocused]);

	useEffect(() => {
		handleCursorUpdate();
		document.addEventListener('oncursormove', handleCursorUpdate);
		return () => {
			document.removeEventListener('oncursormove', handleCursorUpdate);
		};
	}, [handleCursorUpdate]);
}
