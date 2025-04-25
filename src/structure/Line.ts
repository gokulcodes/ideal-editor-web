import { Cursor } from "./IdealEditor";
import Letter from "./Letter";

class Line {
  lineHead: Letter; // Beginning of the individual line[Don't confuse it with editorHead]
  lineTail: Letter; // End of the individual line[Don't confuse it with editorTail]
  nextLine: Line | null;
  prevLine: Line | null;
  constructor() {
    this.lineHead = new Letter(""); // sentinal letter node
    this.lineTail = this.lineHead;
    this.nextLine = null;
    this.prevLine = null;
  }

  /**
   * Add a letter next to cursor position
   * @param cursor 
   * @param value 
   */
  addLetter(cursor: Cursor, value: string) {
    const newLetter = new Letter(value);

    const letterPosition = cursor.letterCursor;
    
    // letterPosition can never be null because of our sentinal node
    // Beginning of the line
    // End of the line
    // Middle of the line
    
    const nextAvailableLetter = letterPosition.nextLetter; // store the next letter pointer for future use
    letterPosition.nextLetter = newLetter; // point current cursor's next letter to newly created letter
    newLetter.prevLetter = letterPosition; // point newly created letter's previous pointer to letterPosition
    newLetter.nextLetter = nextAvailableLetter; // link newLetter's nextLetter to previous next letter pointer
    if(nextAvailableLetter) nextAvailableLetter.prevLetter = newLetter;
    if (newLetter.nextLetter == null) {
      // End of the line
      cursor.lineCursor.lineTail = newLetter;
    }

    // After adding a new letter, update the cursor position
    cursor.letterCursor = newLetter;
  }

  /**
   * Delete's the letter from start to end exclusive
   * @param startPosition
   * @param endPosition
   */
  deleteLetters(cursor: Cursor, startPosition: Letter, endPosition: Letter) {
    const prevToStart = startPosition.prevLetter;
    const nextToEnd = endPosition.nextLetter;

    /**
     * What if prevToStart is Sential Node?
     */
    if (!prevToStart) {
      // Sentinal node deletion
      const nextAvailableLetter = startPosition;
      const currentLine = cursor.lineCursor;
      const prevToCurrLine = currentLine.prevLine;
      const nextToCurrLine = currentLine.nextLine;

      if (!prevToCurrLine) {
        // If it's editorHead node, don't make any move
        return;
      }
      const prevToCurrLineTail = prevToCurrLine.lineTail
      prevToCurrLine.lineTail.nextLetter = nextAvailableLetter; // move to remaining letters from currLine to prevLine's tailNode
      prevToCurrLine.nextLine = nextToCurrLine; // unlink the currLine
      
      if (nextAvailableLetter) {
        // If nextAvailableLetter is available, then only link it to previous line's tailNode
        // If not, no need to do anything
        nextAvailableLetter.prevLetter = prevToCurrLineTail;
      }
      
      prevToCurrLine.lineTail = currentLine.lineTail;
      cursor.lineCursor = prevToCurrLine;
      cursor.letterCursor = nextAvailableLetter;
      return;
    }

    /**
     * What if nextToEnd is null?
     */
    if (!nextToEnd) {
      prevToStart.nextLetter = null;
      cursor.letterCursor = prevToStart;
      return;
    }

    prevToStart.nextLetter = nextToEnd;
    nextToEnd.prevLetter = prevToStart;

    cursor.letterCursor = prevToStart;
  }

  map(currLine: Line, cursor: Cursor) {
    let lineText = "";
    let letterHeadPtr: Letter | null = this.lineHead;
    
    while (letterHeadPtr) {
      if (cursor.lineCursor === currLine && cursor.letterCursor === letterHeadPtr) {
        lineText += `<span id="activeCursor">${letterHeadPtr.text}</span>`
        // lineText +=
        //   "<span class='animate-cursor font-light text-shadow-2xs text-shadow-white/40 text-2xl -mt-[7px] mb-0 overflow-hidden tracking-tighter white'>|</span>";
      } else if (cursor.lineCursor === currLine && cursor.selectionPointer === letterHeadPtr) { 
        lineText += `<span id="selectedText">${letterHeadPtr.text}</span>`
      } else lineText += letterHeadPtr.text;
      letterHeadPtr = letterHeadPtr.nextLetter;
    }
    return lineText;
  }
}

export default Line;
