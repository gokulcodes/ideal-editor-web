import { ReactNode } from 'react';
import Line from './Line';
import Letter from './Letter';
import { isLineBreak } from './editorUtils';

/**
 * Cursor class holds the line and letter position where the cursor blinker should be shown
 */
export class Cursor {
	lineCursor: Line;
	letterCursor: Letter;
	lineNo: number;
	letterNo: number;
	constructor(linePosition: Line, letterPosition: Letter) {
		this.lineCursor = linePosition;
		this.letterCursor = letterPosition;
		this.lineNo = 0;
		this.letterNo = 0;
	}
}

class SelectionDetails {
	lineStart: number;
	lineEnd: number;
	letterStart: number;
	letterEnd: number;
	constructor(
		lineStart: number,
		lineEnd: number,
		letterStart: number,
		letterEnd: number
	) {
		this.lineStart = lineStart;
		this.lineEnd = lineEnd;
		this.letterStart = letterStart;
		this.letterEnd = letterEnd;
	}
}

class Editor {
	editorHead: Line;
	editorTail: Line;
	cursor: Cursor;
	selectionMode: boolean;
	selectionDetails: SelectionDetails;
	undoRedoBuffer: Array<Editor>;
	constructor() {
		this.editorHead = new Line(); // sential line node
		this.editorTail = this.editorHead;
		this.cursor = new Cursor(this.editorHead, this.editorHead.lineHead);
		this.selectionMode = false;
		this.selectionDetails = new SelectionDetails(0, 0, 0, 0);
		this.undoRedoBuffer = [];
	}

