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
	// useCallback,
	// useState,
} from 'react';
import { File } from '@/types/types';
import Editor from '@/structure/IdealEditor';

export default function EditorView() {
	const { state, dispatch } = useContext(editorContext);
	const {
		state: { selectedFileId, isReaderMode },
	} = useContext(idealContext);
	const [currentContent, setCurrentContent] = useState<File | null>();
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
		if (!editorRef.current) {
			return;
		}
		const editorDom = editorRef.current as HTMLDivElement;
		const width = editorDom.getBoundingClientRect().width;
		editor.handleLineBreaks(width);
	}, [state, editor]);

	// // useEffect(() => {
	// // 	window.editor = editor;
	// // }, [state]);
	// const handleEditorResize = useCallback(() => {
	// 	const editorDom = editorRef.current as HTMLDivElement;
	// 	const width = editorDom.getBoundingClientRect().width;
	// 	editor.handleLineBreaks(width);
	// 	console.log('editor', width);
	// }, [editorRef, dispatch]);

	// useEffect(() => {
	// 	window.addEventListener('resize', handleEditorResize);
	// }, [handleEditorResize]);

	useEffect(() => {
		cursorListener();
	}, []);

	const { isTyping } = useKeyboardControls(
		state,
		isReaderMode,
		dispatch,
		editorRef.current
	);
	useMouseControls(state, dispatch, editorRef.current);
	useCursorListener(editorRef.current, cursorRef.current, isReaderMode);

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
		});
		// window.editor = editor;
	}, []);

	useEffect(() => {
		if (!selectedFileId) {
			setCurrentContent(null);
			return;
		}
		const prevContentInfo = currentContent;
		const content = editor.getAllContent;

		if (prevContentInfo) {
			const id = prevContentInfo?.id;
			prevContentInfo.content = content;
			localStorage.setItem(id, JSON.stringify(prevContentInfo));
		}

		const fileInfo = localStorage.getItem(selectedFileId);
		if (!fileInfo) return;

		const parsedFileInfo: File = JSON.parse(fileInfo);
		if (!parsedFileInfo) {
			return;
		}
		setCurrentContent(parsedFileInfo);
		setTimeout(() => {
			const newEditor = new Editor(parsedFileInfo.content);
			dispatch({ type: 'resetEditor', payload: newEditor });
			setTimeout(() => {
				document.dispatchEvent(new CustomEvent('oncursormove'));
			}, 10);
		}, 0);
		return () => {};
	}, [selectedFileId, dispatch]);

	if (!currentContent) {
		return (
			<div className="w-full h-[100vh] flex flex-col items-center justify-center gap-10">
				<img
					src="/outline.png"
					alt="outlogo"
					className="opacity-20 transform scale-110"
				/>
				<p className="text-lg opacity-60">
					Create a ideal and start writing
				</p>
			</div>
		);
	}

	return (
		<>
			<div className="w-11/12 md:w-6/12 xl:w-9/12 flex items-center justify-center mt-20 mb-10">
				<h1
					style={{ letterSpacing: '10px' }}
					className="text-base opacity-50 uppercase font-bold"
				>
					{currentContent.name}
				</h1>
			</div>
			<main
				ref={editorRef}
				autoFocus
				tabIndex={0}
				className={`relative outline-none ${!isReaderMode ? 'select-none' : ''}  w-11/12 md:w-6/12 xl:w-9/12 self-center cursor-text h-[100vh]`}
			>
				{editor.map((htmlString: string, index: number) => {
					// if (index >= topLine) {
					return (
						<Fragment key={index}>
							<LineComponent
								isReaderMode={isReaderMode}
								lineIndex={index}
								editor={editor}
								htmlString={htmlString}
							/>
						</Fragment>
					);
					// }
				})}
				{!isReaderMode && (
					<div
						ref={cursorRef}
						className={`${isTyping ? '' : 'animate-cursor'} pointer-events-none  min-h-8 transform mt-[1px] -scale-x-50 absolute w-[2px] dark:bg-white bg-black mb-0 overflow-hidden tracking-tighter white`}
					/>
				)}
			</main>
		</>
	);
}

const LineComponent = memo(
	(props: {
		htmlString: string;
		lineIndex: number;
		isReaderMode: boolean;
		editor: Editor;
	}) =>
		createElement('pre', {
			id: `line_${props.lineIndex}`,
			// style: { width: 'fit-content', wordBreak: 'break-all' },
			// before: `${props.lineIndex}`,
			// onClick: (event) => props.editor.moveCursorToNthLine(props.lineIndex, 0),
			// style: { wordBreak: 'break-all' },
			className: `h-8  text-xl ${props.isReaderMode ? 'font-sans' : 'font-editor'} relative`,
			// className: `h-8 text-xl relative before:opacity-50 before:hover:opacity-100 before:absolute before:w-10 w-full font-sans before:bg-gray-100/5 before:text-right before:content-[attr(before)]`,
			dangerouslySetInnerHTML: { __html: props.htmlString },
		})
);
LineComponent.displayName = 'LineComponent';
