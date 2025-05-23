import { ReactNode } from 'react';
import Line from './Line';
import Letter from './Letter';
import Cursor from './Cursor';
import { isLineBreak, isSpecialCharacter } from './editorUtils';

class Editor {
	editorHead: Line;
	editorTail: Line;
	totalLineCount: number;
	totalLetterCount: number;
	cursor: Cursor;
	selectionMode: boolean;
	// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
	undoOperations: [Function, Function][];
	// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
	redoOperations: Function[];
	constructor(content: string = '') {
		this.editorHead = new Line(this); // sential line node
		this.editorTail = this.editorHead;
		this.cursor = new Cursor(this.editorHead, this.editorHead.lineHead);
		this.selectionMode = false;
		this.undoOperations = [];
		this.redoOperations = [];
		this.totalLineCount = 0;
		this.totalLetterCount = 0;
		this.initializeEditorContent(content);
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
	async executeCommand(editorCommand: Function) {
		if (this.undoOperations.length > 100) {
			this.undoOperations.shift();
		}
		const undoThisCommand = await editorCommand();
		this.undoOperations.push([editorCommand, undoThisCommand]);
	}

	undo() {
		if (!this.undoOperations.length) {
			return;
		}
		const command = this.undoOperations.pop();
		if (command) {
			const undoThisCommand = command[1];
			undoThisCommand();
			this.redoOperations.push(command[0]);
		}
	}

	redo() {
		if (!this.redoOperations.length) {
			return;
		}
		const redoThisCommand = this.redoOperations.pop();
		if (typeof redoThisCommand === 'function') {
			redoThisCommand();
		}
	}

	insertLine(linePosition = this.cursor.lineCursor) {
		const newLine = new Line(this);

		// Linked new line next to current cursor line
		const currLine = linePosition;
		const nextToCurrLine = currLine.nextLine;
		newLine.prevLine = currLine;
		newLine.nextLine = nextToCurrLine;
		currLine.nextLine = newLine;

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
		if (linePosition === this.cursor.lineCursor) {
			this.cursor.setCursor = { line: newLine, letter: newLine.lineHead };
			if (!this.cursor.lineCursor.nextLine) {
				// Updating editorTail node once we insert a new line
				this.editorTail = this.cursor.lineCursor;
			}
		}
		this.totalLineCount += 1;
		return () => {
			this.deleteLines(this.cursor.lineCursor, this.cursor.lineCursor);
		};
	}

	deleteLines(start: Line, end: Line) {
		const prev = start.prevLine;
		const next = end.nextLine;
		let copyLineContent = '',
			linesTobeDeleted = 0,
			lettersTobeDeleted = 0,
			temp: Line | null = start;
		while (temp && temp != next) {
			linesTobeDeleted++;
			let letterTemp: Letter | null = temp.lineHead,
				txt = '';
			while (letterTemp) {
				txt += letterTemp.text;
				letterTemp = letterTemp.nextLetter;
			}
			lettersTobeDeleted += txt.length;
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
				this.totalLineCount -= linesTobeDeleted;
				this.totalLetterCount -= lettersTobeDeleted;
				return () => {
					for (const letter of copyLineContent) {
						if (isLineBreak(letter)) {
							this.insertLine();
							continue;
						}
						this.cursor.lineCursor.addLetter(letter);
					}
				};
			}
			next.prevLine = null;
			this.editorHead = next;
			this.moveCursor(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
			this.totalLineCount -= linesTobeDeleted;
			this.totalLetterCount -= lettersTobeDeleted;
			return () => {
				for (const letter of copyLineContent) {
					if (isLineBreak(letter)) {
						this.insertLine();
						continue;
					}
					this.cursor.lineCursor.addLetter(letter);
				}
			};
		}

		if (next == null) {
			this.moveCursor(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
			prev.nextLine = null;
			this.editorTail = prev;
			this.totalLineCount -= linesTobeDeleted;
			this.totalLetterCount -= lettersTobeDeleted;
			return () => {
				for (const letter of copyLineContent) {
					if (isLineBreak(letter)) {
						this.insertLine();
						continue;
					}
					this.cursor.lineCursor.addLetter(letter);
				}
			};
		}

		this.moveCursor(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
		prev.nextLine = next;
		next.prevLine = prev;
		this.totalLineCount -= linesTobeDeleted;
		this.totalLetterCount -= lettersTobeDeleted;
		return () => {
			console.log(copyLineContent);
			for (const letter of copyLineContent) {
				if (isLineBreak(letter)) {
					this.insertLine();
					continue;
				}
				this.cursor.lineCursor.addLetter(letter);
			}
		};
	}

	handleLineSwap(keyEvent: KeyboardEvent) {
		switch (keyEvent.key) {
			case 'ArrowUp': {
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
					// return;
				} else if (!nextLine) {
					prevLine.nextLine = null;
					prevPrevLine.nextLine = currLine;
					currLine.prevLine = prevPrevLine;
					currLine.nextLine = prevLine;
					prevLine.prevLine = currLine;
					this.editorTail = currLine;
					// return;
				} else {
					prevPrevLine.nextLine = currLine;
					currLine.prevLine = prevPrevLine;
					currLine.nextLine = prevLine;
					prevLine.prevLine = currLine;
					prevLine.nextLine = nextLine;
					nextLine.prevLine = prevLine;
				}
				this.moveCursor(
					new KeyboardEvent('keydown', { key: 'ArrowDown' })
				);
				if (!this.cursor.lineCursor.prevLine) {
					// if there is no prevLine, don't do anything
					return;
				}
				let nextPos = this.getCursorPosition;
				this.cursor.setLineCursor = this.cursor.lineCursor.prevLine;
				let temp: Letter | null = this.cursor.lineCursor.lineHead;
				while (temp && nextPos--) {
					temp = temp.nextLetter;
				}
				if (!temp) temp = this.cursor.lineCursor.lineTail;
				this.cursor.setLetterCursor = temp;
				break;
			}
			case 'ArrowDown': {
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
				} else if (!prevLine) {
					nextLine.prevLine = null;
					nextLine.nextLine = currLine;
					currLine.prevLine = nextLine;
					currLine.nextLine = nextNextLine;
					nextNextLine.prevLine = currLine;
					this.editorHead = nextLine;
				} else {
					nextNextLine.prevLine = currLine;
					currLine.nextLine = nextNextLine;
					currLine.prevLine = nextLine;
					nextLine.nextLine = currLine;
					prevLine.nextLine = nextLine;
					nextLine.prevLine = prevLine;
				}
				this.moveCursor(
					new KeyboardEvent('keydown', { key: 'ArrowUp' })
				);
				if (!this.cursor.lineCursor.nextLine) {
					// if there is no nextLine, don't do anything
					return;
				}
				let prevPos = this.getCursorPosition;
				this.cursor.setLineCursor = this.cursor.lineCursor.nextLine;
				let temp1: Letter | null = this.cursor.lineCursor.lineHead;
				while (temp1 && prevPos--) {
					temp1 = temp1.nextLetter;
				}
				if (!temp1) temp1 = this.cursor.lineCursor.lineTail;
				this.cursor.setLetterCursor = temp1;
				break;
			}
			case 'ArrowLeft':
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
				break;
			case 'ArrowRight':
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
				break;
			default:
				console.log('No action to be performed');
		}
	}

	moveCursorFast(keyEvent: KeyboardEvent) {
		switch (keyEvent.key) {
			case 'ArrowUp':
				this.cursor.setCursor = {
					line: this.editorHead,
					letter: this.editorHead.lineHead,
				};
				break;
			case 'ArrowDown':
				this.cursor.setCursor = {
					line: this.editorTail,
					letter: this.editorTail.lineHead,
				};
				break;
			case 'ArrowLeft':
				if (keyEvent.shiftKey) {
					this.selectionMode = true;
					let temp: Letter | null = this.cursor.letterCursor;
					while (temp) {
						temp.isSelected = true;
						if (temp) temp = temp.prevLetter;
					}
				}
				this.cursor.setLetterCursor = this.cursor.lineCursor.lineHead;
				break;
			case 'ArrowRight':
				if (keyEvent.shiftKey) {
					this.selectionMode = true;
					let temp: Letter | null = this.cursor.letterCursor;
					while (temp) {
						temp.isSelected = true;
						if (temp) temp = temp.nextLetter;
					}
				}
				this.cursor.setLetterCursor = this.cursor.lineCursor.lineTail;
				break;
			default:
				console.log('No action to be performed');
		}
	}

	moveCursor(keyEvent: KeyboardEvent) {
		switch (keyEvent.key) {
			case 'ArrowUp':
				if (!this.cursor.lineCursor.prevLine) {
					// if there is no prevLine, don't do anything
					return;
				}
				let nextPos = this.getCursorPosition;
				this.cursor.setLineCursor = this.cursor.lineCursor.prevLine;
				let temp: Letter | null = this.cursor.lineCursor.lineHead;
				while (temp && nextPos--) {
					temp = temp.nextLetter;
				}
				if (!temp) temp = this.cursor.lineCursor.lineTail;
				this.cursor.setLetterCursor = temp;
				break;
			case 'ArrowDown':
				if (!this.cursor.lineCursor.nextLine) {
					// if there is no nextLine, don't do anything
					return;
				}
				let prevPos = this.getCursorPosition;
				this.cursor.setLineCursor = this.cursor.lineCursor.nextLine;
				let temp1: Letter | null = this.cursor.lineCursor.lineHead;
				while (temp1 && prevPos--) {
					temp1 = temp1.nextLetter;
				}
				if (!temp1) temp1 = this.cursor.lineCursor.lineTail;
				this.cursor.setLetterCursor = temp1;
				break;
			case 'ArrowLeft':
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
				if (!this.cursor.letterCursor.nextLetter) {
					// if there is no next letter, don't do anything
					if (this.cursor.lineCursor.nextLine) {
						this.cursor.setCursor = {
							line: this.cursor.lineCursor.nextLine,
							letter: this.cursor.lineCursor.nextLine.lineHead,
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
		switch (keyEvent.key) {
			case 'ArrowUp':
				this.selectionMode = true;
				let nextPos = this.getCursorPosition + 1;
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
				let prevPos = this.getCursorPosition + 1;
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

	async selectionCrud(option: 'CUT' | 'PASTE' | 'DELETE') {
		const isMultiLineSelected =
			document.getElementsByClassName('selectedText')?.length > 1;
		let copyText = '';
		let linePtr: Line | null = this.cursor.lineCursor;
		let startSelection = null,
			endSelection = null;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
		const undoOps: Function[] = [];
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
					const ops = startSelection.deleteLetters(
						endSelection.lineHead,
						endSelection.lineHead
					);
					undoOps.push(ops);
					startSelection.lineTail = endSelection.lineTail;
				} else {
					this.cursor.setCursor = {
						line: startSelection,
						letter: startSelection?.lineHead,
					};
					const ops = startSelection.deleteLetters(
						startSelection.lineHead,
						startSelection.lineHead
					);
					undoOps.push(ops);
					endSelection.lineTail = startSelection.lineTail;
				}
			}
		}
		if (option === 'CUT') navigator.clipboard.writeText(copyText);
		else if (option === 'PASTE') {
			const ops = await this.paste();
			undoOps.push(ops);
		}
		return () => {
			undoOps.map((func) => func());
		};
	}

	deleteWords() {
		let leftWhiteSpace = this.cursor.letterCursor;
		while (
			leftWhiteSpace &&
			leftWhiteSpace.text !== '' &&
			!isSpecialCharacter(leftWhiteSpace.text)
		) {
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
		const ops = this.cursor.lineCursor.deleteLetters(
			leftWhiteSpace,
			this.cursor.letterCursor
		);
		return () => {
			ops();
		};
	}

	deleteEntireLine() {
		// for cmd + backspace
		const line = this.cursor.lineCursor;
		let letters = '',
			temp: Letter | null = line.lineHead;
		while (temp) {
			letters += temp.text;
			temp = temp.nextLetter;
		}
		line.lineHead.nextLetter = line.lineTail.nextLetter;
		line.lineTail.prevLetter = line.lineHead;
		line.lineTail = line.lineHead;
		this.cursor.setLetterCursor = line.lineHead;
		this.totalLineCount -= 1;
		this.totalLetterCount -= letters.length;
		return () => {
			for (const letter of letters) {
				this.cursor.lineCursor.addLetter(letter);
			}
		};
	}

	async paste() {
		const textContent = await navigator.clipboard.readText();
		// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
		const totalOps: Function[] = [];
		for (const letter of textContent) {
			if (isLineBreak(letter)) {
				this.insertLine();
				continue;
			}
			const ops = this.cursor.lineCursor.addLetter(letter);
			totalOps.push(ops);
		}
		setTimeout(() => {
			this.cursor.setCursor = {
				line: this.cursor.lineCursor,
				letter: this.cursor.letterCursor,
			};
		}, 0);
		return () => {
			totalOps.map((func) => func());
		};
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
		const ops = this.deleteLines(
			this.cursor.lineCursor,
			this.cursor.lineCursor
		);
		let cursorPos: Line | null = this.cursor.lineCursor.prevLine;
		return () => {
			if (!cursorPos) {
				cursorPos = this.editorHead;
			}
			this.cursor.setCursor = {
				line: cursorPos,
				letter: cursorPos.lineTail,
			};
			this.insertLine();
			ops();
		};
	}

	get getCursorPosition() {
		let nthPosition = 0;
		let temp: Letter | null = this.cursor.lineCursor.lineHead;
		while (temp && temp !== this.cursor.letterCursor) {
			temp = temp.nextLetter;
			nthPosition++;
		}
		return nthPosition;
	}

	initializeEditorContent(content: string) {
		let linesInserted = 0,
			lettersInserted = 0;
		for (const letter of content) {
			if (isLineBreak(letter)) {
				this.insertLine();
				linesInserted++;
				continue;
			}
			lettersInserted++;
			this.cursor.lineCursor.addLetter(letter);
		}
		this.totalLetterCount = lettersInserted;
		this.totalLineCount = linesInserted;
		// document.dispatchEvent(
		// 	new CustomEvent('onupdatelettercount', {
		// 		detail: {
		// 			operation: 'INC',
		// 			count: content.replace('\n', '').length,
		// 		},
		// 	})
		// );
		// document.dispatchEvent(
		// 	new CustomEvent('onupdatelinecount', {
		// 		detail: {
		// 			operation: 'INC',
		// 			count: linesInserted,
		// 		},
		// 	})
		// );
		// this.cursor.setCursor = {
		// 	line: this.cursor.lineCursor,
		// 	letter: this.cursor.letterCursor,
		// };
	}

	get getAllContent() {
		let head: Line | null = this.editorHead,
			totalContent = '';
		while (head) {
			let letter: Letter | null = head.lineHead,
				text = '';
			while (letter) {
				text += letter.text;
				letter = letter.nextLetter;
			}
			if (text) text += '\n';
			totalContent += text;
			head = head.nextLine;
		}
		return totalContent;
	}

	handleLineBreaks(containerWidth: number) {
		/**
		 *  - unlink overflowed character from the line 
			- insert it to the beginning of the next line
			- if the next line is overflowed because of the character's inserted
			- unlink the overflowed characters of the next line
			- do this until the no-more line's are overflowing
		 */
		function getCharacterCount(line: Line) {
			let letterPtr: Letter | null = line.lineHead,
				cnt = 0;
			while (letterPtr) {
				cnt++;
				letterPtr = letterPtr.nextLetter;
			}
			return cnt;
		}
		function getCharacterCountTillCursor(cursor: Cursor) {
			let letterPtr: Letter | null = cursor.lineCursor.lineHead,
				cnt = 0;
			while (letterPtr && letterPtr !== cursor.letterCursor) {
				cnt++;
				letterPtr = letterPtr.nextLetter;
			}
			return cnt;
		}

		let linePtr: Line | null = this.editorHead;
		const characterAllowed = Math.floor((containerWidth - 24) / 12);
		while (linePtr) {
			const overflowedCharacters = getCharacterCount(linePtr);
			if (overflowedCharacters - characterAllowed >= 0) {
				let letterPtr: Letter | null = linePtr.lineTail,
					cnt = overflowedCharacters - characterAllowed;
				let chars = '';
				while (letterPtr && cnt--) {
					chars += letterPtr.text;
					letterPtr = letterPtr.prevLetter;
				}
				if (letterPtr) {
					letterPtr.nextLetter = null;
					linePtr.lineTail = letterPtr;
				}
				let nextLine = linePtr.nextLine;
				if (!nextLine) {
					this.insertLine(linePtr);
					nextLine = linePtr.nextLine;
					if (nextLine) this.editorTail = nextLine;
				}

				if (nextLine) {
					for (const letter of chars) {
						nextLine.addLetter(letter, nextLine.lineHead);
					}
				}
			} else {
				// let canBeMoved = Math.abs(
				// 	overflowedCharacters - characterAllowed
				// );
				// const nextLine = linePtr.nextLine;
				// if (!nextLine) {
				// 	break;
				// }
				// console.log(overflowedCharacters, characterAllowed);
				// let letterPtr = nextLine?.lineHead.nextLetter;
				// let chars = '';
				// while (letterPtr && canBeMoved--) {
				// 	chars += letterPtr?.text;
				// 	letterPtr = letterPtr?.nextLetter;
				// }
				// if (letterPtr) nextLine.lineHead.nextLetter = letterPtr;
				// // let currLetterPtr = linePtr.lineTail;
				// for (const letter of chars) {
				// 	linePtr.addLetter(letter, linePtr.lineTail);
				// }
			}
			linePtr = linePtr.nextLine;
		}

		// cursor movement to next line
		const overflowedCharacters = getCharacterCountTillCursor(this.cursor); // this is a problem
		if (overflowedCharacters - characterAllowed >= 0) {
			const nextLine: Line | null = this.cursor.lineCursor.nextLine;
			if (nextLine) {
				this.cursor.setCursor = {
					line: nextLine,
					letter: nextLine?.lineHead,
				};
			}
		}
	}

	/** Mouse Operations */

	moveCursorToNthLine(lineNo: number, textNo: number) {
		let linePtr = this.editorHead;
		while (lineNo--) {
			if (linePtr.nextLine) linePtr = linePtr.nextLine;
			else break;
		}
		this.cursor.setLineCursor = linePtr;
		let letterPtr = this.cursor.lineCursor.lineHead;
		while (textNo) {
			if (letterPtr.nextLetter) letterPtr = letterPtr.nextLetter;
			else break;
			textNo--;
		}
		this.cursor.setLetterCursor = letterPtr;
	}

	updateLetterSelectionOnMouseMove(
		startLine: number,
		endLine: number,
		startPosition: number,
		endPosition: number
	) {
		// console.log('line: ', startLine, endLine);
		// console.log('letter: ', startPosition, endPosition);

		function isMultine() {
			return Math.abs(startLine - endLine) > 0;
		}

		// if (dir === 'UP') {
		// 	let linePtr: Line | null = this.editorHead,
		// 		lineCnt = 0;
		// 	while (linePtr) {
		// 		this.selectionMode = true;
		// 		let head: Letter | null = linePtr.lineHead,
		// 			letterCnt = 1;
		// 		while (head) {
		// 			if (startLine === endLine) {
		// 				if (
		// 					lineCnt == startLine &&
		// 					letterCnt >= startPosition &&
		// 					letterCnt < endPosition
		// 				) {
		// 					// console.log(letterCnt, startPosition, endPosition);
		// 					head.isSelected = true;
		// 				}
		// 			} else if (lineCnt > startLine && lineCnt < endLine) {
		// 				head.isSelected = true;
		// 			} else if (
		// 				lineCnt == startLine &&
		// 				letterCnt >= startPosition
		// 			) {
		// 				head.isSelected = true;
		// 			} else if (lineCnt == endLine && letterCnt <= endPosition) {
		// 				head.isSelected = true;
		// 			}
		// 			head = head.nextLetter;
		// 			letterCnt++;
		// 		}
		// 		lineCnt++;
		// 		if (linePtr) linePtr = linePtr.nextLine; // this is a problem
		// 	}
		// 	return;
		// }
		let linePtr: Line | null = this.editorHead,
			lineCnt = 0;
		this.selectionMode = true;
		while (linePtr) {
			let head = linePtr.lineHead.nextLetter,
				letterCnt = 0; // 1 based indexing
			if (!(lineCnt >= startLine && lineCnt <= endLine)) {
				if (linePtr) linePtr = linePtr.nextLine; // this is a problem
				lineCnt++;
				while (head) {
					head.isSelected = false;
					head = head.nextLetter;
				}
				continue;
			}
			while (head) {
				/**
				 *
				 * If multiple lines are selected, don't do any letter cnt checks for intermediate lines
				 * first and last line should be handled differently
				 *
				 * first line
				 * 	- start position - startPosition
				 * 	- end position - end of the line
				 *
				 * last line
				 * 	- start position - start of the line
				 * 	- end position - endPosition
				 *
				 */
				if (lineCnt > startLine && lineCnt < endLine) {
					// intermediate lines
					head.isSelected = true;
				} else if (isMultine() && lineCnt == startLine) {
					// first line
					if (letterCnt >= startPosition) head.isSelected = true;
					else head.isSelected = false;
				} else if (isMultine() && lineCnt == endLine) {
					// last line
					if (letterCnt < endPosition) head.isSelected = true;
					else head.isSelected = false;
				} else if (
					startPosition <= letterCnt &&
					endPosition > letterCnt
				) {
					head.isSelected = true;
				} else {
					head.isSelected = false;
				}
				head = head.nextLetter;
				letterCnt++;
			}
			lineCnt++;
			if (linePtr) linePtr = linePtr.nextLine;
		}
	}

	updateLetterSelectionOnDoubleClick() {
		let letterPtr: Letter | null = this.cursor.letterCursor;
		while (letterPtr && !isSpecialCharacter(letterPtr.text)) {
			letterPtr.isSelected = true;
			letterPtr = letterPtr.prevLetter;
		}
		letterPtr = this.cursor.letterCursor;
		while (letterPtr && !isSpecialCharacter(letterPtr.text)) {
			letterPtr.isSelected = true;
			letterPtr = letterPtr.nextLetter;
		}
		if (letterPtr && letterPtr.prevLetter)
			this.cursor.setLetterCursor = letterPtr.prevLetter;
		else if (letterPtr) this.cursor.setLetterCursor = letterPtr;
		else this.cursor.setLetterCursor = this.cursor.lineCursor.lineTail;
		this.selectionMode = true;
	}

	selectAll() {
		let linePtr = this.editorHead;
		this.selectionMode = true;
		while (linePtr) {
			let letterPtr = linePtr.lineHead;
			while (letterPtr) {
				letterPtr.isSelected = true;
				if (letterPtr.nextLetter) letterPtr = letterPtr.nextLetter;
				else break;
			}
			if (linePtr.nextLine) linePtr = linePtr.nextLine;
			else break;
		}
		this.cursor.setCursor = {
			line: this.editorTail,
			letter: this.editorTail.lineTail,
		};
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
