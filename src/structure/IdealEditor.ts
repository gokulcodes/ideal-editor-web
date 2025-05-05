import { ReactNode } from 'react';
import Line from './Line';
import Letter from './Letter';
import { isLineBreak, isSpecialCharacter } from './editorUtils';

/**
 * Cursor class holds the line and letter position where the cursor blinker should be shown
 */
export class Cursor {
	lineCursor: Line;
	letterCursor: Letter;
	lineNo: number;
	letterNo: number;
	observers: [];
	constructor(linePosition: Line, letterPosition: Letter) {
		this.lineCursor = linePosition;
		this.letterCursor = letterPosition;
		this.lineNo = 0;
		this.letterNo = 0;
		this.observers = [];
	}

	set setLineCursor(nextLineUpdate: Line) {
		// it will act like a middleware. whenever any update happens to line cursor, render the ui
		this.lineCursor = nextLineUpdate;
		setTimeout(() => {
			document.dispatchEvent(new CustomEvent('oncursormove'));
		}, 0);
		// observers.map(() => function())
	}

	set setLetterCursor(nextLetterUpdate: Letter) {
		this.letterCursor = nextLetterUpdate;
		setTimeout(() => {
			document.dispatchEvent(new CustomEvent('oncursormove'));
		}, 0);
	}

	set setCursor(cursorPosition: { line: Line; letter: Letter }) {
		this.lineCursor = cursorPosition.line;
		this.letterCursor = cursorPosition.letter;
		// console.log('moved');
		setTimeout(() => {
			document.dispatchEvent(new CustomEvent('oncursormove'));
		}, 0);
	}
}

