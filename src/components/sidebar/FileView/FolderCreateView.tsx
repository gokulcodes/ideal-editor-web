import idealContext from '@/controller/idealContext';
import { useCallback, useContext, useEffect, memo, useRef } from 'react';
import { File, Folder } from '@/types/types';
import { v4 as uuid } from 'uuid';

function FolderCreateView(props: { isInnerFolderView: boolean }) {
	const { isInnerFolderView } = props;
	const { state, dispatch } = useContext(idealContext);
	const folderCreateRef = useRef<HTMLDivElement>(null);
	const folderInputRef = useRef<HTMLInputElement>(null);
	const handleFolderCreation = useCallback(
		(value: string) => {
			if (!value || !folderInputRef.current) {
				dispatch({
					type: 'newFolderCreate',
					payload: { ...state, newFolderCreate: false },
				});
				return;
			}
			const id = uuid();
			const newFolder: Folder = {
				id: id,
				type: 'folder',
				name: value,
				childFiles: [],
			};

			let files = localStorage.getItem('files');
			if (!files) {
				files = '[]';
			}
			let parsedFiles: Array<File | Folder> = JSON.parse(files);
			if (!parsedFiles) parsedFiles = [];
			let fileInserted = false;

			function fileSearch(totalFiles: Array<File | Folder>) {
				// basic file search dfs
				for (const files of totalFiles) {
					if (files.type === 'file') {
						continue;
					}

					// folders
					if (files.id !== state.selectedItem?.id) {
						if (files.childFiles.length) {
							fileSearch(files.childFiles);
						}
						continue;
					}

					// folder with same id found
					files.childFiles = [...files.childFiles, newFolder];
					fileInserted = true;
				}
			}

			fileSearch(parsedFiles);

			if (!fileInserted) {
				parsedFiles.push(newFolder);
			}

			dispatch({
				type: 'fileUpdate',
				payload: { ...state, files: parsedFiles },
			});

			localStorage.setItem(id, JSON.stringify(newFolder));
			localStorage.setItem('files', JSON.stringify(parsedFiles));
			folderInputRef.current.value = '';
			dispatch({
				type: 'newFolderCreate',
				payload: { ...state, newFolderCreate: false },
			});
		},
		[dispatch]
	);

	const handleFolderRename = useCallback(
		(value: string) => {
			if (!value || !folderInputRef.current) {
				dispatch({
					type: 'toggleFolderRename',
					payload: { ...state, folderRename: false },
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
			folderInputRef.current.value = '';
			dispatch({
				type: 'toggleFolderRename',
				payload: { ...state, folderRename: false },
			});
		},
		[dispatch]
	);

	useEffect(() => {
		if (!folderCreateRef.current) {
			return;
		}

		function handleKey(event: KeyboardEvent) {
			if (!folderInputRef.current || state.fileRename) {
				return;
			}
			if (event.key === 'Enter') {
				const value = folderInputRef.current.value;
				handleFolderCreation(value);
				return;
			}
			if (event.key === 'Escape') {
				handleFolderCreation('');
				return;
			}
		}
		const fileCreateElement = folderCreateRef.current;
		fileCreateElement.addEventListener('keyup', handleKey);
		return () => {
			if (!fileCreateElement) return;
			fileCreateElement.removeEventListener('keyup', handleKey);
		};
	}, [handleFolderCreation, state.fileRename]);

	return (
		<div
			ref={folderCreateRef}
			className={`flex mt-2 text-black items-center gap-2 ${!isInnerFolderView ? 'pl-5' : ''}  `}
		>
			<span className="text-black">
				<img
					src="/icons/add-folder.png"
					alt="file-mode"
					className="w-5 h-5"
				/>
			</span>
			<input
				autoFocus
				ref={folderInputRef}
				type="text"
				onBlur={(event) =>
					state.folderRename
						? handleFolderRename(event.target.value)
						: handleFolderCreation(event.target.value)
				}
				className="border  bg-black/20 outline-none w-full focus-within:border-blue-400 border-black/5"
			/>
		</div>
	);
}

export default memo(FolderCreateView);
