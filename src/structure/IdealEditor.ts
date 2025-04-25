import { ReactNode } from "react";
import Line from "./Line";
import Letter from "./Letter";
import { isLineBreak } from "./editorUtils";

/**
 * Cursor class holds the line and letter position where the cursor blinker should be shown
 */
export class Cursor {
  lineCursor: Line;
  letterCursor: Letter;
  selectionPointer: Letter | null;
  constructor(linePosition: Line, letterPosition: Letter) {
    this.lineCursor = linePosition;
    this.letterCursor = letterPosition;
    this.selectionPointer = null;
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

  moveCursor(keyEvent: KeyboardEvent) {
    switch (keyEvent.key) {
      case "ArrowUp":
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
        console.log(temp, nextPos)
        if (!temp) temp = this.cursor.lineCursor.lineTail;
        this.cursor.letterCursor = temp;
        break;
      case "ArrowDown":
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
      case "ArrowLeft":
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
      case "ArrowRight":
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
        console.log("No action to be performed");
    }
  }
  
  moveSelectionPointer(keyEvent: KeyboardEvent) {
    switch (keyEvent.key) {
      case "ArrowUp":
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
      case "ArrowDown":
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
      case "ArrowLeft":
        if (!this.cursor.letterCursor.prevLetter) {
          // if there is no previous letter, don't do anything
          if (this.cursor.lineCursor.prevLine) {
            this.cursor.lineCursor = this.cursor.lineCursor.prevLine;
            this.cursor.letterCursor = this.cursor.lineCursor.lineTail;
          }
          return;
        }
        if (!this.cursor.selectionPointer) {
          this.cursor.selectionPointer = this.cursor.letterCursor;
          return;
        }
        this.cursor.selectionPointer = this.cursor.selectionPointer.prevLetter;
        break;
      case "ArrowRight":
        if (!this.cursor.letterCursor.nextLetter) {
          // if there is no next letter, don't do anything
          if (this.cursor.lineCursor.nextLine) {
            this.cursor.lineCursor = this.cursor.lineCursor.nextLine;
            this.cursor.letterCursor = this.cursor.lineCursor.lineHead;
          }
          return;
        }
        if (!this.cursor.selectionPointer) {
          this.cursor.selectionPointer = this.cursor.letterCursor;
          return;
        }
        this.cursor.selectionPointer = this.cursor.selectionPointer.nextLetter;
        break;
      default:
        console.log("No action to be performed");
    }
  }

  deleteLines(start: Line, end: Line) {
    const prev = start.prevLine;
    const next = end.nextLine;
    if (prev == null) {
      start.nextLine = next;
      if (!next) { 
        this.editorHead = new Line(); // sential line node
        this.editorTail = this.editorHead;
        this.cursor = new Cursor(this.editorHead, this.editorHead.lineHead);
        return;
      }
      next.prevLine = null;
      this.editorHead = next;
      this.moveCursor(new KeyboardEvent("keydown", { key: 'ArrowDown' }));
      return;
    }

    if (next == null) {
      this.moveCursor(new KeyboardEvent("keydown", { key: 'ArrowUp' }));
      prev.nextLine = null;
      this.editorTail = prev;
      return;
    }

    this.moveCursor(new KeyboardEvent("keydown", { key: 'ArrowDown' }));
    prev.nextLine = next;
    next.prevLine = prev;
  }

  map(cb: (lineText: string, index: number) => ReactNode): Array<ReactNode> {
    const renderedLines: Array<ReactNode> = [];
    let editorHeadPtr: Line | null = this.editorHead;

    while (editorHeadPtr) {
      const currLineText = editorHeadPtr.map(editorHeadPtr, this.cursor);
      const htmlRenderedLine = cb(currLineText, renderedLines.length);
      renderedLines.push(htmlRenderedLine);
      editorHeadPtr = editorHeadPtr.nextLine;
    }

    return renderedLines;
  }

  isCursorMoveEvent(event: KeyboardEvent) {
    const events = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
    return events.includes(event.key);
  }

  isIgnorableKeys(event: KeyboardEvent) {
    const events = ["Shift", "Meta", "Alt", "Control", "Escape", "CapsLock"];
    return events.includes(event.key);
  }

  isKeyboardShortcut(event: KeyboardEvent) {
    if (event.metaKey) {
      if (event.key == "v") {
        return true;
      }
      if (event.key == "x") {
        return true;
      }
    } else if (event.shiftKey) {
      if (event.key === 'ArrowLeft') {
        return true;
      }
      if (event.key === 'ArrowRight') {
        return true;
      }
    }
    return false;
  }

  async handleKeyboardShortcuts(
    cb: () => void,
    event: KeyboardEvent
  ) {
    return new Promise(async (resolve) => {
      console.log(event);
      if (event.metaKey) {
        if (event.key == "c") {
          // copy the selection or line
        } else if (event.key == "v") {
          // paste content from clipboard
          const textContent = await navigator.clipboard.readText();
          console.log(textContent)
          for (const letter of textContent) {
            if (isLineBreak(letter)) {
              console.log(letter === `\n`)
              this.insertLine();
              continue
            }
            this.cursor.lineCursor.addLetter(this.cursor, letter);
          }
          cb();
          resolve("Success");
        } else if (event.key == 'x') {
          let currLineHead : Letter | null = this.cursor.lineCursor.lineHead;
          let text = '';
          while (currLineHead) {
            text += currLineHead.text
            currLineHead = currLineHead.nextLetter
          }
          navigator.clipboard.writeText(text)
          this.deleteLines(this.cursor.lineCursor, this.cursor.lineCursor)
          cb();
          resolve("Success");
        }
      } else if (event.shiftKey) {
        if (this.isCursorMoveEvent(event)) {
          this.moveSelectionPointer(event);
        }
        cb();
        resolve('success')
      }
    });
  }
}

export default Editor;
