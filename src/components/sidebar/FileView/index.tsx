import idealContext from '@/controller/idealContext';
import {
	memo,
	Suspense,
	useCallback,
	useContext,
	useEffect,
	useRef,
} from 'react';
import { CiFileOn } from 'react-icons/ci';
import { File, Folder } from '@/types/types';
import FolderCreateView from './FolderCreateView';
import FileCreateView from './FileCreateView';
import { VscNewFile, VscNewFolder } from 'react-icons/vsc';

type RenderFolderType = {
	updateSelectedFile: (id: string) => void;
	selectedFileId: string;
	files: Array<File | Folder> | null;
	isInnerFolderView: boolean;
};

function Hightlighter() {
	function updateWidth(event: HTMLDivElement | null) {
		if (event) {
			const sidebar = document.getElementById('sidebar');
			const highlight = document.getElementById('highlight');
			if (sidebar && highlight) {
				const width = sidebar.getBoundingClientRect().width;
				highlight.style.width = `${width}px`;
			}
		}
	}
	return (
		<div
			id="highlight"
			ref={(event) => updateWidth(event)}
			className="h-10 bg-white/10 pointer-events-none absolute left-0"
		/>
	);
}

const RenderFolder = memo((props: RenderFolderType) => {
	const { updateSelectedFile, selectedFileId, files, isInnerFolderView } =
		props;
	const { state } = useContext(idealContext);

	const isFolderCreateViewOpen = useCallback(
		(id: string) => id === selectedFileId && state.newFolderCreate,
		[selectedFileId, state.newFolderCreate]
	);
	const isFileCreateViewOpen = useCallback(
		(id: string) => id === selectedFileId && state.newFileCreate,
		[selectedFileId, state.newFileCreate]
	);

	function FileOrFolderCreateView(id: string) {
		if (isFolderCreateViewOpen(id)) {
			return <FolderCreateView isInnerFolderView={isInnerFolderView} />;
		}
		if (isFileCreateViewOpen(id)) {
			return <FileCreateView isInnerFolderView={isInnerFolderView} />;
		}
		return null;
	}

	if (!files || !Array.isArray(files)) {
		return null;
	}

	return (
		<div
			className={`flex flex-col overflow-hidden w-full relative ${isInnerFolderView ? '-left-0 border-l border-white/10' : ''}`}
		>
			{files.map((file) => {
				if (file.type === 'folder') {
					// render folders
					return (
						<details
							className={`relative [open]:bg-white/10 border-t border-b border-transparent hover:border-white/10 pl-3 ${selectedFileId === file.id ? ' border-white/5' : ''} `}
							key={file.id}
							onClick={(event) => {
								event.stopPropagation();
								// let element = event.target as HTMLSpanElement;
								// while (
								// 	element &&
								// 	element.tagName !== 'DETAILS'
								// ) {
								// 	element =
								// 		element.parentNode as HTMLSpanElement;
								// }
								// if (element) {
								// 	console.log(element);
								// 	const geometry =
								// 		element.getBoundingClientRect();
								// 	}
								updateSelectedFile(file.id);
							}}
						>
							<summary className="p-2">
								<span className="relative left-8">
									{file.name}
								</span>
							</summary>
							{/* {file.id === selectedFileId && <Hightlighter />} */}
							<div className="relative pl-4">
								<RenderFolder
									updateSelectedFile={updateSelectedFile}
									selectedFileId={selectedFileId}
									files={file.childFiles}
									isInnerFolderView={true}
								/>
								{FileOrFolderCreateView(file.id)}
							</div>
						</details>
					);
				}
				return (
					<>
						<span
							className={`relative flex gap-1 items-center text-base w-full cursor-pointer border-t border-b border-transparent hover:border-white/10 p-2 pl-5`}
							key={file.id}
							onClick={(event) => {
								event.stopPropagation();
								// const element = event.target as HTMLSpanElement;
								// const geometry =
								// 	element.getBoundingClientRect();
								// console.log(geometry);
								updateSelectedFile(file.id);
							}}
						>
							<CiFileOn />
							<span className="pl-2 pointer-events-none">
								{file.name}
							</span>
							{file.id === selectedFileId && <Hightlighter />}
						</span>
						{FileOrFolderCreateView(file.id)}
					</>
				);
			})}
		</div>
	);
});

