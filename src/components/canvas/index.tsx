'use client';
import EditorView from '@/components/EditorView';
import EditorContext, {
	editorState,
	reducer,
} from '../../controller/editorContext';
import { useReducer } from 'react';
import Header from './Header';
import EditorStats from './EditorStats';

export default function Canvas() {
	const [state, dispatch] = useReducer(reducer, editorState);

	return (
		<main className="flex flex-col items-center justify-center w-full">
			<EditorContext.Provider value={{ state, dispatch }}>
				<Header />
				<EditorView />
				<EditorStats />
			</EditorContext.Provider>
		</main>
	);
}
