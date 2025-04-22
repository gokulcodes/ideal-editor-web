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

  moveLetterPtr(dir : number) {
    if (dir === -1) { // left
      if(this.letterPtr?.prevLetter) this.letterPtr = this.letterPtr?.prevLetter;
      return this.letterPtr;
    } 

    if(this.letterPtr?.nextLetter) this.letterPtr = this.letterPtr?.nextLetter; 
    return this.letterPtr
  }

  insertLetter(currPtr: Letter | null, val: string): Letter {
    const newLetter = new Letter(val);
    if (!currPtr) {
      this.letter = newLetter;
      this.letterPtr = this.letter
      return this.letterPtr
    }
    const nextAvailableLetter = currPtr.nextLetter;
    currPtr.nextLetter = newLetter;
    newLetter.prevLetter = currPtr;
    newLetter.nextLetter = nextAvailableLetter;
    this.letterPtr = newLetter;
    // this.letter.nextLetter = newLetter;
    // newLetter.prevLetter = this.letter;
    return this.letterPtr
  }

  deleteLettersFromStartToEnd(start: Letter, end: Letter) : Letter {
    const prev = start.prevLetter;
    const next = end.nextLetter;
    if (prev == null) {
      start.nextLetter = next;
      if (next) next.prevLetter = null;
      return start;
    }

    if (next == null) {
      prev.nextLetter = null;
      return prev;
    }

    prev.nextLetter = next
    next.prevLetter = prev;
    this.letterPtr = next;
    return next;
  }
}

export default Line;
