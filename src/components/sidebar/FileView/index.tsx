import idealContext from '@/controller/idealContext';
import { FocusEvent, useContext, useEffect, useRef } from 'react';
import { CiFileOn, CiFolderOn } from 'react-icons/ci';
import { v4 as uuid } from 'uuid';

export type fileType = {
	id: string;
	name: string;
	type: 'folder' | 'file';
	content: string;
	childFiles: Array<fileType>;
};

function RenderFolder({
	updateSelectedFile,
	selectedFileId,
	files,
	isInnerFolderView,
}: {
	updateSelectedFile: (id: string) => void;
	selectedFileId: string;
	files: Array<fileType>;
	isInnerFolderView: boolean;
}) {
	const { state, dispatch } = useContext(idealContext);
	if (!files) {
		return null;
	}

	function handleFileCreation(event: FocusEvent<HTMLInputElement>) {
		if (!event.target || !event.target.value) {
			dispatch({
				type: 'newFileCreate',
				payload: { ...state, newFileCreate: false },
			});
			return;
		}
		const id = uuid();
		const newfile = {
			id: id,
			type: 'file',
			name: event.target.value,
			content: '',
		};

		localStorage.setItem(id, JSON.stringify(newfile));

		let files = localStorage.getItem('files');
		if (!files) {
			files = '[]';
		}
		let parsedFiles = JSON.parse(files);
		if (!parsedFiles) parsedFiles = [];

		if (state.selectedFileId) {
			const updatedFiles = [];
			let fileInserted = false;
			for (const files of parsedFiles) {
				if (files.type === 'file') {
					updatedFiles.push(files);
					continue;
				}

				if (files.id !== state.selectedFileId) {
					updatedFiles.push(files);
					continue;
				}

				const existingFiles = files.childFiles ? files.childFiles : [];
				existingFiles.push(newfile);
				fileInserted = true;
				updatedFiles.push({ ...files, childFiles: existingFiles });
			}
			if (!fileInserted) updatedFiles.push(newfile);
			parsedFiles = updatedFiles;
		} else {
			parsedFiles.push(newfile);
		}

		dispatch({
			type: 'fileUpdate',
			payload: { ...state, files: parsedFiles },
		});
		localStorage.setItem('files', JSON.stringify(parsedFiles));
		event.target.value = '';
		dispatch({
			type: 'newFileCreate',
			payload: { ...state, newFileCreate: false },
		});
	}

	function handleFolderCreation(event: FocusEvent<HTMLInputElement>) {
		if (!event.target || !event.target.value) {
			dispatch({
				type: 'newFolderCreate',
				payload: { ...state, newFolderCreate: false },
			});
			return;
		}

		const newFolder = {
			id: uuid(),
			type: 'folder',
			name: event.target.value,
			childFiles: [],
		};

		let files = localStorage.getItem('files');
		if (!files) {
			files = '[]';
		}
		let parsedFiles = JSON.parse(files);
		if (!parsedFiles) parsedFiles = [];
		if (state.selectedFileId) {
			const updatedFiles = [];
			let fileInserted = false;
			for (const files of parsedFiles) {
				if (files.type === 'file') {
					updatedFiles.push(files);
					continue;
				}

				if (files.id !== state.selectedFileId) {
					updatedFiles.push(files);
					continue;
				}

				const existingFiles = files.childFiles ? files.childFiles : [];
				existingFiles.push(newFolder);
				fileInserted = true;
				updatedFiles.push({ ...files, childFiles: existingFiles });
			}
			if (!fileInserted) updatedFiles.push(newFolder);
			parsedFiles = updatedFiles;
		} else {
			parsedFiles.push(newFolder);
		}
		dispatch({
			type: 'fileUpdate',
			payload: { ...state, files: parsedFiles },
		});
		localStorage.setItem('files', JSON.stringify(parsedFiles));
		event.target.value = '';
		dispatch({
			type: 'newFolderCreate',
			payload: { ...state, newFolderCreate: false },
		});
	}

	function FileCreate() {
		return (
			<div
				className={`flex mt-2 items-center gap-2 ${!isInnerFolderView ? 'pl-5' : ''}  `}
			>
				<span>
					<CiFileOn />
				</span>
				<input
					autoFocus
					type="text"
					onBlur={handleFileCreation}
					className="border bg-black/20 outline-none w-full focus-within:border-blue-400 border-white/5"
				/>
			</div>
		);
	}

	function FolderCreate() {
		return (
			<div
				className={`flex mt-2 items-center gap-2 ${!isInnerFolderView ? 'pl-5' : ''}  `}
			>
				<span>
					<CiFolderOn />
				</span>
				<input
					autoFocus
					type="text"
					onBlur={handleFolderCreation}
					className="border bg-black/20 outline-none w-full focus-within:border-blue-400 border-white/5"
				/>
			</div>
		);
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
								{RenderFolder({
									updateSelectedFile,
									selectedFileId,
									files: file.childFiles,
									isInnerFolderView: true,
								})}
								{file.id === selectedFileId &&
									state.newFolderCreate &&
									FolderCreate()}
								{file.id === selectedFileId &&
									state.newFileCreate &&
									FileCreate()}
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
						{file.id === selectedFileId &&
							state.newFolderCreate &&
							FolderCreate()}
						{file.id === selectedFileId &&
							state.newFileCreate &&
							FileCreate()}
					</>
				);
			})}
		</div>
	);
}

export default function FileView() {
	const { state, dispatch } = useContext(idealContext);
	const fileRef = useRef<HTMLDivElement>(null);
	// const [topPx, setTop] = useState(0);
	useEffect(() => {
		const files = localStorage.getItem('files');
		if (files) {
			const parsedFiles = JSON.parse(files);
			dispatch({
				type: 'fileUpdate',
				payload: { ...state, files: parsedFiles },
			});
		}
	}, [dispatch]);

	function updateSelectedFile(id: string) {
		dispatch({
			type: 'updateSelectedFileId',
			payload: { ...state, selectedFileId: id },
		});
	}

	useEffect(() => {
		if (!fileRef.current) {
			return;
		}
		// fileRef.current.addEventListener('mousemove', (event) => {
		// 	const clientY = event.clientY;
		// 	const top = clientY / 40;
		// 	console.log(top * 40);
		// 	setTop(top * 40);
		// });
	}, []);

	return (
		<div
			id="fileview"
			ref={fileRef}
			className="w-full h-[83vh] relative overscroll-contain overflow-y-scroll select-none"
		>
			<RenderFolder
				selectedFileId={state.selectedFileId}
				updateSelectedFile={updateSelectedFile}
				files={state.files}
				isInnerFolderView={false}
			/>
			{/* <div
				style={{ top: `${topPx}px` }}
				className="absolute left-0 w-full h-10 -z-10 bg-white/2"
			/> */}
		</div>
	);
}
