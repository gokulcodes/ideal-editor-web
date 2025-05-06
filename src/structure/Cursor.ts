import Letter from './Letter';
import Line from './Line';

/**
 * Cursor class holds the line and letter position where the cursor blinker should be shown
 */
export default class Cursor {
	lineCursor: Line;
	letterCursor: Letter;
	constructor(linePosition: Line, letterPosition: Letter) {
		this.lineCursor = linePosition;
		this.letterCursor = letterPosition;
	}

	set setLineCursor(nextLineUpdate: Line) {
		// it will act like a middleware. whenever any update happens to line cursor, render the ui
		this.lineCursor = nextLineUpdate;
		setTimeout(() => {
			document.dispatchEvent(new CustomEvent('oncursormove'));
		}, 0);
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
		setTimeout(() => {
			document.dispatchEvent(new CustomEvent('oncursormove'));
		}, 0);
	}
}