class Editor {
	editorHead: Line;
	editorTail: Line;
	cursor: Cursor;
	selectionMode: boolean;
	// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
	prevCommands: Function[];
	constructor() {
		this.editorHead = new Line(this); // sential line node
		this.editorTail = this.editorHead;
		this.cursor = new Cursor(this.editorHead, this.editorHead.lineHead);
		this.selectionMode = false;
		this.prevCommands = [];
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
	executeCommand(command: Function) {
		if (this.prevCommands.length > 20) this.prevCommands.shift();
		const undoOperation = command();
		this.prevCommands.push(undoOperation);
	}

	undo() {
		if (!this.prevCommands.length) {
			return;
		}
		const lastCommand = this.prevCommands.pop();
		if (lastCommand) {
			lastCommand();
		}
	}

	redo() {}

	insertLine() {
		const newLine = new Line(this);

		// Linked new line next to current cursor line
		const currLine = this.cursor.lineCursor;
		const nextToCurrLine = currLine.nextLine;
		currLine.nextLine = newLine;
		newLine.prevLine = currLine;
		newLine.nextLine = nextToCurrLine;
		if (nextToCurrLine) nextToCurrLine.prevLine = newLine;

		// Handle new line insertion when cursor in any position of the line
		// Letters available next to cursion position is to be moved to newline
		const currLetterPosition = this.cursor.letterCursor;
		const nextAvailableLetter = currLetterPosition.nextLetter;
		newLine.lineHead.nextLetter = nextAvailableLetter;
		let tailNode = newLine.lineHead;
		while (tailNode && tailNode.nextLetter) {
			tailNode = tailNode.nextLetter;
		}
		newLine.lineTail = tailNode;
		currLine.lineTail = this.cursor.letterCursor;
		if (nextAvailableLetter) {
			// Link nextAvailableLetter to new line's head
			// if not, just create a new line
			nextAvailableLetter.prevLetter = newLine.lineHead;
		}
		currLetterPosition.nextLetter = null;
		this.cursor.setCursor = { line: newLine, letter: newLine.lineHead };
		// this.cursor.letterCursor = ;
		if (!this.cursor.lineCursor.nextLine) {
			// Updating editorTail node once we insert a new line
			this.editorTail = this.cursor.lineCursor;
		}
	}

	deleteLines(start: Line, end: Line) {
		const prev = start.prevLine;
		const next = end.nextLine;
		let copyLineContent = '',
			temp: Line | null = start;
		while (temp && temp != next) {
			let letterTemp: Letter | null = temp.lineHead,
				txt = '';
			while (letterTemp) {
				txt += letterTemp.text;
				letterTemp = letterTemp.nextLetter;
			}
			copyLineContent += txt + '\n';
			temp = temp.nextLine;
		}
		if (prev == null) {
			start.nextLine = next;
			if (!next) {
				this.editorHead = new Line(this); // sential line node
				this.editorTail = this.editorHead;
				this.cursor = new Cursor(
					this.editorHead,
					this.editorHead.lineHead
				);
				return () => {
					for (const letter of copyLineContent) {
						if (isLineBreak(letter)) {
							this.insertLine();
							continue;
						}
						this.cursor.lineCursor.addLetter(this.cursor, letter);
					}
				};
			}
			next.prevLine = null;
			this.editorHead = next;
			this.moveCursor(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
			return () => {
				for (const letter of copyLineContent) {
					if (isLineBreak(letter)) {
						this.insertLine();
						continue;
					}
					this.cursor.lineCursor.addLetter(this.cursor, letter);
				}
			};
		}

		if (next == null) {
			this.moveCursor(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
			prev.nextLine = null;
			this.editorTail = prev;
			return () => {
				for (const letter of copyLineContent) {
					if (isLineBreak(letter)) {
						this.insertLine();
						continue;
					}
					this.cursor.lineCursor.addLetter(this.cursor, letter);
				}
			};
		}

		this.moveCursor(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
		prev.nextLine = next;
		next.prevLine = prev;
		return () => {
			console.log(copyLineContent);
			for (const letter of copyLineContent) {
				if (isLineBreak(letter)) {
					this.insertLine();
					continue;
				}
				this.cursor.lineCursor.addLetter(this.cursor, letter);
			}
		};
	}

	getCursorPosition() {
		let nthPosition = 0;
		let temp: Letter | null = this.cursor.lineCursor.lineHead;
		while (temp && temp !== this.cursor.letterCursor) {
			temp = temp.nextLetter;
			nthPosition++;
		}
		return nthPosition;
	}

	getRemainingLettersCntInLine() {
		let nthPosition = 1;
		let temp: Letter | null = this.cursor.lineCursor.lineTail;
		while (temp && temp !== this.cursor.letterCursor) {
			temp = temp.prevLetter;
			nthPosition++;
		}
		return nthPosition;
	}

	moveCursorToNthLine(lineNo: number, textNo: number) {
		let linePtr = this.editorHead;
		while (lineNo--) {
			if (linePtr.nextLine) linePtr = linePtr.nextLine;
			else break;
		}
		this.cursor.setLineCursor = linePtr;
		let letterPtr = this.cursor.lineCursor.lineHead;
		while (textNo--) {
			if (letterPtr.nextLetter) letterPtr = letterPtr.nextLetter;
			else break;
		}
		this.cursor.setLetterCursor = letterPtr;
	}

	updateLetterSelectionOnMouseMove(
		startLine: number,
		endLine: number,
		startPosition: number,
		endPosition: number,
		dir: string
	) {
		startPosition -= 1;
		endPosition -= 1;
		// console.log(
		// 	'Line: ',
		// 	startLine,
		// 	endLine,
		// 	'Text Pos: ',
		// 	startPosition,
		// 	endPosition
		// );
		// const nextLine = this.cursor.lineCursor.nextLine;
		// let isNextline = false;
		// if (
		// 	nextLine &&
		// 	(nextLine.lineHead.isSelected ||
		// 		nextLine.lineHead.nextLetter?.isSelected)
		// ) {
		// 	isNextline = true;
		// }
		// console.log(dir);
		if (dir === 'UP') {
			// [startLine, endLine] = [startLine, endLine];
			// [startPosition, endPosition] = [endPosition, startPosition];
			// console.log('Line: ', startLine, endLine);
			// console.log('Text: ', startPosition, endPosition);
			let linePtr: Line | null = this.editorHead,
				lineCnt = 0;
			while (linePtr) {
				this.selectionMode = true;
				let head: Letter | null = linePtr.lineHead,
					letterCnt = 0;
				while (head) {
					if (startLine === endLine) {
						if (
							lineCnt == startLine &&
							letterCnt >= startPosition &&
							letterCnt <= endPosition
						) {
							head.isSelected = true;
						}
					} else if (lineCnt > startLine && lineCnt < endLine) {
						head.isSelected = true;
					} else if (
						lineCnt == startLine &&
						letterCnt >= startPosition
					) {
						head.isSelected = true;
					} else if (lineCnt == endLine && letterCnt <= endPosition) {
						head.isSelected = true;
					}
					head = head.nextLetter;
					letterCnt++;
				}
				lineCnt++;
				if (linePtr) linePtr = linePtr.nextLine; // this is a problem
			}
			return;
		}
		let linePtr: Line | null = this.editorHead,
			lineCnt = 0;
		while (linePtr) {
			this.selectionMode = true;
			let head = linePtr.lineHead.nextLetter,
				letterCnt = 0;
			// [startLine, endLine] = [startLine, endLine];
			// [startPosition, endPosition] = [endPosition, startPosition];
			while (head) {
				if (startLine === endLine) {
					// console.log(letterCnt, startPosition, endPosition);
					if (
						lineCnt == startLine &&
						letterCnt >= startPosition &&
						letterCnt <= endPosition
					) {
						head.isSelected = true;
					}
				} else if (lineCnt > startLine && lineCnt < endLine) {
					head.isSelected = true;
				} else if (lineCnt == startLine && letterCnt >= startPosition) {
					head.isSelected = true;
				} else if (lineCnt == endLine && letterCnt <= endPosition) {
					head.isSelected = true;
				}
				head = head.nextLetter;
				letterCnt++;
			}
			lineCnt++;
			if (linePtr) linePtr = linePtr.nextLine; // this is a problem
		}
	}

	moveCursor(
		keyEvent: KeyboardEvent,
		isAltKey: boolean = false,
		isMetaKey: boolean = false
	) {
		switch (keyEvent.key) {
			case 'ArrowUp':
				if (isAltKey) {
					// handle line swaps
					const currLine = this.cursor.lineCursor;
					const prevLine = currLine.prevLine;
					const prevPrevLine = prevLine?.prevLine;
					const nextLine = currLine.nextLine;
					if (!prevLine) {
						return;
					}
					if (!prevPrevLine) {
						currLine.prevLine = null;
						currLine.nextLine = prevLine;
						prevLine.prevLine = currLine;
						prevLine.nextLine = nextLine;
						if (nextLine) nextLine.prevLine = prevLine;
						this.editorHead = currLine;
						return;
					}
					if (!nextLine) {
						prevLine.nextLine = null;
						prevPrevLine.nextLine = currLine;
						currLine.prevLine = prevPrevLine;
						currLine.nextLine = prevLine;
						prevLine.prevLine = currLine;
						this.editorTail = currLine;
						return;
					}
					prevPrevLine.nextLine = currLine;
					currLine.prevLine = prevPrevLine;
					currLine.nextLine = prevLine;
					prevLine.prevLine = currLine;
					prevLine.nextLine = nextLine;
					nextLine.prevLine = prevLine;
					this.moveCursor(
						new KeyboardEvent('keydown', { key: 'ArrowDown' })
					);
				}
				if (isMetaKey) {
					this.cursor.setCursor = {
						line: this.editorHead,
						letter: this.editorHead.lineHead,
					};
					return;
				}
				if (!this.cursor.lineCursor.prevLine) {
					// if there is no prevLine, don't do anything
					return;
				}
				let nextPos = this.getCursorPosition();
				this.cursor.setLineCursor = this.cursor.lineCursor.prevLine;
				let temp: Letter | null = this.cursor.lineCursor.lineHead;
				while (temp && nextPos--) {
					temp = temp.nextLetter;
				}
				if (!temp) temp = this.cursor.lineCursor.lineTail;
				this.cursor.setLetterCursor = temp;
				break;
			case 'ArrowDown':
				if (isAltKey) {
					// handle line swaps
					const currLine = this.cursor.lineCursor;
					const prevLine = currLine.prevLine;
					const nextLine = currLine.nextLine;
					const nextNextLine = nextLine?.nextLine;
					if (!nextLine) {
						return;
					}
					if (!nextNextLine) {
						if (prevLine) prevLine.nextLine = nextLine;
						nextLine.prevLine = prevLine;
						nextLine.nextLine = currLine;
						currLine.prevLine = nextLine;
						currLine.nextLine = null;
						this.editorTail = currLine;
						return;
					}
					if (!prevLine) {
						nextLine.prevLine = null;
						nextLine.nextLine = currLine;
						currLine.prevLine = nextLine;
						currLine.nextLine = nextNextLine;
						nextNextLine.prevLine = currLine;
						this.editorHead = nextLine;
						return;
					}
					nextNextLine.prevLine = currLine;
					currLine.nextLine = nextNextLine;
					currLine.prevLine = nextLine;
					nextLine.nextLine = currLine;
					prevLine.nextLine = nextLine;
					nextLine.prevLine = prevLine;
					this.moveCursor(
						new KeyboardEvent('keydown', { key: 'ArrowUp' })
					);
				}
				if (isMetaKey) {
					// this.cursor.lineCursor = this.editorTail;
					// this.cursor.letterCursor = this.cursor.lineCursor.lineHead;
					this.cursor.setCursor = {
						line: this.editorTail,
						letter: this.editorTail.lineHead,
					};
					return;
				}
				if (!this.cursor.lineCursor.nextLine) {
					// if there is no nextLine, don't do anything
					return;
				}
				let prevPos = this.getCursorPosition();
				this.cursor.setLineCursor = this.cursor.lineCursor.nextLine;
				let temp1: Letter | null = this.cursor.lineCursor.lineHead;
				while (temp1 && prevPos--) {
					temp1 = temp1.nextLetter;
				}
				if (!temp1) temp1 = this.cursor.lineCursor.lineTail;
				this.cursor.setLetterCursor = temp1;
				break;
			case 'ArrowLeft':
				if (isAltKey) {
					// find leftmost whitespace / special character and move the cursor to that point
					let leftWhiteSpace = this.cursor.letterCursor.prevLetter;
					if (!leftWhiteSpace) {
						this.moveCursor(
							new KeyboardEvent('keydown', { key: 'ArrowUp' })
						);
						this.cursor.setLetterCursor =
							this.cursor.lineCursor.lineTail;
						return;
					}
					while (leftWhiteSpace) {
						if (leftWhiteSpace.text === ' ') {
							break;
						}
						leftWhiteSpace = leftWhiteSpace.prevLetter;
					}
					// console.log(leftWhiteSpace)
					if (!leftWhiteSpace) {
						this.cursor.setLetterCursor =
							this.cursor.lineCursor.lineHead;
					} else {
						this.cursor.setLetterCursor = leftWhiteSpace;
					}
					return;
				}
				if (isMetaKey) {
					if (keyEvent.shiftKey) {
						this.selectionMode = true;
						let temp: Letter | null = this.cursor.letterCursor;
						while (temp) {
							temp.isSelected = true;
							if (temp) temp = temp.prevLetter;
						}
					}
					this.cursor.setLetterCursor =
						this.cursor.lineCursor.lineHead;
					return;
				}
				if (!this.cursor.letterCursor.prevLetter) {
					// if there is no previous letter, don't do anything
					if (this.cursor.lineCursor.prevLine) {
						this.cursor.setLineCursor =
							this.cursor.lineCursor.prevLine;
						this.cursor.setLetterCursor =
							this.cursor.lineCursor.lineTail;
					}
					return;
				}
				this.cursor.setLetterCursor =
					this.cursor.letterCursor.prevLetter;
				break;
			case 'ArrowRight':
				if (isAltKey) {
					// find rightmost whitespace / special character and move the cursor to that point
					let rightWhiteSpace = this.cursor.letterCursor.nextLetter;
					if (!rightWhiteSpace) {
						this.moveCursor(
							new KeyboardEvent('keydown', { key: 'ArrowDown' })
						);
						this.cursor.setLetterCursor =
							this.cursor.lineCursor.lineHead;
						return;
					}
					while (rightWhiteSpace) {
						if (rightWhiteSpace.text === ' ') {
							break;
						}
						rightWhiteSpace = rightWhiteSpace.nextLetter;
					}
					if (!rightWhiteSpace) {
						this.cursor.setLetterCursor =
							this.cursor.lineCursor.lineTail;
					} else {
						this.cursor.setLetterCursor = rightWhiteSpace;
					}
					return;
				}
				if (isMetaKey) {
					if (keyEvent.shiftKey) {
						this.selectionMode = true;
						let temp: Letter | null = this.cursor.letterCursor;
						while (temp) {
							temp.isSelected = true;
							if (temp) temp = temp.nextLetter;
						}
					}
					this.cursor.setLetterCursor =
						this.cursor.lineCursor.lineTail;
					return;
				}
				if (!this.cursor.letterCursor.nextLetter) {
					// if there is no next letter, don't do anything
					if (this.cursor.lineCursor.nextLine) {
						this.cursor.setCursor = {
							line: this.cursor.lineCursor.nextLine,
							letter: this.cursor.lineCursor.lineHead,
						};
					}
					return;
				}
				this.cursor.setLetterCursor =
					this.cursor.letterCursor.nextLetter;
				break;
			case 'Home':
				this.cursor.setLetterCursor = this.cursor.lineCursor.lineHead;
				break;
			case 'End':
				this.cursor.setLetterCursor = this.cursor.lineCursor.lineTail;
				break;
			default:
				console.log('No action to be performed');
		}
	}

	updateLetterSelection(keyEvent: KeyboardEvent) {
		console.log(keyEvent.key);
		switch (keyEvent.key) {
			case 'ArrowUp':
				this.selectionMode = true;
				let nextPos = this.getCursorPosition() + 1;
				if (!this.cursor.lineCursor.prevLine) {
					// if there is no prevLine, don't do anything
					let temp: Letter | null = this.cursor.lineCursor.lineHead;
					while (temp && nextPos--) {
						temp.isSelected = !temp.isSelected;
						temp = temp.nextLetter;
					}
					return;
				}

				// this.cursor.lineCursor = this.cursor.lineCursor.prevLine;
				let temp: Letter | null = this.cursor.lineCursor.lineHead,
					tempNextPos = nextPos;
				// console.log(temp);
				while (temp && tempNextPos--) {
					temp.isSelected = !temp.isSelected;
					temp = temp.nextLetter;
				}
				// temp = this.cursor.lineCursor.lineTail;
				this.cursor.setCursor = {
					line: this.cursor.lineCursor.prevLine,
					letter: this.cursor.lineCursor.lineTail,
				};
				temp = this.cursor.lineCursor.lineHead;
				while (temp && nextPos--) {
					temp = temp.nextLetter;
				}
				const cursorPos = temp?.prevLetter;
				while (temp) {
					temp.isSelected = !temp.isSelected;
					temp = temp.nextLetter;
				}
				if (cursorPos) {
					this.cursor.setLetterCursor = cursorPos;
				}
				break;
			case 'ArrowDown':
				this.selectionMode = true;
				let prevPos = this.getCursorPosition() + 1;
				if (!this.cursor.lineCursor.nextLine) {
					// if there is no nextLine, don't do anything
					let temp1: Letter | null = this.cursor.lineCursor.lineHead;
					while (temp1 && prevPos--) {
						temp1.isSelected = !temp1.isSelected;
						temp1 = temp1.nextLetter;
					}
					return;
				}
				// this.cursor.lineCursor = this.cursor.lineCursor.nextLine;
				let temp1: Letter | null = this.cursor.lineCursor.lineHead,
					tempPrevPos = prevPos;
				while (temp1 && tempPrevPos--) {
					temp1 = temp1.nextLetter;
				}
				while (temp1) {
					temp1.isSelected = !temp1.isSelected;
					temp1 = temp1.nextLetter;
				}
				// temp1 = this.cursor.lineCursor.lineTail;
				this.cursor.setCursor = {
					line: this.cursor.lineCursor.nextLine,
					letter: this.cursor.lineCursor.lineTail,
				};
				temp1 = this.cursor.lineCursor.lineHead;
				while (temp1 && prevPos--) {
					temp1.isSelected = !temp1.isSelected;
					temp1 = temp1.nextLetter;
				}
				if (temp1) {
					temp1 = temp1.prevLetter;
					if (temp1) this.cursor.setLetterCursor = temp1;
				}
				break;
			case 'ArrowLeft':
				this.selectionMode = true;
				if (keyEvent.altKey) {
					if (this.cursor.letterCursor.text === ' ') {
						this.cursor.letterCursor.isSelected =
							!this.cursor.letterCursor.isSelected;
						this.moveCursor(
							new KeyboardEvent('keydown', {
								key: 'ArrowLeft',
								shiftKey: true,
							})
						);
					}
					while (this.cursor.letterCursor.text !== ' ') {
						this.cursor.letterCursor.isSelected =
							!this.cursor.letterCursor.isSelected;
						this.moveCursor(
							new KeyboardEvent('keydown', {
								key: 'ArrowLeft',
								shiftKey: true,
							})
						);
						if (this.cursor.letterCursor.text === '') {
							break;
						}
					}
				} else {
					this.cursor.letterCursor.isSelected =
						!this.cursor.letterCursor.isSelected;
					this.moveCursor(
						new KeyboardEvent('keydown', {
							key: 'ArrowLeft',
							shiftKey: true,
						})
					);
				}
				break;
			case 'ArrowRight':
				this.selectionMode = true;
				if (keyEvent.altKey) {
					if (this.cursor.letterCursor.text === ' ') {
						this.moveCursor(
							new KeyboardEvent('keydown', {
								key: 'ArrowRight',
								shiftKey: true,
							})
						);
						this.cursor.letterCursor.isSelected =
							!this.cursor.letterCursor.isSelected;
					}

					while (this.cursor.letterCursor.text !== ' ') {
						this.moveCursor(
							new KeyboardEvent('keydown', {
								key: 'ArrowRight',
								shiftKey: true,
							})
						);
						this.cursor.letterCursor.isSelected =
							!this.cursor.letterCursor.isSelected;
						if (this.cursor.letterCursor.text === '') {
							break;
						}
					}
				} else {
					this.selectionMode = true;
					this.moveCursor(
						new KeyboardEvent('keydown', {
							key: 'ArrowRight',
							shiftKey: true,
						})
					);
					this.cursor.letterCursor.isSelected =
						!this.cursor.letterCursor.isSelected;
				}
				break;
			default:
				console.log('No action to be performed');
		}
	}

	resetSelection() {
		this.selectionMode = false;
		let linePtr: Line | null = this.editorHead;
		while (linePtr) {
			let head = linePtr.lineHead.nextLetter;
			while (head) {
				if (head.isSelected) head.isSelected = false;
				head = head.nextLetter;
			}
			if (linePtr) linePtr = linePtr.nextLine; // this is a problem
		}
	}

	copySelection() {
		// copy the selection or line
		const selectedTextContainer =
			document.querySelectorAll('.selectedText');
		let selectedText = '';
		for (const container of selectedTextContainer) {
			selectedText += container.textContent + '\n';
		}
		navigator.clipboard.writeText(selectedText);
	}

	cutSelection() {
		const isMultiLineSelected =
			document.getElementsByClassName('selectedText')?.length > 1;
		let copyText = '';
		let linePtr: Line | null = this.cursor.lineCursor;
		let startSelection = null,
			endSelection = null;
		if (!isMultiLineSelected) {
			// single line selection
			let letterPtr: Letter | null = this.cursor.lineCursor.lineHead;
			let start = null,
				end = null;

			while (letterPtr) {
				if (letterPtr.isSelected) {
					start = letterPtr;
					break;
				}
				letterPtr = letterPtr.nextLetter;
			}
			while (letterPtr && letterPtr.isSelected) {
				copyText += letterPtr.text;
				end = letterPtr;
				letterPtr = letterPtr.nextLetter;
			}
			if (
				this.cursor.lineCursor.lineHead.isSelected &&
				this.cursor.lineCursor.lineTail.isSelected
			) {
				this.deleteLines(
					this.cursor.lineCursor,
					this.cursor.lineCursor
				);
			} else if (start && end) {
				this.cursor.lineCursor.deleteLetters(start, end);
			}
		} else {
			const nextLine = linePtr.nextLine;
			let isNextline = false;
			if (
				nextLine &&
				(nextLine.lineHead.isSelected ||
					nextLine.lineHead.nextLetter?.isSelected)
			) {
				isNextline = true;
			}
			while (linePtr) {
				let head: Letter | null = linePtr.lineHead.nextLetter;
				let start = null,
					end = null,
					currLineTxt = '';
				while (head) {
					if (head.isSelected) {
						start = head;
						break;
					}
					head = head.nextLetter;
				}
				while (head && head.isSelected) {
					currLineTxt += head.text;
					end = head;
					head = head.nextLetter;
				}
				if (!start && !end) {
					break;
				}
				if (
					(linePtr.lineHead.isSelected ||
						linePtr.lineHead.nextLetter?.isSelected) &&
					(linePtr.lineTail.isSelected ||
						linePtr.lineTail.prevLetter?.isSelected)
				) {
					console.log('delete full line');
					// if (!startSelection) startSelection = linePtr;
					// else if (!endSelection) endSelection = linePtr;
					this.deleteLines(linePtr, linePtr);
				} else if (start && end) {
					// this line needs to be connected to previous line
					if (!startSelection) startSelection = linePtr;
					else if (!endSelection) endSelection = linePtr;
					linePtr.deleteLetters(start, end);
					console.log('delete part of the line');
				}
				if (currLineTxt) currLineTxt += '\n';
				if (isNextline) {
					linePtr = linePtr.nextLine; // this is a problem
					copyText += currLineTxt;
				} else {
					linePtr = linePtr.prevLine;
					copyText = currLineTxt + copyText;
				}
				if (linePtr) {
					this.cursor.setCursor = {
						line: linePtr,
						letter: linePtr.lineHead,
					};
				}
			}
			if (startSelection && endSelection) {
				if (isNextline) {
					this.cursor.setCursor = {
						line: endSelection,
						letter: endSelection?.lineHead,
					};
					startSelection.deleteLetters(
						endSelection.lineHead,
						endSelection.lineHead
					);
					startSelection.lineTail = endSelection.lineTail;
				} else {
					this.cursor.setCursor = {
						line: startSelection,
						letter: startSelection?.lineHead,
					};
					startSelection.deleteLetters(
						startSelection.lineHead,
						startSelection.lineHead
					);
					endSelection.lineTail = startSelection.lineTail;
				}
			}
		}
		navigator.clipboard.writeText(copyText);
	}

	async pasteOnSelection() {
		const isMultiLineSelected =
			document.getElementsByClassName('selectedText')?.length > 1;
		let linePtr: Line | null = this.cursor.lineCursor;
		let startSelection = null,
			endSelection = null;
		if (!isMultiLineSelected) {
			// single line selection
			let letterPtr: Letter | null = this.cursor.lineCursor.lineHead;
			let start = null,
				end = null;

			while (letterPtr) {
				if (letterPtr.isSelected) {
					start = letterPtr;
					break;
				}
				letterPtr = letterPtr.nextLetter;
			}
			while (letterPtr && letterPtr.isSelected) {
				end = letterPtr;
				letterPtr = letterPtr.nextLetter;
			}
			if (
				this.cursor.lineCursor.lineHead.isSelected &&
				this.cursor.lineCursor.lineTail.isSelected
			) {
				this.deleteLines(
					this.cursor.lineCursor,
					this.cursor.lineCursor
				);
			} else if (start && end) {
				this.cursor.lineCursor.deleteLetters(start, end);
			}
		} else {
			const nextLine = linePtr.nextLine;
			let isNextline = false;
			if (
				nextLine &&
				(nextLine.lineHead.isSelected ||
					nextLine.lineHead.nextLetter?.isSelected)
			) {
				isNextline = true;
			}
			while (linePtr) {
				let head: Letter | null = linePtr.lineHead.nextLetter;
				let start = null,
					end = null,
					currLineTxt = '';
				while (head) {
					if (head.isSelected) {
						start = head;
						break;
					}
					head = head.nextLetter;
				}
				while (head && head.isSelected) {
					currLineTxt += head.text;
					end = head;
					head = head.nextLetter;
				}
				if (!start && !end) {
					break;
				}
				if (
					(linePtr.lineHead.isSelected ||
						linePtr.lineHead.nextLetter?.isSelected) &&
					(linePtr.lineTail.isSelected ||
						linePtr.lineTail.prevLetter?.isSelected)
				) {
					console.log('delete full line');
					// if (!startSelection) startSelection = linePtr;
					// else if (!endSelection) endSelection = linePtr;
					this.deleteLines(linePtr, linePtr);
				} else if (start && end) {
					// this line needs to be connected to previous line
					if (!startSelection) startSelection = linePtr;
					else if (!endSelection) endSelection = linePtr;
					linePtr.deleteLetters(start, end);
					console.log('delete part of the line');
				}
				if (currLineTxt) currLineTxt += '\n';
				if (isNextline) {
					linePtr = linePtr.nextLine; // this is a problem
				} else {
					linePtr = linePtr.prevLine;
				}
				if (linePtr) {
					this.cursor.setCursor = {
						line: linePtr,
						letter: linePtr?.lineHead,
					};
				}
			}
			if (startSelection && endSelection) {
				if (isNextline) {
					this.cursor.setCursor = {
						line: endSelection,
						letter: endSelection?.lineHead,
					};
					startSelection.deleteLetters(
						endSelection.lineHead,
						endSelection.lineHead
					);
					startSelection.lineTail = endSelection.lineTail;
				} else {
					this.cursor.setCursor = {
						line: startSelection,
						letter: startSelection?.lineHead,
					};
					startSelection.deleteLetters(
						startSelection.lineHead,
						startSelection.lineHead
					);
					endSelection.lineTail = startSelection.lineTail;
				}

				const textContent = await navigator.clipboard.readText();

				for (const letter of textContent) {
					if (isLineBreak(letter)) {
						this.insertLine();
						continue;
					}
					this.cursor.lineCursor.addLetter(this.cursor, letter);
				}
			} else {
				const textContent = await navigator.clipboard.readText();

				for (const letter of textContent) {
					if (isLineBreak(letter)) {
						this.insertLine();
						continue;
					}
					this.cursor.lineCursor.addLetter(this.cursor, letter);
				}
			}
		}
		// navigator.clipboard.writeText(copyText);
	}

	deleteSelection() {
		const isMultiLineSelected =
			document.getElementsByClassName('selectedText')?.length > 1;
		let linePtr: Line | null = this.cursor.lineCursor;
		let startSelection = null,
			endSelection = null;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
		const undoOps: Function[] = [];
		// let stringToBeDeleted = "";
		if (!isMultiLineSelected) {
			// single line selection
			let letterPtr: Letter | null = this.cursor.lineCursor.lineHead;
			let start = null,
				end = null;

			while (letterPtr) {
				if (letterPtr.isSelected) {
					start = letterPtr;
					break;
				}
				letterPtr = letterPtr.nextLetter;
			}
			while (letterPtr && letterPtr.isSelected) {
				end = letterPtr;
				letterPtr = letterPtr.nextLetter;
			}
			if (
				this.cursor.lineCursor.lineHead.isSelected &&
				this.cursor.lineCursor.lineTail.isSelected
			) {
				const ops = this.deleteLines(
					this.cursor.lineCursor,
					this.cursor.lineCursor
				);
				undoOps.push(ops);
			} else if (start && end) {
				const ops = this.cursor.lineCursor.deleteLetters(start, end);
				undoOps.push(ops);
			}
		} else {
			const nextLine = linePtr.nextLine;
			let isNextline = false;
			if (
				nextLine &&
				(nextLine.lineHead.isSelected ||
					nextLine.lineHead.nextLetter?.isSelected)
			) {
				isNextline = true;
			}
			while (linePtr) {
				let head: Letter | null = linePtr.lineHead.nextLetter;
				let start = null,
					end = null;
				while (head) {
					if (head.isSelected) {
						start = head;
						break;
					}
					head = head.nextLetter;
				}
				while (head && head.isSelected) {
					end = head;
					head = head.nextLetter;
				}
				if (!start && !end) {
					break;
				}
				if (
					(linePtr.lineHead.isSelected ||
						linePtr.lineHead.nextLetter?.isSelected) &&
					(linePtr.lineTail.isSelected ||
						linePtr.lineTail.prevLetter?.isSelected)
				) {
					console.log('delete full line');
					// if (!startSelection) startSelection = linePtr;
					// else if (!endSelection) endSelection = linePtr;
					const ops = this.deleteLines(linePtr, linePtr);
					undoOps.push(ops);
				} else if (start && end) {
					// this line needs to be connected to previous line
					if (!startSelection) startSelection = linePtr;
					else if (!endSelection) endSelection = linePtr;
					const ops = linePtr.deleteLetters(start, end);
					undoOps.push(ops);
					console.log('delete part of the line');
				}
				if (isNextline) {
					linePtr = linePtr.nextLine; // this is a problem
				} else {
					linePtr = linePtr.prevLine;
				}
				if (linePtr) {
					this.cursor.setCursor = {
						line: linePtr,
						letter: linePtr.lineHead,
					};
				}
			}
			if (startSelection && endSelection) {
				if (isNextline) {
					this.cursor.setCursor = {
						line: endSelection,
						letter: endSelection.lineHead,
					};
					undoOps.push(
						startSelection.deleteLetters(
							endSelection.lineHead,
							endSelection.lineHead
						)
					);
					startSelection.lineTail = endSelection.lineTail;
				} else {
					this.cursor.setCursor = {
						line: startSelection,
						letter: startSelection.lineHead,
					};
					undoOps.push(
						startSelection.deleteLetters(
							startSelection.lineHead,
							startSelection.lineHead
						)
					);
					endSelection.lineTail = startSelection.lineTail;
				}
			}
			this.selectionMode = false;
		}

		return () => {
			for (const func of undoOps) {
				func();
			}
			// store the selected characters
			// on undo, just do the paste logic from the cursor position
		};
	}

	deleteWords() {
		let leftWhiteSpace = this.cursor.letterCursor;
		while (leftWhiteSpace && leftWhiteSpace.text !== '') {
			if (leftWhiteSpace.prevLetter) {
				leftWhiteSpace = leftWhiteSpace.prevLetter;
			}
			if (!leftWhiteSpace) break;
			if (
				leftWhiteSpace.text === '' ||
				isSpecialCharacter(leftWhiteSpace.text)
			) {
				if (leftWhiteSpace.nextLetter) {
					leftWhiteSpace = leftWhiteSpace.nextLetter;
				}
				break;
			}
		}
		this.cursor.lineCursor.deleteLetters(
			leftWhiteSpace,
			this.cursor.letterCursor
		);
	}

	async paste() {
		const textContent = await navigator.clipboard.readText();
		for (const letter of textContent) {
			if (isLineBreak(letter)) {
				this.insertLine();
				continue;
			}
			this.cursor.lineCursor.addLetter(this.cursor, letter);
		}
	}

	cut() {
		// cut a line and copy it's content to clipboard
		let currLineHead: Letter | null = this.cursor.lineCursor.lineHead;
		let text = '';
		while (currLineHead) {
			text += currLineHead.text;
			currLineHead = currLineHead.nextLetter;
		}

		navigator.clipboard.writeText(text);
		this.deleteLines(this.cursor.lineCursor, this.cursor.lineCursor);
	}

	map(cb: (lineText: string, index: number) => ReactNode): Array<ReactNode> {
		const renderedLines: Array<ReactNode> = [];
		let editorHeadPtr: Line | null = this.editorHead;

		while (editorHeadPtr) {
			const currLineText = editorHeadPtr.map(editorHeadPtr);
			const htmlRenderedLine = cb(currLineText, renderedLines.length);
			renderedLines.push(htmlRenderedLine);
			editorHeadPtr = editorHeadPtr.nextLine;
		}

		return renderedLines;
	}
}

export default Editor;
