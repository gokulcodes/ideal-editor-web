'use client';
import editorContext from '@/controller/editorContext';
import idealContext from '@/controller/idealContext';
import { useContext, memo, useEffect, useRef } from 'react';
import DocumentSaver from './DocumentSaver';

const NumberScroller = memo((props: { selectedNum: string }) => {
	const ref = useRef<HTMLDivElement>(null);
	const num = parseInt(props.selectedNum);

	useEffect(() => {
		if (!ref.current) {
			return;
		}
		ref.current.scrollTo({
			top: num * 16,
			behavior: 'smooth',
		});
	}, [ref, num]);

	return (
		<div
			ref={ref}
			className="flex flex-col items-center h-4 overflow-hidden"
		>
			{Array.from({ length: 10 }).map((_, ind) => (
				<span
					className="text-xs"
					key={ind}
				>
					{ind}
				</span>
			))}
		</div>
	);
});

NumberScroller.displayName = 'NumberScroller';

function NumberAnimate(props: { counter: number }) {
	const { counter } = props;
	const counterStr = counter.toString();
	const numberMapper = counterStr.split('').map((char, ind) => {
		return (
			<NumberScroller
				key={ind}
				selectedNum={char}
			/>
		);
	});
	return (
		<div className="relative flex items-center transition-all duration-300 ease-in-out justify-center">
			<div
				id="editorstats"
				className="flex z-10 flex-row gap-0 items-center"
			>
				{numberMapper}
			</div>
			{/* <div className="bg-gradient-to-t from-[#0a0a0a] via-transparent via-50% to-[#0a0a0a] absolute w-full h-8 z-50 -top-2 left-0 bottom-0" /> */}
		</div>
	);
}

export default function EditorStats() {
	const {
		state: { editor },
	} = useContext(editorContext);
	const { state, dispatch } = useContext(idealContext);

	if (!state.selectedItem?.id || state.isReaderMode) {
		return null;
	}
	function handleExitFocusMode() {
		dispatch({
			type: 'toggleFocusMode',
			payload: { ...state, isFocusMode: false },
		});
	}
	return (
		<div className="fixed right-4 bottom-2 flex flex-row items-center gap-4">
			{state.isFocusMode ? (
				<button
					style={{ width: 'fit-content' }}
					onClick={handleExitFocusMode}
					className="border dark:invert rounded-full border-black/20 text-black/80 hover:text-black cursor-pointer hover:bg-black/20 px-4 py-1 flex flex-row  items-center gap-2 justify-start text-sm w-full text-left"
				>
					<img
						src="/icons/focus-mode.png"
						alt="reader-mode"
						className="w-4 h-4"
					/>
					Exit Focus Mode
				</button>
			) : null}
			<DocumentSaver />
			<div className="text-xs flex flex-row gap-2 opacity-100">
				<p>Lines </p>
				<NumberAnimate counter={editor.totalLineCount + 1} />
			</div>
			<span className="opacity-40">|</span>
			<div className="text-xs flex flex-row gap-2 opacity-100">
				<p>Characters</p>
				<NumberAnimate counter={editor.totalLetterCount} />
			</div>
		</div>
	);
}
