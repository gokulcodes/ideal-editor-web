import { ActionType, EditorStateType } from '@/controller/editorContext';
import { useCallback, useEffect, useRef } from 'react';

const moveInitState = {
	hasMoved: false,
	offsetX: 0,
	offsetY: 0,
};

export default function useMouseControls(
	state: EditorStateType,
	dispatch: React.Dispatch<ActionType>,
	editorRef: HTMLDivElement | null
) {
	const editor = state.editor;
	const mouseMoveInfo = useRef(moveInitState);
	const mouseDown = useRef<MouseEvent | null>(null);

	const handleClick = useCallback(
		(event: MouseEvent) => {
			if (mouseMoveInfo.current.hasMoved) {
				mouseMoveInfo.current.hasMoved = false; // reset mouse movement after click
				mouseMoveInfo.current.offsetX = 0; // reset mouse movement after click
				mouseMoveInfo.current.offsetY = 0; // reset mouse movement after click
				return;
			}

			editor.resetSelection();
			if (!event || !event.target || !editorRef) {
				return;
			}
			const targetNode = event.target as HTMLElement;
			const parentNode = targetNode.parentNode as HTMLElement;

			// curser letter position calculation. This improved the overall editor performance by 20x
			const clientX = event.clientX - editorRef.offsetLeft;
			let charWidth = clientX / 12;
			charWidth = parseInt(charWidth.toString());
			const textNo = charWidth;

			let lineNo = 0;
			if (!parentNode.id || parentNode.id === 'editor') {
				lineNo = parseInt(targetNode.id.split('_')[1]);
			} else {
				lineNo = parseInt(parentNode.id.split('_')[1]);
			}
			editor.moveCursorToNthLine(lineNo, textNo);
			dispatch({ type: 'type', payload: editor });
		},
		[dispatch, editorRef, editor]
	);

	const handleMouseDown = useCallback(
		(event: MouseEvent) => {
			if (!editorRef) {
				return;
			}
			mouseDown.current = event;
			mouseMoveInfo.current.offsetX =
				event.clientX - editorRef.offsetLeft;
			mouseMoveInfo.current.offsetY = event.clientY - editorRef.offsetTop;
		},
		[editorRef]
	);

	const handleMouseMove = useCallback(
		(event: MouseEvent) => {
			if (!mouseDown.current) {
				return;
			}

			let textStart = Math.floor(mouseDown.current.clientX / 12),
				textEnd = Math.floor(event.clientX / 12);
			let lineStart = Math.floor(mouseDown.current.clientY / 32),
				lineEnd = Math.floor(event.clientY / 32);
			const x = event.clientX - mouseMoveInfo.current.offsetX;
			const y = event.clientY - mouseMoveInfo.current.offsetY;
			if (
				editorRef &&
				(Math.abs(x - editorRef.offsetLeft) > 1 ||
					Math.abs(y - editorRef.offsetTop))
			) {
				mouseMoveInfo.current.hasMoved = true;
			}
			let mouseDownTarget: HTMLElement | null = mouseDown.current
				.target as HTMLElement;
			let mouseUpTarget: HTMLElement | null =
				event.target as HTMLDivElement;
			while (mouseDownTarget && !mouseDownTarget.id.includes('line')) {
				mouseDownTarget = mouseDownTarget.parentElement;
			}
			while (mouseUpTarget && !mouseUpTarget.id.includes('line')) {
				mouseUpTarget = mouseUpTarget.parentElement;
			}
			editor.moveCursorToNthLine(lineEnd, textEnd);

			const dir =
				mouseDown.current.clientY >= event.clientY ? 'UP' : 'DOWN';
			if (dir == 'UP') {
				[lineStart, lineEnd] = [lineEnd, lineStart];
				[textStart, textEnd] = [textEnd, textStart];
			}
			editor.updateLetterSelectionOnMouseMove(
				lineStart,
				lineEnd,
				textStart,
				textEnd,
				dir
			);
			dispatch({ type: 'type', payload: editor });
		},
		[dispatch, editor, editorRef]
	);

	const handleMouseUp = useCallback(() => {
		mouseDown.current = null;
	}, []);

	useEffect(() => {
		if (!editorRef) {
			return;
		}
		editorRef.addEventListener('mousedown', handleMouseDown);
		editorRef.addEventListener('mousemove', handleMouseMove);
		editorRef.addEventListener('mouseup', handleMouseUp);
		editorRef.addEventListener('click', handleClick);
		return () => {
			editorRef.removeEventListener('mousedown', handleMouseDown);
			editorRef.removeEventListener('mousemove', handleMouseMove);
			editorRef.removeEventListener('mouseup', handleMouseUp);
			editorRef.removeEventListener('click', handleClick);
		};
	}, [
		editorRef,
		handleMouseDown,
		handleMouseMove,
		handleMouseUp,
		handleClick,
	]);
}
