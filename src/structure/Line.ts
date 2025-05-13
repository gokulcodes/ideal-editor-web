import { isLineBreak } from './editorUtils';
import Editor from './IdealEditor';
import Letter from './Letter';

class Line {
	lineHead: Letter; // Beginning of the individual line[Don't confuse it with editorHead]
	lineTail: Letter; // End of the individual line[Don't confuse it with editorTail]
	nextLine: Line | null;
	prevLine: Line | null;
	isUserInsertedLine: boolean;
	editor: Editor;
	constructor(editor: Editor, isUserInsertedLine: boolean = true) {
		this.lineHead = new Letter(''); // sentinal letter node
		this.lineTail = this.lineHead;
		this.nextLine = null;
		this.prevLine = null;
		this.isUserInsertedLine = isUserInsertedLine;
		this.editor = editor;
	}

	/**
	 * Add a letter next to cursor position
	 * @param cursor
	 * @param value
	 */
	addLetter(value: string) {
		const newLetter = new Letter(value);

		const letterPosition = this.editor.cursor.letterCursor;

		// letterPosition can never be null because of our sentinal node
		// Beginning of the line
		// End of the line
		// Middle of the line

		const nextAvailableLetter = letterPosition.nextLetter; // store the next letter pointer for future use
		letterPosition.nextLetter = newLetter; // point current cursor's next letter to newly created letter
		newLetter.prevLetter = letterPosition; // point newly created letter's previous pointer to letterPosition
		newLetter.nextLetter = nextAvailableLetter; // link newLetter's nextLetter to previous next letter pointer
		if (nextAvailableLetter) nextAvailableLetter.prevLetter = newLetter;
		if (newLetter.nextLetter == null) {
			// End of the line
			this.editor.cursor.lineCursor.lineTail = newLetter;
		}

		// After adding a new letter, update the cursor position
		this.editor.cursor.setLetterCursor = newLetter;

		return () => {
			this.deleteLetters(
				this.editor.cursor.letterCursor,
				this.editor.cursor.letterCursor
			);
		};
	}

	/**
	 * Delete's the letter from start to end exclusive
	 * @param startPosition
	 * @param endPosition
	 */
	deleteLetters(startPosition: Letter, endPosition: Letter) {
		const prevToStart = startPosition.prevLetter;
		const nextToEnd = endPosition.nextLetter;
		let stringToBeDeleted = '',
			temp: Letter | null = startPosition;
		while (temp && temp != endPosition.nextLetter) {
			stringToBeDeleted += temp.text;
			if (!temp.nextLetter) stringToBeDeleted += '\n';
			temp = temp.nextLetter;
		}
		/**
		 * What if prevToStart is Sential Node?
		 */
		if (!prevToStart) {
			// Sentinal node deletion
			const nextAvailableLetter = startPosition;
			const currentLine = this.editor.cursor.lineCursor;
			const prevToCurrLine = currentLine.prevLine;
			const nextToCurrLine = currentLine.nextLine;

			if (!prevToCurrLine) {
				// If it's editorHead node, don't make any move
				return () => {
					for (const letter of stringToBeDeleted) {
						if (isLineBreak(letter)) {
							this.editor.insertLine();
							continue;
						}
						this.addLetter(letter);
					}
				};
			}
			const prevToCurrLineTail = prevToCurrLine.lineTail;
			prevToCurrLine.lineTail.nextLetter = nextAvailableLetter; // move to remaining letters from currLine to prevLine's tailNode
			prevToCurrLine.lineTail = nextAvailableLetter;
			prevToCurrLine.nextLine = nextToCurrLine; // unlink the currLine
			if (nextToCurrLine) {
				nextToCurrLine.prevLine = prevToCurrLine;
			}

			if (nextAvailableLetter) {
				// If nextAvailableLetter is available, then only link it to previous line's tailNode
				// If not, no need to do anything
				nextAvailableLetter.prevLetter = prevToCurrLineTail;
			}

			prevToCurrLine.lineTail = nextAvailableLetter;
			this.editor.cursor.setCursor = {
				line: prevToCurrLine,
				letter: nextAvailableLetter,
			};
			return () => {
				for (const letter of stringToBeDeleted) {
					if (isLineBreak(letter)) {
						this.editor.insertLine();
						continue;
					}
					this.addLetter(letter);
				}
			};
		}

		/**
		 * What if nextToEnd is null?
		 */
		if (!nextToEnd) {
			prevToStart.nextLetter = null;
			this.editor.cursor.lineCursor.lineTail = prevToStart;
			this.editor.cursor.setLetterCursor = prevToStart;
			return () => {
				for (const letter of stringToBeDeleted) {
					if (isLineBreak(letter)) {
						this.editor.insertLine();
						continue;
					}
					this.addLetter(letter);
				}
			};
		}

		prevToStart.nextLetter = nextToEnd;
		nextToEnd.prevLetter = prevToStart;
		// console.log(prevToStart)
		this.editor.cursor.setLetterCursor = prevToStart;

		return () => {
			for (const letter of stringToBeDeleted) {
				if (isLineBreak(letter)) {
					this.editor.insertLine();
					continue;
				}
				this.addLetter(letter);
			}
		};
	}

	map(currLine: Line) {
		let lineText = '';
		let letterHeadPtr: Letter | null = this.lineHead;
		while (letterHeadPtr) {
			if (this.editor.selectionMode && letterHeadPtr.isSelected) {
				let selectedText = '';
				while (letterHeadPtr && letterHeadPtr.isSelected) {
					if (this.editor.cursor.letterCursor === letterHeadPtr) {
						selectedText += `<span class="pointer-events-none" id="activeCursor">${letterHeadPtr.text}</span>`;
					} else {
						selectedText += letterHeadPtr.text;
					}
					letterHeadPtr = letterHeadPtr.nextLetter;
				}
				lineText += `<span class="pointer-events-none selectedText">${selectedText}</span>`;
				if (letterHeadPtr) letterHeadPtr = letterHeadPtr.prevLetter;
			} else if (
				this.editor.cursor.lineCursor === currLine &&
				this.editor.cursor.letterCursor === letterHeadPtr
			) {
				lineText += `<span class="pointer-events-none" id="activeCursor">${letterHeadPtr.text}</span>`;
				// lineText +=
				//   "<span class='animate-cursor font-light text-shadow-2xs text-shadow-white/40 text-2xl -mt-[7px] mb-0 overflow-hidden tracking-tighter white'>|</span>";
			} else lineText += letterHeadPtr.text;
			if (letterHeadPtr) letterHeadPtr = letterHeadPtr.nextLetter;
		}
		return lineText;
	}
}

export default Line;
