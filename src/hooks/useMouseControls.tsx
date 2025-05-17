import { ActionType, EditorStateType } from '@/controller/editorContext';
import idealContext from '@/controller/idealContext';
import { useCallback, useContext, useEffect, useRef } from 'react';

const moveInitState = {
	hasMoved: false,
	offsetX: 0,
	offsetY: 0,
};

// const debounce = (func: Function) => {
// 	const timeoutId = null;
// 	return (args: MouseEvent) => {
// 		if (timeoutId) {
// 			clearTimeout(timeoutId);
// 		}
// 		setTimeout(() => {
// 			func(args);
// 		}, 500);
// 	};
// };

export default function useMouseControls(
	state: EditorStateType,
	dispatch: React.Dispatch<ActionType>,
	editorRef: HTMLDivElement | null
) {
	const editor = state.editor;
	const {
		state: { isReaderMode },
	} = useContext(idealContext);
	const mouseMoveInfo = useRef(moveInitState);
	const mouseDown = useRef<MouseEvent | null>(null);

	const handleClick = useCallback(
		(event: MouseEvent) => {
			if (mouseMoveInfo.current.hasMoved) {
				mouseMoveInfo.current.hasMoved = false; // reset mouse movement after click
				mouseMoveInfo.current.offsetX = 0; // reset mouse movement after click
				mouseMoveInfo.current.offsetY = 0; // reset mouse movement after click
				mouseDown.current = null;
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

	const handleDoubleClick = useCallback(
		(event: MouseEvent) => {
			handleClick(event);
			editor.updateLetterSelectionOnDoubleClick();
			dispatch({ type: 'type', payload: editor });
		},
		[dispatch, editor, handleClick]
	);

	const handleMouseDown = useCallback(
		(event: MouseEvent) => {
			if (!editorRef || isReaderMode) {
				return;
			}
			mouseDown.current = event;
			mouseMoveInfo.current.offsetX =
				event.clientX - editorRef.offsetLeft;
			mouseMoveInfo.current.offsetY = event.clientY - editorRef.offsetTop;
		},
		[editorRef, isReaderMode]
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

			/**
			 *
			 * Mouse DIRECTION LOGIC
			 *
			 * if mousemovement difference between mousedown and current has to be greater than 20px
			 *
			 * DOWN
			 * if(LEFT)
			 * 	moveCursor -> textStart
			 * 	textStart = max
			 * 	textEnd = min
			 * if(RIGHT)
			 * 	moveCursor -> textEnd
			 *	textStart = min
			 * 	textEnd = max
			 * UP
			 *
			 *
			 */

			let dirVertical = 'LINEAR';
			if (event.clientY - mouseDown.current.clientY > 20) {
				dirVertical = 'DOWN';
			} else if (event.clientY - mouseDown.current.clientY < -20) {
				dirVertical = 'UP';
			}

			let dirHorizontal = 'LINEAR';
			if (event.clientX - mouseDown.current.clientX > 6) {
				dirHorizontal = 'RIGHT';
			} else if (event.clientX - mouseDown.current.clientX < -6) {
				dirHorizontal = 'LEFT';
			}

			const temp1 = lineStart;
			lineStart = Math.min(temp1, lineEnd);
			lineEnd = Math.max(temp1, lineEnd);
			let cursorPosition = textEnd,
				linePosition = lineEnd;
			const temp = textStart;
			if (dirVertical == 'DOWN') {
				if (dirHorizontal == 'RIGHT') {
					textStart = Math.min(temp, textEnd);
					textEnd = Math.max(temp, textEnd);
				} else {
					textStart = Math.max(temp, textEnd);
					textEnd = Math.min(temp, textEnd);
				}
			} else if (dirVertical == 'UP') {
				if (dirHorizontal == 'RIGHT') {
					textStart = Math.max(temp, textEnd);
					textEnd = Math.min(temp, textEnd);
				} else {
					textStart = Math.min(temp, textEnd);
					textEnd = Math.max(temp, textEnd);
					cursorPosition = textStart;
				}
				linePosition = lineStart;
			} else if (dirVertical == 'LINEAR') {
				textStart = Math.min(temp, textEnd);
				textEnd = Math.max(temp, textEnd);
			}

			// console.log(dirHorizontal, dirVertical);
			editor.moveCursorToNthLine(linePosition, cursorPosition);
			editor.updateLetterSelectionOnMouseMove(
				lineStart,
				lineEnd,
				textStart,
				textEnd
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
		editorRef.addEventListener('dblclick', handleDoubleClick);
		return () => {
			editorRef.removeEventListener('mousedown', handleMouseDown);
			editorRef.removeEventListener('mousemove', handleMouseMove);
			editorRef.removeEventListener('mouseup', handleMouseUp);
			editorRef.removeEventListener('click', handleClick);
			editorRef.removeEventListener('dblclick', handleDoubleClick);
		};
	}, [
		editorRef,
		handleMouseDown,
		handleMouseMove,
		handleMouseUp,
		handleClick,
		handleDoubleClick,
	]);
}