RenderFolder.displayName = 'RenderFolder';

export default function FileView() {
	const { state, dispatch } = useContext(idealContext);
	const fileRef = useRef<HTMLDivElement>(null);
	// const [highlightPosition, setHighlightPosition] = useState<DOMRect>();
	// const [scrollTop, setScrollTop] = useState(-1);
	useEffect(() => {
		const files = localStorage.getItem('files');
		if (files) {
			const parsedFiles = JSON.parse(files);
			dispatch({
				type: 'fileUpdate',
				payload: { ...state, files: parsedFiles },
			});
		} else {
			dispatch({
				type: 'fileUpdate',
				payload: { ...state, files: [] },
			});
		}
	}, [dispatch]);

	// useEffect(() => {
	// 	if (!fileRef.current) {
	// 		return;
	// 	}
	// 	fileRef.current.addEventListener('scroll', () => {
	// 		console.log(fileRef.current?.scrollTop);
	// 		setScrollTop(fileRef.current?.scrollTop);
	// 	});
	// 	console.log('added', fileRef.current);
	// 	setTimeout(() => {
	// 		setScrollTop(fileRef.current?.scrollTop);
	// 	}, 1000);
	// }, []);

	const updateSelectedFile = useCallback(
		(id: string) => {
			dispatch({
				type: 'updateSelectedFileId',
				payload: { ...state, selectedFileId: id },
			});
			// setHighlightPosition(position);
			// console.log(position);
		},
		[dispatch, state]
	);

	if (!Array.isArray(state.files)) {
		return (
			<div className="flex flex-col items-center justify-center w-full mt-4 gap-4">
				{Array.from({ length: 10 })
					.fill(0)
					.map((_, index) => index)
					.reverse()
					.map((val) => (
						<div
							key={val}
							className="h-10 bg-white/10 animate-pulse w-11/12 rounded-md"
							style={{ filter: `brightness(${val / 10})` }}
						/>
					))}
			</div>
		);
	}

	function openFileCreate() {
		dispatch({
			type: 'newFileCreate',
			payload: { ...state, newFileCreate: true },
		});
	}

	function openFolderCreate() {
		dispatch({
			type: 'newFolderCreate',
			payload: { ...state, newFolderCreate: true },
		});
	}

	return (
		<div
			id="fileview"
			ref={fileRef}
			className="w-full h-full overscroll-contain overflow-y-scroll select-none"
		>
			<div className="flex flex-col gap-3 px-4 my-4">
				<button
					onClick={openFileCreate}
					className="px-4 py-2 flex items-center gap-2  cursor-pointer hover:bg-white/10 border border-white/20 rounded-sm"
				>
					<VscNewFile />
					New File
				</button>
				<button
					onClick={openFolderCreate}
					className="px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-white/10 border border-white/20 rounded-sm"
				>
					<VscNewFolder />
					New Folder
				</button>
			</div>
			<p className="uppercase tracking-widest mx-5 my-3 opacity-80 text-xs">
				Files & Folders
			</p>
			<Suspense fallback={<p>Loading...</p>}>
				<RenderFolder
					selectedFileId={state.selectedFileId}
					updateSelectedFile={updateSelectedFile}
					files={state.files}
					isInnerFolderView={false}
				/>
				{/* {highlightPosition && (
					<div
						style={{
							top: `${highlightPosition?.top - scrollTop}px`,
							height: `${42}px`,
						}}
						className="w-full bg-white/10 pointer-events-none absolute left-0"
					/>
				)} */}
			</Suspense>
			{state.newFileCreate && !state.selectedFileId && (
				<FileCreateView isInnerFolderView={false} />
			)}
			{state.newFolderCreate && !state.selectedFileId && (
				<FolderCreateView isInnerFolderView={false} />
			)}
		</div>
	);
}
