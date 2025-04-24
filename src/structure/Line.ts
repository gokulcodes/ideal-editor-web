import Editor from "./Editor";
import Letter from "./Letter";
// import { LetterType } from "./types";

class Line {
  letter: Letter | null;
  letterPtr: Letter;
  nextLine: Line | null;
  prevLine: Line | null;
  constructor()  {
    this.letter = new Letter('');
    this.letterPtr = this.letter;
    this.nextLine = null;
    this.prevLine = null;
  }

  moveLetterPtr(dir: number) {
    console.log(this.letterPtr)
    if (dir === -1) { // left
      if(this.letterPtr?.prevLetter) this.letterPtr = this.letterPtr?.prevLetter;
      return this.letterPtr;
    } 

    if(this.letterPtr?.nextLetter) this.letterPtr = this.letterPtr?.nextLetter; 
    return this.letterPtr
  }

  insertLetter(line : Editor, currPtr: Letter | null, val: string): Letter {
    const newLetter = new Letter(val);
    if (!currPtr) {
      this.letter = newLetter;
      this.letterPtr = this.letter
      return this.letterPtr;
    }
    const nextAvailableLetter = currPtr.nextLetter;
    currPtr.nextLetter = newLetter;
    newLetter.prevLetter = currPtr;
    newLetter.nextLetter = nextAvailableLetter;
    this.letterPtr = newLetter;
    line.linePtr.letterPtr = this.letterPtr;
    // this.letterPtr = line.linePtr.letterPtr
    // this.letter.nextLetter = newLetter;
    // newLetter.prevLetter = this.letter;
    return line.linePtr.letterPtr
  }

  deleteLettersFromStartToEnd(line : Editor, linePtr: Line, start: Letter, end: Letter) : Letter {
    const prev = start.prevLetter;
    const next = end.nextLetter;
    if (prev == null) {
      // delete current line and connect the remaining text to previous line's end

      const prevLine = linePtr.prevLine;
      if (prevLine) {
        prevLine.letterPtr.nextLetter = next;
        if (next) next.prevLetter = prevLine.letterPtr.nextLetter;
        const nextLine = linePtr.nextLine;
        prevLine.nextLine = nextLine;
        line.linePtr = prevLine;
      }

      return line.linePtr.letterPtr;
    }

    if (next == null) {
      prev.nextLetter = null;
      this.letterPtr = prev;
      return this.letterPtr;
    }

    prev.nextLetter = next
    next.prevLetter = prev;
    this.letterPtr = prev;
    return this.letterPtr;
  }


  map(ptr: Letter | null, itrLine : Line,  activeLine: Line) {
    let str = ""
    while (ptr) {
      str += ptr.text
      if (this.letterPtr === ptr && activeLine === itrLine) {
        str += "<span class='animate-cursor font-light text-shadow-2xs text-shadow-white/40 text-2xl -mt-[7px] mb-0 overflow-hidden tracking-tighter white'>|</span>"
      }
      ptr = ptr.nextLetter
    }
    return str;
  }
}

export default Line;
