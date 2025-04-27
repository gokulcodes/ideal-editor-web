import editorContext from '@/controller/editorContext';
// import { deepCopy } from '@/structure/editorUtils';
import React, {
	createElement,
	useEffect,
	useContext,
	memo,
	Fragment,
	useState,
	useRef,
} from 'react';

export default function EditorView() {
	// const inputRef = useRef(null);
	const { state, dispatch } = useContext(editorContext);
	const [isDragging, setIsDragging] = useState(false);
	const [geometry, setGeometry] = useState<DOMRect>();
	const mouseDown = useRef<React.MouseEvent<HTMLDivElement> | null>(null);
	const editor = state.editor;
	const cursor = editor.cursor;

	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			event.preventDefault();
			if (editor.isIgnorableKeys(event)) {
				return;
			}

			if (event.key === 'Tab') {
				cursor.lineCursor.addLetter(cursor, '\t');
				dispatch({ type: 'type', payload: editor });
				setTimeout(() => {
					const activeCursor =
						document.querySelector('#activeCursor');
					const geometry = activeCursor?.getBoundingClientRect();
					setGeometry(geometry);
				}, 0);
				return;
			}

			function cb() {
				dispatch({ type: 'type', payload: editor });
			}

			if (editor.isKeyboardShortcut(event)) {
				console.time('Keyboard Operations');
				editor.handleKeyboardShortcuts(cb, event).then(() => {
					setTimeout(() => {
						const activeCursor =
							document.querySelector('#activeCursor');
						const geometry = activeCursor?.getBoundingClientRect();
						setGeometry(geometry);
						console.timeEnd('Keyboard Operations');
					}, 100);
				});
				return;
			}

			if (editor.isCursorMoveEvent(event)) {
				editor.moveCursor(event);
				dispatch({ type: 'type', payload: editor });
				setTimeout(() => {
					const activeCursor =
						document.querySelector('#activeCursor');
					const geometry = activeCursor?.getBoundingClientRect();
					setGeometry(geometry);
				}, 0);
				return;
			}
			if (event.key === 'Enter') {
				editor.insertLine();
				dispatch({ type: 'type', payload: editor });
				setTimeout(() => {
					const activeCursor =
						document.querySelector('#activeCursor');
					const geometry = activeCursor?.getBoundingClientRect();
					setGeometry(geometry);
				}, 0);
				return;
			}

			if (event.key === 'Backspace') {
				if (editor.selectionMode) {
					editor.deleteSelection();
					editor.selectionMode = false;
				} else {
					cursor.lineCursor.deleteLetters(
						cursor,
						cursor.letterCursor,
						cursor.letterCursor
					);
				}
				dispatch({ type: 'type', payload: editor });
				setTimeout(() => {
					const activeCursor =
						document.querySelector('#activeCursor');
					const geometry = activeCursor?.getBoundingClientRect();
					setGeometry(geometry);
				}, 0);
				return;
			}

			cursor.lineCursor.addLetter(cursor, event.key);
			// if (editor.undoRedoBuffer.length == 0) {
			// 	editor.undoRedoBuffer.push(deepCopy(editor));
			// }
			// if (editor.undoRedoBuffer.length > 4) {
			// 	editor.undoRedoBuffer.shift()
			// }
			// if (event.key === ' ') {
			// 	editor.undoRedoBuffer.push(deepCopy(editor));
			// }
			dispatch({ type: 'type', payload: editor });

			setTimeout(() => {
				const activeCursor = document.querySelector('#activeCursor');
				const geometry = activeCursor?.getBoundingClientRect();
				setGeometry(geometry);
			}, 0);
		}
		function handleClick(this: Document, event: MouseEvent): void {
			editor.resetSelection();
			if (!event || !event.target) {
				return;
			}
			const targetNode = event.target as HTMLElement;
			const parentNode = targetNode.parentNode as HTMLElement;
			let lineNo = 0,
				textNo = 0;
			if (!parentNode.id) {
				lineNo = parseInt(targetNode.id.split('_')[1]);
				textNo = targetNode.childNodes.length;
			} else {
				lineNo = parseInt(parentNode.id.split('_')[1]);
				textNo = parseInt(targetNode.id.split('_')[1]);
			}
			editor.moveCursorToNthLine(lineNo, textNo);
			dispatch({ type: 'type', payload: editor });
			setTimeout(() => {
				const activeCursor = document.querySelector('#activeCursor');
				const geometry = activeCursor?.getBoundingClientRect();
				setGeometry(geometry);
			}, 0);
		}
		const activeCursor = document.querySelector('#activeCursor');
		const geometry = activeCursor?.getBoundingClientRect();
		setGeometry(geometry);
		document.removeEventListener('keydown', handleKeyDown);
		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('click', handleClick);
		// window.editor = editor;
	}, [editor, cursor, dispatch]);

	let cursorLeftPos = 0,
		cursorTopPos = 0,
		cursorHeight = 0;
	if (geometry) {
		cursorLeftPos = geometry.left + geometry.width;
		cursorTopPos = geometry.top;
		cursorHeight = geometry.height + 10;
	}

	// function handleMouseUp(event: React.MouseEvent<HTMLDivElement>) {
	// }

	function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
		// if (isDragging) {
		// 	console.log(event.target)
		// }
		if (!mouseDown.current || !isDragging) {
			return;
		}
		const mouseDownTarget = mouseDown.current.target as HTMLDivElement;
		const mouseUpTarget = event.target as HTMLDivElement;
		const mouseDownPosition = parseInt(mouseDownTarget.id?.split('_')?.[1]);
		const mouseUpPosition = parseInt(mouseUpTarget.id?.split('_')?.[1]);
		let lineStart = 0,
			lineEnd = 0;

		if (!mouseDownTarget.parentNode) {
			lineStart = parseInt(mouseDownTarget.id.split('_')?.[1]);
		} else if (mouseDownTarget.parentNode) {
			const parentNode = mouseDownTarget.parentNode as HTMLDivElement;
			lineStart = parseInt(parentNode.id.split('_')?.[1]);
		}

		if (!mouseUpTarget.parentNode) {
			lineEnd = parseInt(mouseUpTarget.id.split('_')?.[1]);
		} else if (mouseUpTarget.parentNode) {
			const parentNode = mouseUpTarget.parentNode as HTMLDivElement;
			lineEnd = parseInt(parentNode.id.split('_')?.[1]);
		}

		if (mouseDownPosition != mouseUpPosition) {
			editor.updateLetterSelectionOnMouseMove(
				lineStart,
				lineEnd,
				mouseDownPosition,
				mouseUpPosition
			);
			editor.moveCursorToNthLine(lineEnd, mouseUpPosition);
			dispatch({ type: 'type', payload: editor });
			setTimeout(() => {
				const activeCursor = document.querySelector('#activeCursor');
				const geometry = activeCursor?.getBoundingClientRect();
				setGeometry(geometry);
			}, 0);
		}
	}

	return (
		<div
			onMouseDown={(event) => {
				mouseDown.current = event;
				setIsDragging(true);
			}}
			onMouseMove={(event) => handleMouseMove(event)}
			onMouseUp={() => {
				setIsDragging(false);
			}}
			className="p-10 relative select-none cursor-text "
		>
			{editor.map((htmlString: string, index: number) => (
				<Fragment key={index}>
					<LineComponent
						lineIndex={index}
						htmlString={htmlString}
					/>
				</Fragment>
			))}
			<div
				style={{
					left: `${cursorLeftPos}px`,
					top: `${cursorTopPos}px`,
					height: `${cursorHeight}px`,
				}}
				className="animate-cursor font-sans min-h-8 transform -scale-x-50 -mt-2 absolute w-1 bg-green-600 mb-0 overflow-hidden tracking-tighter white"
			/>
		</div>
	);
}

const LineComponent = memo((props: { htmlString: string; lineIndex: number }) =>
	createElement('pre', {
		id: `line_${props.lineIndex}`,
		className: 'h-8 text-xl w-full font-sans',
		dangerouslySetInnerHTML: { __html: props.htmlString },
	})
);
LineComponent.displayName = 'LineComponent';
