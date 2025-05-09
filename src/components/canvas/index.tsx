import EditorView from '@/components/EditorView';
import EditorContext, {
	editorState,
	reducer,
} from '../../controller/editorContext';
import { useReducer } from 'react';
import Header from './Header';

export default function Canvas() {
	const [state, dispatch] = useReducer(reducer, editorState);

	return (
		<div className="flex flex-col items-center justify-center w-full">
			<Header />
			<EditorContext.Provider value={{ state, dispatch }}>
				<EditorView />
			</EditorContext.Provider>
		</div>
	);
}
