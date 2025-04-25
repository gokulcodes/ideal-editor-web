import { ReactNode } from "react";
import Line from "./Line";
import Letter from "./Letter";

/**
 * Cursor class holds the line and letter position where the cursor blinker should be shown
 */
export class Cursor {
  lineCursor: Line;
  letterCursor: Letter;
  constructor(linePosition: Line, letterPosition: Letter) {
    this.lineCursor = linePosition;
    this.letterCursor = letterPosition;
  }
}

class Editor {
  editorHead: Line;
  editorTail: Line;
  cursor: Cursor;
  constructor() {
    this.editorHead = new Line(); // sential line node
    this.editorTail = this.editorHead;
    this.cursor = new Cursor(this.editorHead, this.editorHead.lineHead);
  }

  insertLine() {
    const newLine = new Line();

    // Linked new line next to current cursor line
    const currLine = this.cursor.lineCursor;
    const nextToCurrLine = currLine.nextLine;
    currLine.nextLine = newLine;
    newLine.prevLine = currLine;
    newLine.nextLine = nextToCurrLine;
    if(nextToCurrLine) nextToCurrLine.prevLine = newLine;

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
    this.cursor.lineCursor = newLine
    this.cursor.letterCursor = newLine.lineHead
  }

  moveCursor(keyEvent: KeyboardEvent) {
    switch (keyEvent.key) {
      case "ArrowUp":
        if (!this.cursor.lineCursor.prevLine) {
          // if there is no prevLine, don't do anything
          return;
        }
        this.cursor.lineCursor = this.cursor.lineCursor.prevLine;
        this.cursor.letterCursor = this.cursor.lineCursor.lineTail;
        break;
      case "ArrowDown":
        if (!this.cursor.lineCursor.nextLine) {
          // if there is no nextLine, don't do anything
          return;
        }
        this.cursor.lineCursor = this.cursor.lineCursor.nextLine;
        this.cursor.letterCursor = this.cursor.lineCursor.lineTail;
        break;
      case 'ArrowLeft':
        if (!this.cursor.letterCursor.prevLetter) {
          // if there is no previous letter, don't do anything
          if (this.cursor.lineCursor.prevLine) {
            this.cursor.lineCursor = this.cursor.lineCursor.prevLine;
            this.cursor.letterCursor = this.cursor.lineCursor.lineTail;
          }
          return;
        }
        this.cursor.letterCursor = this.cursor.letterCursor.prevLetter;
        break;
      case 'ArrowRight':
        if (!this.cursor.letterCursor.nextLetter) {
          // if there is no next letter, don't do anything
          if (this.cursor.lineCursor.nextLine) {
            this.cursor.lineCursor = this.cursor.lineCursor.nextLine;
            this.cursor.letterCursor = this.cursor.lineCursor.lineHead;
          }
          return;
        }
        this.cursor.letterCursor = this.cursor.letterCursor.nextLetter;
        break;
      default:
        console.log('No action to be performed')
    }
  }

  deleteLines(start: Line, end: Line) {
    const prev = start.prevLine;
    const next = end.nextLine;
    if (prev == null) {
      start.nextLine = next;
      if (next) next.prevLine = null;
      return;
    }

    if (next == null) {
      prev.nextLine = null;
      return;
    }

    prev.nextLine = next;
    next.prevLine = prev;
  }

  map(cb: (lineText: string, index: number) => ReactNode): Array<ReactNode> {
    const renderedLines: Array<ReactNode> = [];
    let editorHeadPtr : Line | null = this.editorHead;

    while (editorHeadPtr) {
      const currLineText = editorHeadPtr.map(editorHeadPtr, this.cursor);
      const htmlRenderedLine = cb(currLineText, renderedLines.length)
      renderedLines.push(htmlRenderedLine);
      editorHeadPtr = editorHeadPtr.nextLine;
    }

    return renderedLines;
  }

  isCursorMoveEvent(event: KeyboardEvent) {
    const events = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    return events.includes(event.key)
  }

  isIgnorableKeys(event: KeyboardEvent) {
    const events = ['Shift', 'Meta', 'Alt', 'Control', 'Escape', 'CapsLock'];
    return events.includes(event.key)
  }

}

export default Editor;
