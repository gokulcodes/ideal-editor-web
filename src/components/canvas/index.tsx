import EditorView from '@/components/EditorView';
import EditorContext, {
	editorState,
	reducer,
} from '../../controller/editorContext';
import { useReducer } from 'react';
import CanvasOptions from './CanvasOptions';
// import idealContext from '@/controller/idealContext';

export default function Canvas() {
	const [state, dispatch] = useReducer(reducer, editorState);

	return (
		<div
			tabIndex={0}
			className="flex flex-col w-full items-center "
		>
			<EditorContext.Provider value={{ state, dispatch }}>
				<EditorView />
			</EditorContext.Provider>
			<CanvasOptions />
		</div>
	);
}
