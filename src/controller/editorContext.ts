import Editor from '@/structure/IdealEditor';
import { createContext } from 'react';

export const editorState = {
	editor: new Editor(),
};

type PayloadType = Editor;

export type ActionType = {
	type: string;
	payload: PayloadType;
};

export interface EditorStateType {
	editor: Editor;
}

export interface ContextType {
	state: EditorStateType;
	dispatch: React.Dispatch<ActionType>;
}

export const reducer = (
	state: EditorStateType,
	action: ActionType
): EditorStateType => {
	switch (action.type) {
		case 'type':
			return { ...state, editor: action.payload };
		case 'resetEditor':
			return { ...state, editor: action.payload };
	}
	return state;
};

const editorContext = createContext<ContextType>({
	state: editorState,
	dispatch: () => null,
});

export default editorContext;
