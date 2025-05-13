import { ActionType, EditorStateType } from '@/controller/editorContext';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
	isCursorMoveEvent,
	isIgnorableKeys,
	isKeyboardShortcut,
} from './hooksUtils';

export default function useKeyboardControls(
	state: EditorStateType,
	isReaderMode: boolean,
	dispatch: React.Dispatch<ActionType>,
	editorRef: HTMLDivElement | null
) {
	const editor = state.editor;
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
						case 'c':
							editor.copySelection();
							break;

						case 'v':
							if (editor.selectionMode) {
								editor.executeCommand(
									async () =>
										await editor.selectionCrud('PASTE')
								);
								resolve('Success');
								return;
							}
							editor.executeCommand(
								async () => await editor.paste()
							);
							break;

						case 'x':
							if (editor.selectionMode) {
								editor.executeCommand(
									async () =>
										await editor.selectionCrud('CUT')
								);
								resolve('Success');
								return;
							}
							editor.executeCommand(() => editor.cut());
							break;

						case 'a':
							editor.updateLetterSelectionOnMouseMove(
								0,
								1000,
								0,
								100
							);
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
		[editor]
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
				dispatch({ type: 'type', payload: editor });
				return;
			}

			if (isCursorMoveEvent(event)) {
				editor.resetSelection();
				editor.moveCursor(event);
				dispatch({ type: 'type', payload: editor });
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

			dispatch({ type: 'type', payload: editor });
		},
		[dispatch, handleKeyboardShortcuts, isReaderMode, cursor, editor]
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
