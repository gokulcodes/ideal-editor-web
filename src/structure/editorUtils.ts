export function isLineBreak(character: string): boolean {
	if (character === '\n') return true;
	return false;
}

export function isSpecialCharacter(character: string): boolean {
	const regex = RegExp(/[^a-zA-Z0-9]/g);
	return regex.test(character);
}

export function isMobileDevice(): boolean {
	return (
		typeof window !== 'undefined' &&
		/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
			window.navigator.userAgent
		)
	);
}
