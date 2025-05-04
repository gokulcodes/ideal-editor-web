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
	// const [hasMoved, setHasMoved] = useState(false);
	const hasMoved = useRef(false);
	const prevMove = useRef<React.MouseEvent<HTMLDivElement> | null>(null)
	const [geometry, setGeometry] = useState<DOMRect>();
	const mouseDown = useRef<React.MouseEvent<HTMLDivElement> | null>(null);
	const editorRef = useRef<HTMLDivElement>(null);
	const editor = state.editor;
	const cursor = editor.cursor;
	const cursorRef = useRef(null);

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
						document.getElementById('activeCursor');
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
							document.getElementById('activeCursor');
						const geometry = activeCursor?.getBoundingClientRect();
						setGeometry(geometry);
						console.timeEnd('Keyboard Operations');
					}, 100);
				});
				return;
			}

			if (editor.isCursorMoveEvent(event)) {
				editor.resetSelection();
				editor.moveCursor(event);
				dispatch({ type: 'type', payload: editor });
				setTimeout(() => {
					const activeCursor =
						document.getElementById('activeCursor');
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
						document.getElementById('activeCursor');
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
						document.getElementById('activeCursor');
					const geometry = activeCursor?.getBoundingClientRect();
					setGeometry(geometry);
				}, 0);
				return;
			}

			if (editor.selectionMode) {
				editor.deleteSelection();
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
				const activeCursor = document.getElementById('activeCursor');
				const geometry = activeCursor?.getBoundingClientRect();
				setGeometry(geometry);
			}, 0);
		}
		function handleClick(this: Document, event: MouseEvent): void {
			if (hasMoved.current) {
				hasMoved.current = false;
				return;
			}
			// console.log('clicked', mouseDown);
			editor.resetSelection();
			if (!event || !event.target) {
				return;
			}
			const targetNode = event.target as HTMLElement;
			const parentNode = targetNode.parentNode as HTMLElement;

			// curser letter position calculation. This improved the overall editor performance by 20x
			const clientX = event.clientX;
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
			setTimeout(() => {
				const activeCursor = document.getElementById('activeCursor');
				const geometry = activeCursor?.getBoundingClientRect();
				setGeometry(geometry);
			}, 0);
		}
		const activeCursor = document.getElementById('activeCursor');
		const geometry = activeCursor?.getBoundingClientRect();
		setGeometry(geometry);
		document.removeEventListener('keydown', handleKeyDown);
		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('click', handleClick);

		// window.editor = editor;
	}, [editor, cursor, hasMoved, dispatch]);

	function cursorListener() {
		const editorRef = document.getElementById('editor');
		function handleCursorVisibility(entries: IntersectionObserverEntry[]) {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) {
					// console.log(entry.isIntersecting, showCursorInViewPort);
					if (editorRef) {
						// if (geometry?.top <= 0) {
						// 	editorRef.scrollTo({ top: -64, behavior: 'smooth' });
						// } else {
						editorRef.scrollBy({ top: 32, behavior: 'smooth' });
						// }
					}
				}
			});
		}
		const observer = new IntersectionObserver(handleCursorVisibility, {
			root: null,
			rootMargin: '0px',
			threshold: 0,
		});
		if (cursorRef && cursorRef.current) observer.observe(cursorRef.current);
	}
	useEffect(() => {
		cursorListener();
	}, []);

	let cursorLeftPos = 0,
		cursorTopPos = 0,
		cursorHeight = 0;

	if (geometry) {
		const editorRef = document.getElementById('editor');
		if (editorRef) {
			// const containerRect = editorRef.getBoundingClientRect();
			// console.log(geometry, document.getElementById('activeCursor')?.getBoundingClientRect())
			cursorLeftPos = geometry.left + geometry.width;
			cursorTopPos = geometry.top + editorRef.scrollTop;
			cursorHeight = geometry.height;
		}
	}

	// function handleMouseUp(event: React.MouseEvent<HTMLDivElement>) {
	// }

	let offsetX = 0,
		offsetY = 0;

	function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
		if (!mouseDown.current || !isDragging) {
			return;
		}

		let textStart = Math.floor(mouseDown.current.clientX / 12),
			textEnd = Math.floor(event.clientX / 12);
		let lineStart = Math.floor(mouseDown.current.clientY / 32),
			lineEnd = Math.floor(event.clientY / 32);

		// console.log('MouseDown: ', "Text Start: ", parseInt(mouseDown.current.clientX / 12), "Line Start: ", parseInt(mouseDown.current.clientY / 32))
		// console.log('MouseMove: ', "Text End: ", parseInt(event.clientX / 12), "Line End: ", parseInt(event.clientY / 32))

		// if(lineStart > lineEnd) [lineStart, lineEnd] = [lineEnd, lineStart]

		// console.log(event.target)
		const x = event.clientX - offsetX;
		const y = event.clientY - offsetY;
		prevMove.current = event;
		if (
			editorRef.current &&
			(Math.abs(x - editorRef.current.offsetLeft) > 1 ||
				Math.abs(y - editorRef.current.offsetTop))
		) {
			hasMoved.current = true;
		}
		let mouseDownTarget: HTMLElement | null = mouseDown.current
			.target as HTMLElement;
		let mouseUpTarget: HTMLElement | null = event.target as HTMLDivElement;
		while (mouseDownTarget && !mouseDownTarget.id.includes('line')) {
			mouseDownTarget = mouseDownTarget.parentElement;
		}
		while (mouseUpTarget && !mouseUpTarget.id.includes('line')) {
			mouseUpTarget = mouseUpTarget.parentElement;
		}
		// console.log(mouseDownTarget, mouseUpTarget)
		// const mouseDownPosition = parseInt(mouseDownTarget.id?.split('_')?.[1]);
		// const mouseUpPosition = parseInt(mouseUpTarget.id?.split('_')?.[1]);
		// let lineStart = 0,
		// 	lineEnd = 0;

		// if (!mouseDownTarget.parentNode) {
		// 	lineStart = parseInt(mouseDownTarget.id.split('_')?.[1]);
		// } else if (mouseDownTarget.parentNode) {
		// 	const parentNode = mouseDownTarget.parentNode as HTMLDivElement;
		// 	lineStart = parseInt(parentNode.id.split('_')?.[1]);
		// }

		// if (!mouseUpTarget.parentNode) {
		// 	lineEnd = parseInt(mouseUpTarget.id.split('_')?.[1]);
		// } else if (mouseUpTarget.parentNode) {
		// 	const parentNode = mouseUpTarget.parentNode as HTMLDivElement;
		// 	lineEnd = parseInt(parentNode.id.split('_')?.[1]);
		// }
		// console.log(mouseDownTarget, mouseUpTarget)
		// const lineStartId = mouseDownTarget?.id.split('_'),
		// 	lineEndId = mouseUpTarget?.id.split('_');
		// if (lineStartId?.[0] === 'line' && lineEndId?.[0] === 'line') {
		// 	const clientX = event.clientX;
		// 	let charWidth = clientX / 12;
		// 	charWidth = parseInt(charWidth.toString());
		// 	const textNo = charWidth;
			// const lineStart = parseInt(lineStartId[1]),
				// lineEnd = parseInt(lineEndId[1]);
			// console.log(textNo)
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
		// } else {
			// console.log(mouseDownTarget, mouseUpTarget)
		// }
		// console.log(, mouseUpTarget.id.split('_'))
		// if (mouseDownPosition != mouseUpPosition) {
		// 	editor.updateLetterSelectionOnMouseMove(
		// 		lineStart,
		// 		lineEnd,
		// 		mouseDownPosition,
		// 		mouseUpPosition
		// 	);
		dispatch({ type: 'type', payload: editor });
		setTimeout(() => {
			const activeCursor = document.getElementById('activeCursor');
			const geometry = activeCursor?.getBoundingClientRect();
			setGeometry(geometry);
		}, 0);
		// }
	}
	return (
		<div
			id="editor"
			ref={editorRef}
			onMouseDown={(event) => {
				mouseDown.current = event;
				setIsDragging(true);
				const editor = editorRef.current;
				if (editor) {
					offsetX = event.clientX - editor?.offsetLeft;
					offsetY = event.clientY - editor?.offsetTop;
				}
			}}
			onMouseMove={(event) => handleMouseMove(event)}
			onMouseUp={() => {
				mouseDown.current = null;
				setIsDragging(false);
			}}
			className="relative select-none cursor-text h-[100vh] overflow-y-scroll"
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
				ref={cursorRef}
				style={{
					pointerEvents: 'none',
					left: `${cursorLeftPos}px`,
					top: `${cursorTopPos}px`,
					height: `${cursorHeight}px`,
				}}
				className="animate-cursor font-sans min-h-8 transform -mt-0 -scale-x-50 absolute w-1 bg-white mb-0 overflow-hidden tracking-tighter white"
			/>
		</div>
	);
}

const LineComponent = memo((props: { htmlString: string; lineIndex: number }) =>
	createElement('pre', {
		id: `line_${props.lineIndex}`,
		before: `${props.lineIndex}`,
		className: `h-8 text-xl overflow-hidden hover:bg-white/2 relative w-full font-sans`,
		// className: `h-8 text-xl relative before:opacity-50 before:hover:opacity-100 before:absolute before:w-10 w-full font-sans before:bg-gray-100/5 before:text-right before:content-[attr(before)]`,
		dangerouslySetInnerHTML: { __html: props.htmlString },
	})
);
LineComponent.displayName = 'LineComponent';
