import { File, Folder } from '@/types/types';
import { createContext } from 'react';

export const initialState = {
	isSidebarOpen: false,
	isSidebarAnimate: true,
	newFileCreate: false,
	newFolderCreate: false,
	selectedFileId: '',
	files: null,
	isFocusMode: false,
	isReaderMode: false,
};

type idealContextType = {
	isSidebarOpen: boolean;
	isSidebarAnimate: boolean;
	newFileCreate: boolean;
	newFolderCreate: boolean;
	selectedFileId: string;
	files: Array<File | Folder> | null;
	isFocusMode: boolean;
	isReaderMode: boolean;
};

export type ActionType = {
	type: string;
	payload: idealContextType;
};

export const reducer = (
	state: idealContextType,
	action: ActionType
): idealContextType => {
	switch (action.type) {
		case 'toggleSidebar':
			return { ...state, isSidebarOpen: action.payload.isSidebarOpen };
		case 'sidebarAnimate':
			return {
				...state,
				isSidebarAnimate: action.payload.isSidebarAnimate,
			};
		case 'newFileCreate':
			return { ...state, newFileCreate: action.payload.newFileCreate };
		case 'newFolderCreate':
			return {
				...state,
				newFolderCreate: action.payload.newFolderCreate,
			};
		case 'updateSelectedFileId':
			return {
				...state,
				selectedFileId: action.payload.selectedFileId,
			};
		case 'fileUpdate':
			return {
				...state,
				files: action.payload.files,
			};
		case 'toggleFocusMode':
			return {
				...state,
				isFocusMode: action.payload.isFocusMode,
			};
		case 'toggleReaderMode':
			return {
				...state,
				isReaderMode: action.payload.isReaderMode,
			};
		default:
			return state;
	}
};

interface IdealContextType {
	state: idealContextType;
	dispatch: React.Dispatch<ActionType>;
}

const idealContext = createContext<IdealContextType>({
	state: initialState,
	dispatch: () => null,
});
export default idealContext;
