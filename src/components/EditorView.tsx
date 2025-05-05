import editorContext from '@/controller/editorContext';
import useCursorListener from '@/hooks/useCursorListener';
import useKeyboardControls from '@/hooks/useKeyboardControls';
import useMouseControls from '@/hooks/useMouseControls';
import React, {
	createElement,
	useContext,
	memo,
	useEffect,
	Fragment,
	useRef,
} from 'react';

export default function EditorView() {
	const { state, dispatch } = useContext(editorContext);
	const editor = state.editor;
	const editorRef = useRef<HTMLDivElement>(null);
	const cursorRef = useRef<HTMLDivElement>(null);

	// const [geometry, setGeometry] = useState<DOMRect>();
	// const cursor = editor.cursor;
	

	useEffect(() => {
		// setDragging(!isDragging)
		// const activeCursor = document.getElementById('activeCursor');
		// const geometry = activeCursor?.getBoundingClientRect();
		// setGeometry(geometry);
		// window.editor = editor;
	}, []);

	// function cursorListener() {
	// 	const editorRef = document.getElementById('editor');
	// 	function handleCursorVisibility(entries: IntersectionObserverEntry[]) {
	// 		entries.forEach((entry) => {
	// 			if (!entry.isIntersecting) {
	// 				// console.log(entry.isIntersecting, showCursorInViewPort);
	// 				if (editorRef) {
	// 					// if (geometry?.top <= 0) {
	// 					// 	editorRef.scrollTo({ top: -64, behavior: 'smooth' });
	// 					// } else {
	// 					editorRef.scrollBy({ top: 32, behavior: 'smooth' });
	// 					// }
	// 				}
	// 			}
	// 		});
	// 	}
	// 	const observer = new IntersectionObserver(handleCursorVisibility, {
	// 		root: null,
	// 		rootMargin: '0px',
	// 		threshold: 0,
	// 	});
	// 	if (cursorRef && cursorRef.current) observer.observe(cursorRef.current);
	// }
	// useEffect(() => {
	// 	cursorListener();
	// }, []);

	// let cursorLeftPos = 0,
	// 	cursorTopPos = 0,
	// 	cursorHeight = 0;

	// if (geometry) {
	// 	const editorRef = document.getElementById('editor');
	// 	if (editorRef) {
	// 		// const containerRect = editorRef.getBoundingClientRect();
	// 		// console.log(geometry, document.getElementById('activeCursor')?.getBoundingClientRect())
	// 		cursorLeftPos = geometry.left + geometry.width;
	// 		cursorTopPos = geometry.top + editorRef.scrollTop;
	// 		cursorHeight = geometry.height;
	// 	}
	// }

	const { isTyping } = useKeyboardControls(state, dispatch, editorRef.current);
	useMouseControls(state, dispatch, editorRef.current);
	useCursorListener(editorRef.current, cursorRef.current);

	return (
		<div
			id="editor"
			ref={editorRef}
			autoFocus
			tabIndex={0}
			className="relative outline-none select-none cursor-text h-[100vh] overflow-y-scroll"
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
				className={`${isTyping ? "" : "animate-cursor"} pointer-events-none font-sans min-h-8 transform mt-[1px] -scale-x-50 absolute w-[2px] bg-white mb-0 overflow-hidden tracking-tighter white`}
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
