import { createContext } from 'react';

export const initialState = {
	isSidebarOpen: true,
	newFileCreate: false,
	newFolderCreate: false,
	selectedFileId: '',
};

type idealContextType = {
	isSidebarOpen: boolean;
	newFileCreate: boolean;
	newFolderCreate: boolean;
	selectedFileId: string;
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
