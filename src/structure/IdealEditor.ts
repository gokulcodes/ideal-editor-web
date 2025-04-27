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
	constructor() {
		this.editorHead = new Line(); // sential line node
		this.editorTail = this.editorHead;
		this.cursor = new Cursor(this.editorHead, this.editorHead.lineHead);
		this.selectionMode = false;
		this.selectionDetails = new SelectionDetails(0, 0, 0, 0);
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
		endPosition: number
	) {
		startPosition -= 1
		endPosition -= 1;
		// console.log(startLine, endLine)
		this.selectionMode = true;
		let linePtr: Line | null = this.editorHead,
			lineCnt = 0;
		while (linePtr) {
			let head = linePtr.lineHead.nextLetter,
				letterCnt = 0;
			while (head) {
				if (startLine === endLine) {
					if (lineCnt == startLine && 
						letterCnt >= startPosition &&
						letterCnt <= endPosition
					) {
						head.isSelected = true;
					}
				}else if (lineCnt > startLine && lineCnt < endLine) {
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
		if (!keyEvent.shiftKey) {
			this.resetSelection(); // reset selection on direction key's when shift key is not pressed
		}
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
		switch (keyEvent.key) {
			case 'ArrowUp':
				if (!this.cursor.lineCursor.prevLine) {
					// if there is no prevLine, don't do anything
					return;
				}
				let nextPos = this.getCursorPosition() + 1;

				// this.cursor.lineCursor = this.cursor.lineCursor.prevLine;
				let temp: Letter | null = this.cursor.lineCursor.lineHead;
				while (temp && nextPos--) {
					temp.isSelected = true;
					temp = temp.nextLetter;
				}
				this.cursor.lineCursor = this.cursor.lineCursor.prevLine;
				// temp = this.cursor.lineCursor.lineTail;
				this.cursor.letterCursor = this.cursor.lineCursor.lineTail;
				break;
			case 'ArrowDown':
				if (!this.cursor.lineCursor.nextLine) {
					// if there is no nextLine, don't do anything
					return;
				}
				let prevPos = this.getCursorPosition() + 1;
				// this.cursor.lineCursor = this.cursor.lineCursor.nextLine;
				let temp1: Letter | null = this.cursor.lineCursor.lineHead;
				while (temp1 && prevPos--) {
					temp1.isSelected = true;
					temp1 = temp1.nextLetter;
				}
				this.cursor.lineCursor = this.cursor.lineCursor.nextLine;
				// temp1 = this.cursor.lineCursor.lineTail;
				this.cursor.letterCursor = this.cursor.lineCursor.lineTail;
				break;
			case 'ArrowLeft':
				this.selectionMode = true;
				if (keyEvent.altKey) {
					if (this.cursor.letterCursor.text === ' ') {
						this.cursor.letterCursor.isSelected =
							!this.cursor.letterCursor.isSelected;
						this.moveCursor(
							new KeyboardEvent('keydown', { key: 'ArrowLeft', shiftKey: true })
						);
					}
					while (this.cursor.letterCursor.text !== ' ') {
						this.cursor.letterCursor.isSelected =
							!this.cursor.letterCursor.isSelected;
						this.moveCursor(
							new KeyboardEvent('keydown', { key: 'ArrowLeft', shiftKey: true })
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
						new KeyboardEvent('keydown', { key: 'ArrowLeft', shiftKey: true })
					);
				}
				break;
			case 'ArrowRight':
				if (keyEvent.altKey) {
					if (this.cursor.letterCursor.text === ' ') {
						this.moveCursor(
							new KeyboardEvent('keydown', { key: 'ArrowRight', shiftKey: true })
						);
						this.cursor.letterCursor.isSelected =
							!this.cursor.letterCursor.isSelected;
					}
					while (this.cursor.letterCursor.text !== ' ') {
						this.moveCursor(
							new KeyboardEvent('keydown', { key: 'ArrowRight', shiftKey: true })
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
						new KeyboardEvent('keydown', { key: 'ArrowRight', shiftKey: true })
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
		let linePtr: Line | null = this.editorHead,
			copyText = '';
		// console.log(this.cutSelection)
		while (linePtr) {
			// console.log(linePtr)
			let head = linePtr.lineHead.nextLetter;
			let start = null,
				end = null;
			while (head) {
				if (head.isSelected) {
					start = head;
					break;
				}
				head = head.nextLetter;
			}
			while (head) {
				copyText += head.text;
				end = head;
				head = head.nextLetter;
				if (head && !head.isSelected) {
					break;
				}
			}
			// console.log(start, end);
			if (start && end) {
				linePtr.deleteLetters(this.cursor, start, end);
			} else if (
				start &&
				end &&
				(start.prevLetter == null || start.prevLetter.text === '') &&
				end.nextLetter == null
			) {
				this.deleteLines(linePtr, linePtr);
			}
			// if (start && end) {
			//   if ((start.prevLetter == null || start.prevLetter.text === '') && end.nextLetter == null) {
			//     this.deleteLines(linePtr, linePtr);
			//     if(linePtr) linePtr = linePtr.nextLine;
			//     continue;
			//   }
			//   const prevLetter = start?.prevLetter;
			//   if (prevLetter) {
			//     // console.log(start, prevLetter);
			//     prevLetter.nextLetter = end.nextLetter;
			//     end.prevLetter = prevLetter;
			//     this.cursor.letterCursor = prevLetter;
			//   }
			//   // if (!end.nextLetter) {
			//   //   linePtr.lineTail = prevLetter;
			//   // }
			//   // if (!start.prevLetter) {
			//   //   linePtr.lineHead = end.nextLetter;
			//   // }
			// }
			if (linePtr) linePtr = linePtr.nextLine; // this is a problem
		}
		navigator.clipboard.writeText(copyText);
	}

	async pasteOnSelection() {
		let linePtr: Line | null = this.editorHead;
		let textContent = await navigator.clipboard.readText();
		while (linePtr) {
			// console.log(linePtr)
			let head = linePtr.lineHead.nextLetter;
			let start = null,
				end = null;
			while (head) {
				if (head.isSelected) {
					start = head;
					break;
				}
				head = head.nextLetter;
			}
			while (head) {
				end = head;
				head = head.nextLetter;
				if (head && !head.isSelected) {
					break;
				}
			}
			// console.log(start, end);
			if (start && end) {
				linePtr.deleteLetters(this.cursor, start, end);
			} else if (
				start &&
				end &&
				(start.prevLetter == null || start.prevLetter.text === '') &&
				end.nextLetter == null
			) {
				this.deleteLines(linePtr, linePtr);
			}
			for (const letter of textContent) {
				if (isLineBreak(letter)) {
					this.insertLine();
					continue;
				}
				// console.log(letter)
				this.cursor.lineCursor.addLetter(this.cursor, letter);
			}
			textContent = '';
			// if (start && end) {
			//   if ((start.prevLetter == null || start.prevLetter.text === '') && end.nextLetter == null) {
			//     this.deleteLines(linePtr, linePtr);
			//     if(linePtr) linePtr = linePtr.nextLine;
			//     continue;
			//   }
			//   const prevLetter = start?.prevLetter;
			//   if (prevLetter) {
			//     // console.log(start, prevLetter);
			//     prevLetter.nextLetter = end.nextLetter;
			//     end.prevLetter = prevLetter;
			//     this.cursor.letterCursor = prevLetter;
			//   }
			//   // if (!end.nextLetter) {
			//   //   linePtr.lineTail = prevLetter;
			//   // }
			//   // if (!start.prevLetter) {
			//   //   linePtr.lineHead = end.nextLetter;
			//   // }
			// }
			if (linePtr) linePtr = linePtr.nextLine; // this is a problem
		}
	}

	deleteSelection() {
		let linePtr: Line | null = this.editorHead;
		while (linePtr) {
			// console.log(linePtr)
			let head = linePtr.lineHead.nextLetter;
			let start = null,
				end = null;
			while (head) {
				if (head.isSelected) {
					start = head;
					break;
				}
				head = head.nextLetter;
			}
			while (head) {
				end = head;
				head = head.nextLetter;
				if (head && !head.isSelected) {
					break;
				}
			}
			// console.log(start, end);
			if (start && end) {
				linePtr.deleteLetters(this.cursor, start, end);
			} else if (
				start &&
				end &&
				(start.prevLetter == null || start.prevLetter.text === '') &&
				end.nextLetter == null
			) {
				this.deleteLines(linePtr, linePtr);
			}
			// if (start && end) {
			//   if ((start.prevLetter == null || start.prevLetter.text === '') && end.nextLetter == null) {
			//     this.deleteLines(linePtr, linePtr);
			//     if(linePtr) linePtr = linePtr.nextLine;
			//     continue;
			//   }
			//   const prevLetter = start?.prevLetter;
			//   if (prevLetter) {
			//     // console.log(start, prevLetter);
			//     prevLetter.nextLetter = end.nextLetter;
			//     end.prevLetter = prevLetter;
			//     this.cursor.letterCursor = prevLetter;
			//   }
			//   // if (!end.nextLetter) {
			//   //   linePtr.lineTail = prevLetter;
			//   // }
			//   // if (!start.prevLetter) {
			//   //   linePtr.lineHead = end.nextLetter;
			//   // }
			// }
			if (linePtr) linePtr = linePtr.nextLine; // this is a problem
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
		if (event.metaKey) {
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
		} else if (event.key === 'Home') {
			return true;
		} else if (event.key === 'End') {
			return true;
		} else if (event.altKey) {
			if (this.isCursorMoveEvent(event)) {
				return true;
			}
		}
		return false;
	}

	async handleKeyboardShortcuts(cb: () => void, event: KeyboardEvent) {
		return new Promise(async (resolve) => {
			if (event.metaKey) {
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
					this.moveCursor(event, event.altKey, event.metaKey);
					cb();
					resolve('Success');
				} else if (event.key === 'a') {
					this.updateLetterSelectionOnMouseMove(0, 1000, 0, 100);
					cb();
					resolve('Success');
				}
			} else if (event.shiftKey) {
				if (this.isCursorMoveEvent(event)) {
					this.updateLetterSelection(event);
				}
				cb();
				resolve('success');
			} else if (event.key === 'Home' || event.key === 'End') {
				this.moveCursor(event);
				cb();
				resolve('Success');
			} else if (event.altKey) {
				this.moveCursor(event, event.altKey, event.metaKey);
				cb();
				resolve('Success');
			}
		});
	}
}

export default Editor;
