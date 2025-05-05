export function isLineBreak(character: string): boolean {
	if (character === '\n') return true;
	return false;
}

export function isSpecialCharacter(character: string): boolean {
	const regex = RegExp(/[^a-zA-Z0-9 ]/g);
	return regex.test(character);
}
