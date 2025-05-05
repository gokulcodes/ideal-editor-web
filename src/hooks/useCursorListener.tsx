import { useCallback, useEffect } from 'react';

export default function useCursorListener(
	editorRef: HTMLDivElement | null,
	cursorRef: HTMLDivElement | null
) {
    const handleCursorUpdate = useCallback(() => {
        if (!cursorRef || !editorRef) {
            return;
        }
        const activeCursor = document.getElementById('activeCursor');
        const geometry = activeCursor?.getBoundingClientRect();
        if (geometry) {
            const cursorLeftPos = geometry.left + geometry.width,
                cursorTopPos = geometry.top + editorRef.scrollTop,
                cursorHeight = geometry.height;

            cursorRef.style.left = `${cursorLeftPos}px`;
            cursorRef.style.height = `${cursorHeight}px`;
            cursorRef.style.top = `${cursorTopPos}px`;
        }
    }, [cursorRef, editorRef]);

    useEffect(() => {
        handleCursorUpdate();
        document.addEventListener('oncursormove', handleCursorUpdate);
		return () => {
			document.removeEventListener('oncursormove', handleCursorUpdate);
		};
	}, [handleCursorUpdate]);
}
