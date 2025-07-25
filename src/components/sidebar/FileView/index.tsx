import idealContext from '@/controller/idealContext';
import {
	Fragment,
	memo,
	Suspense,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import { File, Folder } from '@/types/types';
import FolderCreateView from './FolderCreateView';
import FileCreateView from './FileCreateView';
import Modal from '@/components/modal';

type RenderFolderType = {
	updateSelectedItem: (item: File | Folder | null) => void;
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
			className="h-10 bg-black/10 pointer-events-none absolute left-0"
		/>
	);
}

const RenderFolder = memo((props: RenderFolderType) => {
	const { updateSelectedItem, files, isInnerFolderView } = props;
	const { state } = useContext(idealContext);

	const isFolderCreateViewOpen = useCallback(
		(id: string) => id === state.selectedItem?.id && state.newFolderCreate,
		[state.selectedItem, state.newFolderCreate]
	);
	const isFileCreateViewOpen = useCallback(
		(id: string) => id === state.selectedItem?.id && state.newFileCreate,
		[state.selectedItem, state.newFileCreate]
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
			className={`flex flex-col overflow-hidden w-full relative ${isInnerFolderView ? '-left-0 border-l border-black/10' : ''}`}
		>
			{files.map((file) => {
				if (file.type === 'folder') {
					// render folders
					return (
						<details
							className={`relative text-black [open]:bg-black/10 border-t border-b border-transparent hover:border-black/10 pl-3 ${state.selectedItem?.id === file.id ? 'bg-black/10 ' : ''} `}
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
								updateSelectedItem(file);
							}}
						>
							<summary className="p-2">
								{state.folderRename &&
								file.id === state.selectedItem?.id ? (
									<FolderCreateView
										isInnerFolderView={isInnerFolderView}
									/>
								) : (
									<span className="relative left-8">
										{file.name}
									</span>
								)}
							</summary>
							{/* {file.id === selectedFileId && <Hightlighter />} */}
							<div className="relative pl-4 pb-5">
								<RenderFolder
									updateSelectedItem={updateSelectedItem}
									files={file.childFiles}
									isInnerFolderView={true}
								/>
								{FileOrFolderCreateView(file.id)}
							</div>
							{/* {file.id === state.selectedItem?.id && (
								<Hightlighter />
							)} */}
						</details>
					);
				}
				return (
					<>
						<span
							className={`relative  flex gap-1 items-center text-black text-base w-full cursor-pointer border-t border-b border-transparent hover:border-black/10 p-2 pl-5`}
							key={file.id}
							onClick={(event) => {
								event.stopPropagation();
								// const element = event.target as HTMLSpanElement;
								// const geometry =
								// 	element.getBoundingClientRect();
								// console.log(geometry);
								updateSelectedItem(file);
							}}
						>
							{state.fileRename &&
							file.id === state.selectedItem?.id ? (
								<FileCreateView
									isInnerFolderView={isInnerFolderView}
								/>
							) : (
								<Fragment>
									<img
										src="/icons/file.png"
										alt="file-mode"
										className="w-4 h-4"
									/>
									<span className="pl-2 pointer-events-none">
										{file.name}
									</span>
								</Fragment>
							)}
							{file.id === state.selectedItem?.id && (
								<Hightlighter />
							)}
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
	const [isFocused, setIsFocused] = useState(false);
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

	const updateSelectedItem = useCallback(
		(item: File | Folder | null) => {
			dispatch({
				type: 'updateSelectedItem',
				payload: { ...state, selectedItem: item },
			});
			// setHighlightPosition(position);
			// console.log(position);
		},
		[dispatch, state]
	);

	function handleFolderRename() {
		// console.log('file renames');
		// setFileRename(!fileRename);
		dispatch({
			type: 'toggleFolderRename',
			payload: { ...state, folderRename: !state.folderRename },
		});
	}
	function handleFileRename() {
		// console.log('file renames');
		// setFileRename(!fileRename);
		dispatch({
			type: 'toggleFileRename',
			payload: { ...state, fileRename: !state.fileRename },
		});
	}

	function handleRename() {
		if (!state.selectedItem) {
			return;
		}
		const fileInfo = localStorage.getItem(state.selectedItem?.id);
		if (!fileInfo) {
			return;
		}
		const parsedFileInfo: File | Folder = JSON.parse(fileInfo);
		if (parsedFileInfo.type == 'file') {
			handleFileRename();
			return;
		}
		handleFolderRename();
	}

	function handleDelete() {
		const files = localStorage.getItem('files');
		if (files) {
			let parsedFiles: Array<File | Folder> = JSON.parse(files);
			parsedFiles = parsedFiles.filter(
				(file: File | Folder) => file.id !== state.selectedItem?.id
			);
			dispatch({
				type: 'fileUpdate',
				payload: { ...state, files: parsedFiles },
			});
			localStorage.setItem('files', JSON.stringify(parsedFiles));
			if (state.selectedItem) {
				localStorage.removeItem(state.selectedItem?.id);
			}
			if (parsedFiles.length) updateSelectedItem(parsedFiles[0]);
			else updateSelectedItem(null);
			handlePopup();
		}
	}

	useEffect(() => {
		function handleFileDelete(event: KeyboardEvent) {
			if (!isFocused) {
				return;
			}
			event.stopPropagation();
			if (event.key == 'F2') {
				// handleFileRename();
				handleRename();
				return;
			}
			// if (event.key !== 'Backspace') {
			// 	return;
			// }
			// handlePopup();
		}
		document.addEventListener('keyup', handleFileDelete);
		return () => {
			document.removeEventListener('keyup', handleFileDelete);
		};
	}, [
		dispatch,
		state,
		handlePopup,
		isFocused,
		handleRename,
		updateSelectedItem,
	]);

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
							className="h-10 dark:invert bg-black/10 animate-pulse w-11/12 rounded-md"
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

	function handlePopup() {
		dispatch({
			type: 'togglePopup',
			payload: { ...state, isPopupOpen: !state.isPopupOpen },
		});
	}

	return (
		<div
			id="fileview"
			tabIndex={0}
			ref={fileRef}
			onFocus={() => setIsFocused(true)}
			onBlur={() => setIsFocused(false)}
			className="w-full h-full overscroll-contain outline-none overflow-y-scroll select-none"
		>
			<div className="flex flex-col gap-3 px-4 my-4">
				<button
					onClick={openFileCreate}
					className="px-4 py-2 flex items-center gap-2  cursor-pointer text-black dark:invert hover:bg-black/10 border border-black/20 rounded-sm"
				>
					<img
						src="/icons/add-file.png"
						alt="file-mode"
						className="w-4 h-4"
					/>
					New File
				</button>
				<button
					onClick={openFolderCreate}
					className="px-4 py-2 flex items-center gap-2 cursor-pointer text-black dark:invert hover:bg-black/10 border border-black/20 rounded-sm"
				>
					<img
						src="/icons/add-folder.png"
						alt="file-mode"
						className="w-4 h-4"
					/>
					New Folder
				</button>
			</div>
			<p className="uppercase tracking-widest mx-5 my-3 opacity-80 text-xs">
				Files & Folders
			</p>
			<div className="w-full dark:invert">
				<Suspense fallback={<p>Loading...</p>}>
					<RenderFolder
						updateSelectedItem={updateSelectedItem}
						files={state.files}
						isInnerFolderView={false}
					/>
					{/* {highlightPosition && (
					<div
						style={{
							top: `${highlightPosition?.top - scrollTop}px`,
							height: `${42}px`,
						}}
						className="w-full bg-black/10 pointer-events-none absolute left-0"
					/>
				)} */}
				</Suspense>
				{state.newFileCreate && !state.selectedItem && (
					<FileCreateView isInnerFolderView={false} />
				)}
				{state.newFolderCreate && !state.selectedItem && (
					<FolderCreateView isInnerFolderView={false} />
				)}
			</div>
			{state.isPopupOpen ? (
				<Modal
					onCancel={handlePopup}
					onConfirm={handleDelete}
				/>
			) : null}
		</div>
	);
}
