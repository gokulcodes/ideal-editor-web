import idealContext from '@/controller/idealContext';
import { useCallback, useContext, useEffect, memo, useRef } from 'react';
import { CiFileOn } from 'react-icons/ci';
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
			const newfile = {
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

					const existingFiles = files.childFiles
						? files.childFiles
						: [];
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
			fileInputRef.current.value = '';
			dispatch({
				type: 'newFileCreate',
				payload: { ...state, newFileCreate: false },
			});
		},
		[dispatch]
	);

	useEffect(() => {
		if (!fileCreateRef.current) {
			return;
		}

		function handleKey(event: KeyboardEvent) {
			if (!fileInputRef.current) {
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
	}, [handleFileCreation]);

	return (
		<div
			ref={fileCreateRef}
			className={`flex mt-2 items-center gap-2 ${!isInnerFolderView ? 'pl-5' : ''}  `}
		>
			<span>
				<CiFileOn />
			</span>
			<input
				autoFocus
				ref={fileInputRef}
				type="text"
				onBlur={(event) => handleFileCreation(event.target.value)}
				className="border bg-black/20 outline-none w-full focus-within:border-blue-400 border-white/5"
			/>
		</div>
	);
}

export default memo(FileCreateView);