	insertLine() {
		const newLine = new Line(this.cursor.lineCursor.lineIndex + 1);

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
		this.cursor.lineCursor = newLine;
		this.cursor.letterCursor = newLine.lineHead;
		if (!this.cursor.lineCursor.nextLine) {
			// Updating editorTail node once we insert a new line
			this.editorTail = this.cursor.lineCursor;
		}
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
		this.selectionDetails.lineStart = lineNo;
		this.selectionDetails.lineEnd = lineNo;
		this.selectionDetails.letterStart = textNo;
		this.selectionDetails.letterEnd = textNo;
		let linePtr = this.editorHead;
		while (lineNo--) {
			if (linePtr.nextLine) linePtr = linePtr.nextLine;
			else break;
		}
		this.cursor.lineCursor = linePtr;
		let letterPtr = this.cursor.lineCursor.lineHead;
		while (textNo--) {
			if (letterPtr.nextLetter) letterPtr = letterPtr.nextLetter;
			else break;
		}
		this.cursor.letterCursor = letterPtr;
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
			[startLine, endLine] = [endLine, startLine];
			let linePtr: Line | null = this.editorTail,
				lineCnt = this.editorTail.lineIndex;
			while (linePtr) {
				this.selectionMode = true;
				let head: Letter | null = linePtr.lineTail,
					letterCnt = head.letterIndex;
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
					head = head.prevLetter;
					letterCnt--;
				}
				lineCnt--;
				if (linePtr) linePtr = linePtr.prevLine; // this is a problem
			}
			return;
		}
		let linePtr: Line | null = this.editorHead,
			lineCnt = 0;
		while (linePtr) {
			this.selectionMode = true;
			let head = linePtr.lineHead.nextLetter,
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
					this.cursor.lineCursor = this.editorHead;
					this.cursor.letterCursor = this.cursor.lineCursor.lineHead;
					return;
				}
				if (!this.cursor.lineCursor.prevLine) {
					// if there is no prevLine, don't do anything
					return;
				}
				let nextPos = this.getCursorPosition();
				this.cursor.lineCursor = this.cursor.lineCursor.prevLine;
				let temp: Letter | null = this.cursor.lineCursor.lineHead;
				while (temp && nextPos--) {
					temp = temp.nextLetter;
				}
				if (!temp) temp = this.cursor.lineCursor.lineTail;
				this.cursor.letterCursor = temp;
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
					this.cursor.lineCursor = this.editorTail;
					this.cursor.letterCursor = this.cursor.lineCursor.lineHead;
					return;
				}
				if (!this.cursor.lineCursor.nextLine) {
					// if there is no nextLine, don't do anything
					return;
				}
				let prevPos = this.getCursorPosition();
				this.cursor.lineCursor = this.cursor.lineCursor.nextLine;
				let temp1: Letter | null = this.cursor.lineCursor.lineHead;
				while (temp1 && prevPos--) {
					temp1 = temp1.nextLetter;
				}
				if (!temp1) temp1 = this.cursor.lineCursor.lineTail;
				this.cursor.letterCursor = temp1;
				break;
			case 'ArrowLeft':
				if (isAltKey) {
					// find leftmost whitespace / special character and move the cursor to that point
					let leftWhiteSpace = this.cursor.letterCursor.prevLetter;
					if (!leftWhiteSpace) {
						this.moveCursor(
							new KeyboardEvent('keydown', { key: 'ArrowUp' })
						);
						this.cursor.letterCursor =
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
						this.cursor.letterCursor =
							this.cursor.lineCursor.lineHead;
					} else {
						this.cursor.letterCursor = leftWhiteSpace;
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
					this.cursor.letterCursor = this.cursor.lineCursor.lineHead;
					return;
				}
				if (!this.cursor.letterCursor.prevLetter) {
					// if there is no previous letter, don't do anything
					if (this.cursor.lineCursor.prevLine) {
						this.cursor.lineCursor =
							this.cursor.lineCursor.prevLine;
						this.cursor.letterCursor =
							this.cursor.lineCursor.lineTail;
					}
					return;
				}
				this.cursor.letterCursor = this.cursor.letterCursor.prevLetter;
				break;
			case 'ArrowRight':
				if (isAltKey) {
					// find rightmost whitespace / special character and move the cursor to that point
					let rightWhiteSpace = this.cursor.letterCursor.nextLetter;
					if (!rightWhiteSpace) {
						this.moveCursor(
							new KeyboardEvent('keydown', { key: 'ArrowDown' })
						);
						this.cursor.letterCursor =
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
						this.cursor.letterCursor =
							this.cursor.lineCursor.lineTail;
					} else {
						this.cursor.letterCursor = rightWhiteSpace;
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
					this.cursor.letterCursor = this.cursor.lineCursor.lineTail;
					return;
				}
				if (!this.cursor.letterCursor.nextLetter) {
					// if there is no next letter, don't do anything
					if (this.cursor.lineCursor.nextLine) {
						this.cursor.lineCursor =
							this.cursor.lineCursor.nextLine;
						this.cursor.letterCursor =
							this.cursor.lineCursor.lineHead;
					}
					return;
				}
				this.cursor.letterCursor = this.cursor.letterCursor.nextLetter;
				break;
			case 'Home':
				this.cursor.letterCursor = this.cursor.lineCursor.lineHead;
				break;
			case 'End':
				this.cursor.letterCursor = this.cursor.lineCursor.lineTail;
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
				this.cursor.lineCursor = this.cursor.lineCursor.prevLine;
				this.cursor.letterCursor = this.cursor.lineCursor.lineTail;
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
					this.cursor.letterCursor = cursorPos;
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
				this.cursor.lineCursor = this.cursor.lineCursor.nextLine;
				this.cursor.letterCursor = this.cursor.lineCursor.lineTail;
				temp1 = this.cursor.lineCursor.lineHead;
				while (temp1 && prevPos--) {
					temp1.isSelected = !temp1.isSelected;
					temp1 = temp1.nextLetter;
				}
				if (temp1) {
					temp1 = temp1.prevLetter;
					if (temp1) this.cursor.letterCursor = temp1;
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
					// if (this.cursor.letterCursor.isSelected) {
					//   this.selectionDetails.letterEnd -= 1;
					// } else
					this.selectionDetails.letterStart -= 1;
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
					// if (this.cursor.letterCursor.isSelected) {
					//   this.selectionDetails.letterStart += 1;
					// } else
					this.selectionDetails.letterEnd += 1;
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

	deleteLines(start: Line, end: Line) {
		const prev = start.prevLine;
		const next = end.nextLine;
		if (prev == null) {
			start.nextLine = next;
			if (!next) {
				this.editorHead = new Line(
					this.cursor.lineCursor.lineIndex + 1
				); // sential line node
				this.editorTail = this.editorHead;
				this.cursor = new Cursor(
					this.editorHead,
					this.editorHead.lineHead
				);
				return;
			}
			next.prevLine = null;
			this.editorHead = next;
			this.moveCursor(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
			return;
		}

		if (next == null) {
			this.moveCursor(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
			prev.nextLine = null;
			this.editorTail = prev;
			return;
		}

		this.moveCursor(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
		prev.nextLine = next;
		next.prevLine = prev;
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
				this.cursor.lineCursor.deleteLetters(this.cursor, start, end);
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
					linePtr.deleteLetters(this.cursor, start, end);
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
					this.cursor.lineCursor = linePtr;
					this.cursor.letterCursor = linePtr?.lineHead;
				}
			}
			if (startSelection && endSelection) {
				if (isNextline) {
					this.cursor.lineCursor = endSelection;
					this.cursor.letterCursor = endSelection?.lineHead;
					startSelection.deleteLetters(
						this.cursor,
						endSelection.lineHead,
						endSelection.lineHead
					);
					startSelection.lineTail = endSelection.lineTail;
				} else {
					this.cursor.lineCursor = startSelection;
					this.cursor.letterCursor = startSelection?.lineHead;
					startSelection.deleteLetters(
						this.cursor,
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
				this.cursor.lineCursor.deleteLetters(this.cursor, start, end);
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
					linePtr.deleteLetters(this.cursor, start, end);
					console.log('delete part of the line');
				}
				if (currLineTxt) currLineTxt += '\n';
				if (isNextline) {
					linePtr = linePtr.nextLine; // this is a problem
				} else {
					linePtr = linePtr.prevLine;
				}
				if (linePtr) {
					this.cursor.lineCursor = linePtr;
					this.cursor.letterCursor = linePtr?.lineHead;
				}
			}
			if (startSelection && endSelection) {
				if (isNextline) {
					this.cursor.lineCursor = endSelection;
					this.cursor.letterCursor = endSelection?.lineHead;
					startSelection.deleteLetters(
						this.cursor,
						endSelection.lineHead,
						endSelection.lineHead
					);
					startSelection.lineTail = endSelection.lineTail;
				} else {
					this.cursor.lineCursor = startSelection;
					this.cursor.letterCursor = startSelection?.lineHead;
					startSelection.deleteLetters(
						this.cursor,
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
				this.cursor.lineCursor.deleteLetters(this.cursor, start, end);
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
					this.deleteLines(linePtr, linePtr);
				} else if (start && end) {
					// this line needs to be connected to previous line
					if (!startSelection) startSelection = linePtr;
					else if (!endSelection) endSelection = linePtr;
					linePtr.deleteLetters(this.cursor, start, end);
					console.log('delete part of the line');
				}
				if (isNextline) {
					linePtr = linePtr.nextLine; // this is a problem
				} else {
					linePtr = linePtr.prevLine;
				}
				if (linePtr) {
					this.cursor.lineCursor = linePtr;
					this.cursor.letterCursor = linePtr?.lineHead;
				}
			}
			if (startSelection && endSelection) {
				if (isNextline) {
					this.cursor.lineCursor = endSelection;
					this.cursor.letterCursor = endSelection?.lineHead;
					startSelection.deleteLetters(
						this.cursor,
						endSelection.lineHead,
						endSelection.lineHead
					);
					startSelection.lineTail = endSelection.lineTail;
				} else {
					this.cursor.lineCursor = startSelection;
					this.cursor.letterCursor = startSelection?.lineHead;
					startSelection.deleteLetters(
						this.cursor,
						startSelection.lineHead,
						startSelection.lineHead
					);
					endSelection.lineTail = startSelection.lineTail;
				}
			}
		}
	}

	map(cb: (lineText: string, index: number) => ReactNode): Array<ReactNode> {
		const renderedLines: Array<ReactNode> = [];
		let editorHeadPtr: Line | null = this.editorHead;

		while (editorHeadPtr) {
			const currLineText = editorHeadPtr.map(
				editorHeadPtr,
				this.cursor,
				this
			);
			const htmlRenderedLine = cb(currLineText, renderedLines.length);
			renderedLines.push(htmlRenderedLine);
			editorHeadPtr = editorHeadPtr.nextLine;
		}

		return renderedLines;
	}

	isCursorMoveEvent(event: KeyboardEvent) {
		const events = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
		return events.includes(event.key);
	}

	isIgnorableKeys(event: KeyboardEvent) {
		const events = [
			'Shift',
			'Meta',
			'Alt',
			'Control',
			'Escape',
			'CapsLock',
		];
		return events.includes(event.key);
	}

	isKeyboardShortcut(event: KeyboardEvent) {
		if (event.metaKey || event.ctrlKey) {
			if (event.key == 'c') {
				return true;
			}
			if (event.key == 'v') {
				return true;
			}
			if (event.key == 'x') {
				return true;
			}
			if (this.isCursorMoveEvent(event)) {
				return true;
			}
			if (event.key === 'a') {
				return true;
			}
			if (event.key === 'z') {
				return true;
			}
			if (event.key === 'Backspace') {
				return true;
			}
		} else if (event.shiftKey) {
			if (event.key === 'ArrowLeft') {
				return true;
			}
			if (event.key === 'ArrowRight') {
				return true;
			}
			if (event.key === 'ArrowUp') {
				return true;
			}
			if (event.key === 'ArrowDown') {
				return true;
			}
			if (event.key === 'z') {
				return true;
			}
		} else if (event.key === 'Home') {
			return true;
		} else if (event.key === 'End') {
			return true;
		} else if (event.altKey) {
			if (this.isCursorMoveEvent(event)) {
				return true;
			}
			if (event.key === 'Backspace') {
				return true;
			}
		}
		return false;
	}

	handleTimeTravel(event: KeyboardEvent) {
		if (!this.undoRedoBuffer || !this.undoRedoBuffer.length) {
			console.log('undo/redo buffer empty');
			return;
		}
		if (event.shiftKey) {
			// handle redo
			return;
		}
		// undo
		const previousEditorRef = this.undoRedoBuffer.at(-1);
		if (!previousEditorRef) {
			return;
		}

		this.editorHead = previousEditorRef.editorHead;
		this.editorTail = previousEditorRef.editorTail;
		this.cursor = previousEditorRef.cursor;
		this.cursor = previousEditorRef.cursor;
		this.selectionMode = previousEditorRef.selectionMode;
		this.selectionDetails = previousEditorRef.selectionDetails;
		this.undoRedoBuffer = previousEditorRef.undoRedoBuffer;
	}

	async handleKeyboardShortcuts(cb: () => void, event: KeyboardEvent) {
		return new Promise(async (resolve) => {
			if (event.metaKey || event.ctrlKey) {
				if (event.key == 'c') {
					this.copySelection();
					cb();
					resolve('Success');
				} else if (event.key == 'v') {
					// paste content from clipboard
					if (this.selectionMode) {
						await this.pasteOnSelection();
						cb();
						resolve('Success');
						return;
					}
					const textContent = await navigator.clipboard.readText();
					for (const letter of textContent) {
						if (isLineBreak(letter)) {
							this.insertLine();
							continue;
						}
						this.cursor.lineCursor.addLetter(this.cursor, letter);
					}
					cb();
					resolve('Success');
				} else if (event.key == 'x') {
					if (this.selectionMode) {
						this.cutSelection();
						cb();
						resolve('Success');
						return;
					}
					let currLineHead: Letter | null =
						this.cursor.lineCursor.lineHead;
					let text = '';
					while (currLineHead) {
						text += currLineHead.text;
						currLineHead = currLineHead.nextLetter;
					}
					navigator.clipboard.writeText(text);
					this.deleteLines(
						this.cursor.lineCursor,
						this.cursor.lineCursor
					);
					cb();
					resolve('Success');
				} else if (this.isCursorMoveEvent(event)) {
					this.resetSelection();
					this.moveCursor(
						event,
						event.altKey,
						event.metaKey || event.ctrlKey
					);
					cb();
					resolve('Success');
				} else if (event.key === 'a') {
					this.updateLetterSelectionOnMouseMove(
						0,
						1000,
						0,
						100,
						'UP'
					);
					cb();
					resolve('Success');
				} else if (event.key === 'z') {
					this.handleTimeTravel(event);
					cb();
					resolve('success');
				} else if (event.key === 'Backspace') {
					// delete the entire line
					const line = this.cursor.lineCursor;
					line.lineHead.nextLetter = line.lineTail.nextLetter;
					line.lineTail.prevLetter = line.lineHead;
					line.lineTail = line.lineHead;
					this.cursor.letterCursor = line.lineHead;
					cb();
					resolve('success');
				}
			} else if (event.shiftKey) {
				if (this.isCursorMoveEvent(event)) {
					this.updateLetterSelection(event);
				}
				cb();
				resolve('success');
			} else if (event.key === 'Home' || event.key === 'End') {
				this.resetSelection();
				this.moveCursor(event);
				cb();
				resolve('Success');
			} else if (event.altKey) {
				if (event.key === 'Backspace') {
					// delete letters between white space
					let leftWhiteSpace = this.cursor.letterCursor;
					while (leftWhiteSpace && leftWhiteSpace.text !== '') {
						if (leftWhiteSpace.prevLetter) {
							leftWhiteSpace = leftWhiteSpace.prevLetter;
						}
						if (!leftWhiteSpace) break;
						if (
							leftWhiteSpace.text === '' ||
							leftWhiteSpace.text === ' '
						) {
							if (leftWhiteSpace.nextLetter) {
								leftWhiteSpace = leftWhiteSpace.nextLetter;
							}
							break;
						}
					}
					this.cursor.lineCursor.deleteLetters(
						this.cursor,
						leftWhiteSpace,
						this.cursor.letterCursor
					);
					cb();
					resolve('Success');
					return;
				}
				this.resetSelection();
				this.moveCursor(
					event,
					event.altKey,
					event.metaKey || event.ctrlKey
				);
				cb();
				resolve('Success');
			}
		});
	}
}

export default Editor;
