import { ReactNode } from 'react';
import Line from './Line';
import Letter from './Letter';
import Cursor from './Cursor';
import { isLineBreak, isSpecialCharacter } from './editorUtils';

class Editor {
	editorHead: Line;
	editorTail: Line;
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

	insertLine() {
		const newLine = new Line(this);

		// Linked new line next to current cursor line
		const currLine = this.cursor.lineCursor;
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
		this.cursor.setCursor = { line: newLine, letter: newLine.lineHead };
		// this.cursor.letterCursor = ;
		if (!this.cursor.lineCursor.nextLine) {
			// Updating editorTail node once we insert a new line
			this.editorTail = this.cursor.lineCursor;
		}
		return () => {
			this.deleteLines(this.cursor.lineCursor, this.cursor.lineCursor);
		};
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
						this.cursor.lineCursor.addLetter(letter);
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
					this.cursor.lineCursor.addLetter(letter);
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
					this.cursor.lineCursor.addLetter(letter);
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
		for (const letter of content) {
			if (isLineBreak(letter)) {
				this.insertLine();
				continue;
			}
			this.cursor.lineCursor.addLetter(letter);
		}
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
			text += '\n';
			totalContent += text;
			head = head.nextLine;
		}
		return totalContent;
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
		while (textNo > 0) {
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
		endPosition: number,
		dir: string
	) {
		console.log('line: ', startLine, endLine);
		console.log('letter: ', startPosition, endPosition);
		console.log('direction: ', dir);

		if (dir === 'UP') {
			let linePtr: Line | null = this.editorHead,
				lineCnt = 0;
			while (linePtr) {
				this.selectionMode = true;
				let head: Letter | null = linePtr.lineHead,
					letterCnt = 1;
				while (head) {
					if (startLine === endLine) {
						if (
							lineCnt == startLine &&
							letterCnt >= startPosition &&
							letterCnt < endPosition
						) {
							// console.log(letterCnt, startPosition, endPosition);
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
				letterCnt = 1;
			while (head) {
				if (startLine === endLine) {
					if (
						lineCnt == startLine &&
						letterCnt > startPosition &&
						letterCnt <= endPosition
					) {
						// console.log(letterCnt, startPosition, endPosition);
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
