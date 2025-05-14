'use client';
import editorContext from '@/controller/editorContext';
import { useContext, memo, useEffect, useRef } from 'react';

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
		<div className="relative flex items-center justify-center">
			<div
				id="editorstats"
				className="flex z-10 flex-row gap-0 items-center"
			>
				{numberMapper}
			</div>
			<div className="bg-gradient-to-t from-[#0a0a0a] via-transparent via-50% to-[#0a0a0a] absolute w-full h-8 z-50 -top-2 left-0 bottom-0" />
		</div>
	);
}

export default function EditorStats() {
	const { state } = useContext(editorContext);

	return (
		<div className="fixed right-4 bottom-2 flex flex-row items-center gap-2">
			<div className="text-xs flex flex-row gap-2 opacity-100">
				<p>Lines </p>
				<NumberAnimate counter={state.editor.totalLineCount} />
			</div>
			<span className=" transform -scale-x-10">|</span>
			<div className="text-xs flex flex-row gap-2 opacity-100">
				<p>Characters</p>
				<NumberAnimate counter={state.editor.totalLetterCount} />
			</div>
		</div>
	);
}
