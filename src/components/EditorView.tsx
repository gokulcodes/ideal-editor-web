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
			editor.resetSelection();
			if (!event || !event.target) {
				return;
			}
			const targetNode = event.target as HTMLElement;
			const parentNode = targetNode.parentNode as HTMLElement;
			
			// curser letter position calculation. This improved the overall editor performance by 20x
			const clientX = event.clientX
			let charWidth = clientX / 12;
			charWidth = parseInt(charWidth.toString())
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
	}, [editor, cursor, dispatch]);

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
				const activeCursor = document.getElementById('activeCursor');
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
			id="editor"
			onMouseMove={(event) => handleMouseMove(event)}
			onMouseUp={() => {
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
					left: `${cursorLeftPos}px`,
					top: `${cursorTopPos}px`,
					height: `${cursorHeight}px`,
				}}
				className="animate-cursor font-sans min-h-6 transform -mt-0 -scale-x-50 absolute w-1 bg-white mb-0 overflow-hidden tracking-tighter white"
			/>
		</div>
	);
}

const LineComponent = memo((props: { htmlString: string; lineIndex: number }) =>
	createElement('pre', {
		id: `line_${props.lineIndex}`,
		before: `${props.lineIndex}`,
		className: `h-6 text-xl overflow-hidden hover:bg-white/2 relative w-full font-sans`,
		// className: `h-8 text-xl relative before:opacity-50 before:hover:opacity-100 before:absolute before:w-10 w-full font-sans before:bg-gray-100/5 before:text-right before:content-[attr(before)]`,
		dangerouslySetInnerHTML: { __html: props.htmlString },
	})
);
LineComponent.displayName = 'LineComponent';
