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
	const prevDown = useRef<MouseEvent | null>(null);

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

			let lineNo = -1;
			if (!parentNode.id && targetNode.id.split('_')[0] === 'line') {
				lineNo = parseInt(targetNode.id.split('_')[1]);
			} else if (parentNode.id.split('_')[0] === 'line') {
				lineNo = parseInt(parentNode.id.split('_')[1]);
			}
			if (lineNo === -1) return;
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
			prevDown.current = event;
			mouseMoveInfo.current.offsetX =
				event.clientX - editorRef.offsetLeft;
			mouseMoveInfo.current.offsetY = event.clientY - editorRef.offsetTop;
		},
		[editorRef]
	);

	const handleMouseMove = useCallback(
		(event: MouseEvent) => {
			if (!mouseDown.current || !editorRef) {
				return;
			}

			// handles hasMoved
			const x = event.clientX - mouseMoveInfo.current.offsetX;
			const y = event.clientY - mouseMoveInfo.current.offsetY;
			if (
				editorRef &&
				(Math.abs(x - editorRef.offsetLeft) > 1 ||
					Math.abs(y - editorRef.offsetTop))
			) {
				mouseMoveInfo.current.hasMoved = true;
			}

			let textStart = Math.round(
					(mouseDown.current.clientX - editorRef.offsetLeft) / 12
				),
				textEnd = Math.floor(
					(event.clientX - editorRef.offsetLeft) / 12
				);
			let lineStart = Math.round(
					(mouseDown.current.clientY - editorRef?.offsetTop) / 32
				),
				lineEnd = Math.floor(
					(event.clientY - editorRef.offsetTop) / 32
				);
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

			if (!prevDown.current) {
				prevDown.current = event;
			}

			editor.moveCursorToNthLine(lineEnd, textEnd);

			// let dir = 'LINEAR';
			// // console.log(prevDown.current.clientY - event.clientY);
			// if (Math.abs(prevDown.current.clientY - event.clientY) >= 4) {
			// 	dir =
			// 		prevDown.current.clientY - event.clientY < 0
			// 			? 'DOWN'
			// 			: 'UP';
			// prevDown.current = event;
			// }
			// console.log(event.clientY - editorRef.offsetTop);
			const dirVertical = event.movementY < 0 ? 'UP' : 'DOWN'; // if negative down, positive up
			const dirHorizontal = event.movementX <= 0 ? 'LEFT' : 'RIGHT'; // if negative down, positive up
			if (dirVertical == 'UP') {
				[lineStart, lineEnd] = [lineEnd, lineStart];
			}
			if (dirHorizontal == 'LEFT') {
				const temp = textStart;
				textStart = Math.min(temp, textEnd);
				textEnd = Math.max(temp, textEnd);
			}
			// console.log(lineStart, lineEnd, dirHorizontal);
			editor.updateLetterSelectionOnMouseMove(
				lineStart,
				lineEnd,
				textStart,
				textEnd,
				dirVertical
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
