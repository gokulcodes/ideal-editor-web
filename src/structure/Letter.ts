class Letter {
	text: string = '';
	nextLetter: Letter | null;
	prevLetter: Letter | null;
	isSelected: boolean;
	constructor(val: string) {
		this.text = val;
		this.nextLetter = null;
		this.prevLetter = null;
		this.isSelected = false;
	}
}

export default Letter;
