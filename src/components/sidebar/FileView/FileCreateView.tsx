import idealContext from '@/controller/idealContext';
import { File, Folder } from '@/types/types';
import { useCallback, useContext, useEffect, memo, useRef } from 'react';
import { v4 as uuid } from 'uuid';

function FileCreateView(props: { isInnerFolderView: boolean }) {
	const { isInnerFolderView } = props;
	const { state, dispatch } = useContext(idealContext);
	const fileCreateRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const handleFileCreation = useCallback(
		(value: string) => {
			if (!value || !fileInputRef.current) {
				dispatch({
					type: 'newFileCreate',
					payload: { ...state, newFileCreate: false },
				});
				return;
			}
			const id = uuid();
			const newfile: File = {
				id: id,
				type: 'file',
				name: value,
				content: '',
			};

			localStorage.setItem(id, JSON.stringify(newfile));

			let files = localStorage.getItem('files');
			if (!files) {
				files = '[]';
			}
			let parsedFiles: Array<File | Folder> = JSON.parse(files);
			if (!parsedFiles) parsedFiles = [];
			let fileInserted = false;

			function fileSearch(totalFiles: Array<File | Folder>) {
				for (const files of totalFiles) {
					if (files.type === 'file') {
						continue;
					}

					if (files.id !== state.selectedItem?.id) {
						if (files.childFiles.length) {
							fileSearch(files.childFiles);
						}
						continue;
					}

					// folder with same id found
					files.childFiles = [...files.childFiles, newfile];
					fileInserted = true;
				}
			}

			fileSearch(parsedFiles);
			if (!fileInserted) {
				parsedFiles.push(newfile);
			}

			dispatch({
				type: 'fileUpdate',
				payload: { ...state, files: parsedFiles },
			});
			localStorage.setItem('files', JSON.stringify(parsedFiles));
			fileInputRef.current.value = '';
			dispatch({
				type: 'newFileCreate',
				payload: { ...state, newFileCreate: false },
			});
		},
		[dispatch]
	);

	const handleFileRename = useCallback(
		(value: string) => {
			if (!value || !fileInputRef.current) {
				dispatch({
					type: 'toggleFileRename',
					payload: { ...state, fileRename: false },
				});
				return;
			}
			// const id = uuid();
			// const newfile: File = {
			// 	id: id,
			// 	type: 'file',
			// 	name: value,
			// 	content: '',
			// };

			// localStorage.setItem(id, JSON.stringify(newfile));

			let files = localStorage.getItem('files');
			if (!files) {
				files = '[]';
			}
			let parsedFiles: Array<File | Folder> = JSON.parse(files);
			if (!parsedFiles) parsedFiles = [];
			// let fileInserted = false;

			function fileSearch(totalFiles: Array<File | Folder>) {
				for (const files of totalFiles) {
					// if (files.type === 'file') {
					// 	continue;
					// }
					if (files.id === state.selectedItem?.id) {
						const fileInfo = localStorage.getItem(
							state.selectedItem?.id
						);
						if (fileInfo) {
							const parsedFileInfo: File = JSON.parse(fileInfo);
							if (parsedFileInfo) parsedFileInfo.name = value;
							console.log(parsedFileInfo);
							localStorage.setItem(
								state.selectedItem?.id,
								JSON.stringify(parsedFileInfo)
							);
						}
						files.name = value;
					}

					if (
						files.type === 'folder' &&
						files.id !== state.selectedItem?.id
					) {
						if (files.childFiles.length) {
							fileSearch(files.childFiles);
						}
					}

					// folder with same id found
					// files.childFiles = [...files.childFiles, newfile];
					// fileInserted = true;
				}
			}

			fileSearch(parsedFiles);
			// if (!fileInserted) {
			// 	parsedFiles.push(newfile);
			// }

			dispatch({
				type: 'fileUpdate',
				payload: { ...state, files: parsedFiles },
			});
			localStorage.setItem('files', JSON.stringify(parsedFiles));
			fileInputRef.current.value = '';
			dispatch({
				type: 'toggleFileRename',
				payload: { ...state, fileRename: false },
			});
		},
		[dispatch]
	);

	useEffect(() => {
		if (!fileCreateRef.current) {
			return;
		}

		function handleKey(event: KeyboardEvent) {
			if (!fileInputRef.current || state.fileRename) {
				return;
			}
			if (event.key === 'Enter') {
				const value = fileInputRef.current.value;
				handleFileCreation(value);
				return;
			}
			if (event.key === 'Escape') {
				handleFileCreation('');
				return;
			}
		}
		const fileCreateElement = fileCreateRef.current;
		fileCreateElement.addEventListener('keyup', handleKey);
		return () => {
			if (!fileCreateElement) return;
			fileCreateElement.removeEventListener('keyup', handleKey);
		};
	}, [handleFileCreation, state.fileRename]);

	return (
		<div
			ref={fileCreateRef}
			className={`flex mt-2 items-center gap-2 ${!isInnerFolderView ? 'pl-5' : ''}  `}
		>
			<span>
				<img
					src="/icons/add-file.png"
					alt="file-mode"
					className="w-4 h-4"
				/>
				{/* <CiFileOn /> */}
			</span>
			<input
				autoFocus
				ref={fileInputRef}
				type="text"
				onBlur={(event) =>
					state.fileRename
						? handleFileRename(event.target.value)
						: handleFileCreation(event.target.value)
				}
				className="border bg-black/20 outline-none w-full focus-within:border-blue-400 border-white/5"
			/>
		</div>
	);
}

export default memo(FileCreateView);
