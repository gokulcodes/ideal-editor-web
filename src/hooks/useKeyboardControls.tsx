import { ActionType, EditorStateType } from '@/controller/editorContext';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
	isCursorMoveEvent,
	isIgnorableKeys,
	isKeyboardShortcut,
} from './hooksUtils';
import idealContext from '@/controller/idealContext';
import { File } from '@/types/types';

export default function useKeyboardControls(
	editorState: EditorStateType,
	isReaderMode: boolean,
	editorDispatch: React.Dispatch<ActionType>,
	editorRef: HTMLDivElement | null
) {
	const editor = editorState.editor;
	const { state, dispatch } = useContext(idealContext);
	const cursor = editor.cursor;
	const timerId = useRef<ReturnType<typeof setTimeout>>(null);
	const [isTyping, setIsTyping] = useState(true);

	const handleKeyboardShortcuts = useCallback(
		(event: KeyboardEvent) => {
			return new Promise(async (resolve) => {
				const { key, metaKey, ctrlKey, shiftKey, altKey } = event;
				const hasMetaOrCtrl = metaKey || ctrlKey;

				if (hasMetaOrCtrl) {
					switch (key) {
						case 's':
							const content = editor.getAllContent;
							const id = state.selectedFileId;
							const file = localStorage.getItem(id);
							if (file) {
								const curr: File = JSON.parse(file);
								curr.content = content;
								localStorage.setItem(id, JSON.stringify(curr));
								dispatch({
									type: 'toggleSaved',
									payload: { ...state, isSaved: true },
								});
								setTimeout(
									() =>
										dispatch({
											type: 'toggleSaved',
											payload: {
												...state,
												isSaved: false,
											},
										}),
									5000
								);
							}
							break;
						case 'c':
							editor.copySelection();
							break;

						case 'v':
							if (editor.selectionMode) {
								await editor.executeCommand(() =>
									editor.selectionCrud('PASTE')
								);
								resolve('Success');
								return;
							}
							await editor.executeCommand(() => editor.paste());
							break;

						case 'x':
							if (editor.selectionMode) {
								await editor.executeCommand(() =>
									editor.selectionCrud('CUT')
								);
								resolve('Success');
								return;
							}
							await editor.executeCommand(() => editor.cut());
							break;

						case 'a':
							editor.selectAll();
							break;

						case 'z':
							if (event.shiftKey) editor.redo();
							else editor.undo();
							break;

						case 'Backspace':
							editor.executeCommand(() =>
								editor.deleteEntireLine()
							);
							break;

						default:
							if (isCursorMoveEvent(event)) {
								editor.resetSelection();
								editor.moveCursorFast(event);
							}
							break;
					}
				} else if (shiftKey && isCursorMoveEvent(event)) {
					// if (altKey) {
					// duplicating lines
					// 	return;
					// }
					editor.updateLetterSelection(event);
				} else if (altKey) {
					if (key === 'Backspace') {
						editor.executeCommand(() => editor.deleteWords());
					} else if (isCursorMoveEvent(event)) {
						editor.resetSelection();
						editor.handleLineSwap(event);
					}
				}

				resolve('Success');
			});
		},
		[editor, state, dispatch]
	);

	function handleTypingState() {
		if (timerId.current) {
			clearTimeout(timerId.current);
		}

		timerId.current = setTimeout(() => {
			setIsTyping(false);
		}, 500);

		setIsTyping(true);
	}

	const handleKeyDown = useCallback(
		async (event: KeyboardEvent) => {
			handleTypingState();

			event.preventDefault();

			if (isIgnorableKeys(event) || isReaderMode) {
				return;
			}

			if (isKeyboardShortcut(event)) {
				console.time('Keyboard Operations');
				await handleKeyboardShortcuts(event); // it can take some time to do the operation. so await the function
				console.timeEnd('Keyboard Operations');
				editorDispatch({ type: 'type', payload: editor });
				return;
			}

			if (isCursorMoveEvent(event)) {
				editor.resetSelection();
				editor.moveCursor(event);
				editorDispatch({ type: 'type', payload: editor });
				return;
			}

			switch (event.key) {
				case 'Tab':
					editor.executeCommand(() =>
						cursor.lineCursor.addLetter('\t')
					);
					break;
				case 'Home':
				case 'End':
					editor.resetSelection();
					editor.moveCursor(event);
					break;
				case 'Enter':
					editor.executeCommand(() => editor.insertLine());
					break;
				case 'Backspace':
					if (editor.selectionMode) {
						editor.executeCommand(
							async () => await editor.selectionCrud('DELETE')
						);
					} else {
						editor.executeCommand(() =>
							cursor.lineCursor.deleteLetters(
								cursor.letterCursor,
								cursor.letterCursor
							)
						);
					}
					break;
				default: // normal letters typing
					if (editor.selectionMode) {
						editor.executeCommand(
							async () => await editor.selectionCrud('DELETE')
						);
					}
					editor.executeCommand(() =>
						cursor.lineCursor.addLetter(event.key)
					);
					break;
			}

			editorDispatch({ type: 'type', payload: editor });
		},
		[editorDispatch, handleKeyboardShortcuts, isReaderMode, cursor, editor]
	);

	useEffect(() => {
		setIsTyping(false);
		if (!editorRef) {
			return;
		}

		editorRef.addEventListener('keydown', handleKeyDown);
		return () => {
			editorRef.removeEventListener('keydown', handleKeyDown);
		};
	}, [editorRef, handleKeyDown]);

	return {
		isTyping,
	};
}
