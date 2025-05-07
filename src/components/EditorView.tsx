import editorContext from '@/controller/editorContext';
import idealContext from '@/controller/idealContext';
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
	useState,
	// useState,
} from 'react';
import { fileType } from './sidebar/FileView';

export default function EditorView() {
	const { state, dispatch } = useContext(editorContext);
	const {
		state: { selectedFileId },
	} = useContext(idealContext);
	const [currentContent, setCurrentContent] = useState<fileType>();
	const editor = state.editor;
	const editorRef = useRef<HTMLDivElement>(null);
	const cursorRef = useRef<HTMLDivElement>(null);
	// const [topLine, setTopLine] = useState(0);
	// const [bottomLine, setBottomLine] = useState(0);

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

	const { isTyping } = useKeyboardControls(
		state,
		dispatch,
		editorRef.current
	);
	useMouseControls(state, dispatch, editorRef.current);
	useCursorListener(editorRef.current, cursorRef.current);
	useEffect(() => {
		editorRef.current?.addEventListener('scroll', () => {
			if (!editorRef.current) {
				return;
			}
			const lineNotVisible = Math.ceil(editorRef.current?.scrollTop / 32);
			const lineBottomNotVisible = Math.ceil(
				(editorRef.current?.scrollHeight -
					editorRef.current?.clientHeight -
					editorRef.current?.scrollTop) /
					32
			);
			console.log('Top: ', lineNotVisible);
			console.log('Bottom: ', lineBottomNotVisible);
			// setTopLine(lineNotVisible);
			// setBottomLine(lineBottomNotVisible);
		});
		// window.editor = editor;
	}, []);

	useEffect(() => {
		if (!selectedFileId) {
			return;
		}
		dispatch({ type: 'resetEditor', payload: editor });
		setTimeout(() => {
			const fileInfo = localStorage.getItem(selectedFileId);
			if (!fileInfo) return;

			const parsedFileInfo: fileType = JSON.parse(fileInfo);
			if (!parsedFileInfo) {
				return;
			}
			setCurrentContent(parsedFileInfo);
			// editorRef.current?.dispatchEvent(
			// 	new KeyboardEvent('keydown', { key: 'a', metaKey: true })
			// );
			// editorRef.current?.dispatchEvent(
			// 	new KeyboardEvent('keydown', { key: 'Backspace' })
			// );
			navigator.clipboard.writeText(parsedFileInfo.name);
			editorRef.current?.dispatchEvent(
				new KeyboardEvent('keydown', { key: 'v', metaKey: true })
			);
		}, 100);
	}, [selectedFileId]);
	// console.log('selectedFileId', editor);

	return (
		<>
			<div className="my-20">
				<h1 className="text-4xl font-bold">{currentContent?.name}</h1>
			</div>
			<div
				ref={editorRef}
				autoFocus
				tabIndex={0}
				className="relative outline-none select-none cursor-text w-11/12 md:w-9/12 xl:w-1/2 h-[100vh] overflow-hidden"
			>
				{editor.map((htmlString: string, index: number) => {
					// if (index >= topLine) {
					return (
						<Fragment key={index}>
							<LineComponent
								lineIndex={index}
								htmlString={htmlString}
							/>
						</Fragment>
					);
					// }
				})}
				<div
					ref={cursorRef}
					className={`${isTyping ? '' : 'animate-cursor'} pointer-events-none min-h-8 transform mt-[1px] -scale-x-50 absolute w-[2px] bg-white mb-0 overflow-hidden tracking-tighter white`}
				/>
			</div>
		</>
	);
}

const LineComponent = memo((props: { htmlString: string; lineIndex: number }) =>
	createElement('pre', {
		id: `line_${props.lineIndex}`,
		before: `${props.lineIndex}`,
		className: `h-8 text-xl font-editor overflow-hidden .relative w-full`,
		// className: `h-8 text-xl relative before:opacity-50 before:hover:opacity-100 before:absolute before:w-10 w-full font-sans before:bg-gray-100/5 before:text-right before:content-[attr(before)]`,
		dangerouslySetInnerHTML: { __html: props.htmlString },
	})
);
LineComponent.displayName = 'LineComponent';
