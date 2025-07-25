import { File, Folder } from '@/types/types';
import { createContext } from 'react';

export const initialState = {
	isSidebarOpen: true,
	isSidebarAnimate: true,
	newFileCreate: false,
	newFolderCreate: false,
	selectedItem: null,
	files: null,
	isFocusMode: false,
	isReaderMode: false,
	fileRename: false,
	folderRename: false,
	isSaved: false,
	isPopupOpen: false,
	currentContent: null,
};

type idealContextType = {
	isSidebarOpen: boolean;
	isSidebarAnimate: boolean;
	newFileCreate: boolean;
	newFolderCreate: boolean;
	selectedItem: File | Folder | null;
	files: Array<File | Folder> | null;
	isFocusMode: boolean;
	isReaderMode: boolean;
	fileRename: boolean;
	folderRename: boolean;
	isSaved: boolean;
	isPopupOpen: boolean;
	currentContent: null | File;
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
		case 'updateSelectedItem':
			return {
				...state,
				selectedItem: action.payload.selectedItem,
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
		case 'toggleFileRename':
			return {
				...state,
				fileRename: action.payload.fileRename,
			};
		case 'toggleFolderRename':
			return {
				...state,
				folderRename: action.payload.folderRename,
			};
		case 'toggleSaved':
			return {
				...state,
				isSaved: action.payload.isSaved,
			};
		case 'togglePopup':
			return {
				...state,
				isPopupOpen: action.payload.isPopupOpen,
			};
		case 'setCurrentContent':
			return {
				...state,
				currentContent: action.payload.currentContent,
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
