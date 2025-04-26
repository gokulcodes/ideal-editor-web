class Letter {
  text : string = "";
  nextLetter : Letter | null;
  prevLetter: Letter | null;
  isSelected: boolean;
  letterIndex: number;
  constructor(val : string, letterIndex: number = 0) {
    this.text = val;
    this.nextLetter = null;
    this.prevLetter = null;
    this.isSelected = false;
    this.letterIndex = letterIndex;
  }
}

export default Letter;
