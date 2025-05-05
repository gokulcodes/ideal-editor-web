import { ActionType, EditorStateType } from '@/controller/editorContext';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
	isCursorMoveEvent,
	isIgnorableKeys,
	isKeyboardShortcut,
} from './hooksUtils';

export default function useKeyboardControls(
	state: EditorStateType,
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
				if (event.metaKey || event.ctrlKey) {
					if (event.key == 'c') {
						editor.copySelection();
					} else if (event.key == 'v') {
						// paste content from clipboard
						if (editor.selectionMode) {
							await editor.pasteOnSelection();
							resolve('Success');
							return;
						}

						editor.paste();
					} else if (event.key == 'x') {
						if (editor.selectionMode) {
							editor.cutSelection();
							resolve('Success');
							return;
						}

						editor.cut();
					} else if (isCursorMoveEvent(event)) {
						// cursor shift to editor home / editor end
						editor.resetSelection();
						editor.moveCursor(
							event,
							event.altKey,
							event.metaKey || event.ctrlKey
						);
					} else if (event.key === 'a') {
						editor.updateLetterSelectionOnMouseMove(
							0,
							1000,
							0,
							100,
							'UP'
						);
					} else if (event.key === 'z') {
						editor.undo();
					} else if (event.key === 'Backspace') {
						// delete the entire line content and move the cursor to beginning
						const line = editor.cursor.lineCursor;
						line.lineHead.nextLetter = line.lineTail.nextLetter;
						line.lineTail.prevLetter = line.lineHead;
						line.lineTail = line.lineHead;
						editor.cursor.letterCursor = line.lineHead;
					}
				} else if (event.shiftKey && isCursorMoveEvent(event)) {
					editor.updateLetterSelection(event);
				} else if (event.altKey) {
					if (event.key === 'Backspace') {
						// delete letters between white space
						editor.deleteWords();
					} else if (isCursorMoveEvent(event)) {
						// to handle line shift
						editor.resetSelection();
						editor.moveCursor(
							event,
							event.altKey,
							event.metaKey || event.ctrlKey
						);
					}
				}
				resolve('Success');
			});
		},
		[editor]
	);

	const handleKeyDown = useCallback(
		async (event: KeyboardEvent) => {
			if (timerId.current) {
				clearTimeout(timerId.current);
			}

			timerId.current = setTimeout(() => {
				setIsTyping(false);
			}, 500);

			event.preventDefault();
			if (isIgnorableKeys(event)) {
				return;
			}

			setIsTyping(true);

			if (event.key === 'Tab') {
				cursor.lineCursor.addLetter(cursor, '\t');
			} else if (isKeyboardShortcut(event)) {
				console.time('Keyboard Operations');
				await handleKeyboardShortcuts(event); // it can take some time to do the operation. so await the function
				console.timeEnd('Keyboard Operations');
			} else if (
				isCursorMoveEvent(event) ||
				event.key === 'Home' ||
				event.key === 'End'
			) {
				editor.resetSelection();
				editor.moveCursor(event);
			} else if (event.key === 'Enter') {
				editor.insertLine();
			} else if (event.key === 'Backspace') {
				if (editor.selectionMode) {
					editor.executeCommand(() => editor.deleteSelection());
				} else {
					editor.executeCommand(() =>
						cursor.lineCursor.deleteLetters(
							cursor.letterCursor,
							cursor.letterCursor
						)
					);
				}
			} else {
				if (editor.selectionMode) {
					editor.deleteSelection();
				}

				editor.executeCommand(() =>
					cursor.lineCursor.addLetter(cursor, event.key)
				);
			}

			dispatch({ type: 'type', payload: editor });

			// setTimeout(() => {
			// 	const activeCursor = document.getElementById('activeCursor');
			// 	const geometry = activeCursor?.getBoundingClientRect();
			// 	setGeometry(geometry);
			// }, 0);
		},
		[dispatch, handleKeyboardShortcuts, cursor, editor]
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
