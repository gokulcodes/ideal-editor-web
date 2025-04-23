// import { LineType } from "./types"
import { ReactNode } from "react";
import Line from "./Line";
class Editor {
  line: Line | null;
  linePtr: Line;
  constructor() {
    this.line = new Line();
    this.linePtr = this.line
  }

  moveLinePtr(dir : number) : Line {
    if (dir == -1) { // up
      if(this.linePtr?.prevLine) this.linePtr = this.linePtr?.prevLine;
      return this.linePtr;
    }

    if(this.linePtr?.nextLine) this.linePtr = this.linePtr?.nextLine;
    return this.linePtr;
  }

  insertLine(currLine: Line | null) {
    const newLine: Line = new Line();
    if (!currLine) {
      this.line = newLine
      this.linePtr = this.line;
      return this.linePtr;
    }
    const nextAvailableLine = currLine.nextLine
    currLine.nextLine = newLine;
    newLine.prevLine = currLine;
    newLine.nextLine = nextAvailableLine;
    this.linePtr = newLine;
    // this.line.nextLine = newLine;
    // newLine.prevLine = this.line;
    return this.linePtr;
  }

  deleteLineFromStartToEnd(start: Line, end: Line) {
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

    prev.nextLine = next
    next.prevLine = prev;
  }

  map(ptr: Line | null, callback: Function) : Array<ReactNode> {
    const result: Array<ReactNode> = []
    while (ptr) {
      const currLineWords = ptr.map(ptr.letter, ptr, this.linePtr);
      result.push(callback(currLineWords));
      ptr = ptr.nextLine;
    }
    return result
  }

}

export default Editor;
