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
import { File } from '@/types/types';
import FolderCreateView from './FolderCreateView';
import FileCreateView from './FileCreateView';
import { VscNewFile, VscNewFolder } from 'react-icons/vsc';

type RenderFolderType = {
	updateSelectedFile: (id: string) => void;
	selectedFileId: string;
	files: Array<File> | null;
	isInnerFolderView: boolean;
};

const RenderFolder = memo((props: RenderFolderType) => {
	const { updateSelectedFile, selectedFileId, files, isInnerFolderView } =
		props;
	const { state } = useContext(idealContext);

	const isFolderCreateViewOpen = (id: string) =>
		id === selectedFileId && state.newFolderCreate;
	// 	[selectedFileId, state.newFolderCreate]
	// );
	const isFileCreateViewOpen = (id: string) =>
		id === selectedFileId && state.newFileCreate;
	// 	[selectedFileId, state.newFileCreate]
	// );

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
			className={`flex flex-col overflow-hidden relative ${isInnerFolderView ? '-left-5 border-l border-white/10' : ''}`}
		>
			{files.map((file) => {
				if (file.type === 'folder') {
					// render folders
					return (
						<details
							className={`relative pl-3 p-2 hover:bg-white/2 border ${selectedFileId === file.id ? ' border-white/5' : ''} `}
							key={file.id}
							onClick={(event) => {
								event.stopPropagation();
								updateSelectedFile(file.id);
							}}
						>
							<summary>
								<span className="relative left-8">
									{file.name}
								</span>
							</summary>
							<div className="relative pl-8 mt-4">
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
							className={`${selectedFileId === file.id ? 'bg-white/5' : ''} relative flex gap-1 items-center text-base w-full cursor-pointer hover:bg-white/2 p-2 pl-5`}
							key={file.id}
							onClick={(event) => {
								event.stopPropagation();
								updateSelectedFile(file.id);
							}}
						>
							<CiFileOn />
							<span className="pl-2">{file.name}</span>
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

	const updateSelectedFile = useCallback(
		(id: string) => {
			dispatch({
				type: 'updateSelectedFileId',
				payload: { ...state, selectedFileId: id },
			});
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
						// <div className="h-10 w-11/12 bg-white/10 animate-pulse rounded-md" />
						// <div className="h-10 w-11/12 bg-white/10 animate-pulse rounded-md" />
						// <div className="h-10 w-11/12 bg-white/10 animate-pulse rounded-md" />
						// <div className="h-10 w-11/12 bg-white/10 animate-pulse rounded-md" />
						// <div className="h-10 w-11/12 bg-white/10 animate-pulse rounded-md" />
						// <div className="h-10 w-11/12 bg-white/10 animate-pulse rounded-md" />
						// <div className="h-10 w-11/12 bg-white/10 animate-pulse rounded-md" />
						// <div className="h-10 w-11/12 bg-white/10 animate-pulse rounded-md" />
						// <div className="h-10 w-11/12 bg-white/10 animate-pulse rounded-md" />
						// <div className="h-10 w-11/12 bg-white/10 animate-pulse rounded-md" />
						// <div className="h-10 w-11/12 bg-white/10 animate-pulse rounded-md" />
						// <div className="h-10 w-11/12 bg-white/10 animate-pulse rounded-md" />
						// <div className="h-10 w-11/12 bg-white/10 animate-pulse rounded-md" />
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
			className="w-full h-full relative overscroll-contain overflow-y-scroll select-none"
		>
			<div className="flex flex-col gap-3 px-4 my-4">
				<button
					onClick={openFileCreate}
					className="px-4 py-2 flex items-center gap-2  cursor-pointer hover:bg-white/2 border border-white/10 rounded-sm"
				>
					<VscNewFile />
					New File
				</button>
				<button
					onClick={openFolderCreate}
					className="px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-white/2 border border-white/10 rounded-sm"
				>
					<VscNewFolder />
					New Folder
				</button>
			</div>
			<p className="uppercase tracking-widest mx-5 my-3 opacity-40 text-xs">
				Files & Folders
			</p>
			<Suspense fallback={<p>Loading...</p>}>
				<RenderFolder
					selectedFileId={state.selectedFileId}
					updateSelectedFile={updateSelectedFile}
					files={state.files}
					isInnerFolderView={false}
				/>
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
