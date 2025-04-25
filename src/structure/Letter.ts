class Letter {
  text : string = "";
  nextLetter : Letter | null;
  prevLetter: Letter | null;
  constructor(val : string) {
    this.text = val;
    this.nextLetter = null;
    this.prevLetter = null;
  }
}

export default Letter;
