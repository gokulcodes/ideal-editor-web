import editorContext from '@/controller/editorContext';
import idealContext from '@/controller/idealContext';
import { useContext, useEffect } from 'react';
import { File } from '../types/types';

export default function useDocumentSaver() {
	const { state, dispatch } = useContext(idealContext);
	const {
		state: { editor },
	} = useContext(editorContext);
	function save() {
		if (state.isSaved) {
			return;
		}
		const content = editor.getAllContent;
		const id = state.selectedItem?.id;
		if (!id) {
			return;
		}
		const file = localStorage.getItem(id);
		if (file) {
			const curr: File = JSON.parse(file);
			curr.content = content;
			localStorage.setItem(id, JSON.stringify(curr));
			dispatch({
				type: 'toggleSaved',
				payload: { ...state, isSaved: true },
			});
			// setIsSaved(true);
			setTimeout(
				() =>
					dispatch({
						type: 'toggleSaved',
						payload: { ...state, isSaved: false },
					}),
				5000
			);
		}
	}
	useEffect(() => {
		setInterval(() => {
			save();
		}, 60 * 1000);
	}, []);
}
