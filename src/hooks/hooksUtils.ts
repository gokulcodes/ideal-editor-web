export function isCursorMoveEvent(event: KeyboardEvent) {
	const events = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
	return events.includes(event.key);
}

export function isIgnorableKeys(event: KeyboardEvent) {
	const events = ['Shift', 'Meta', 'Alt', 'Control', 'Escape', 'CapsLock'];
	return events.includes(event.key);
}

export function isKeyboardShortcut(event: KeyboardEvent) {
	const keyVal = event.key.toLowerCase();
	const ctrlMetaKeys = new Set(['c', 'v', 'x', 'a', 'z', 'backspace']);
	if (event.metaKey || event.ctrlKey) {
		return ctrlMetaKeys.has(keyVal) || isCursorMoveEvent(event);
	}

	if (event.shiftKey && isCursorMoveEvent(event)) {
		return true;
	}

	if (keyVal === 'home' || keyVal === 'end') {
		return true;
	}

	if (event.altKey && (isCursorMoveEvent(event) || keyVal === 'backspace')) {
		return true;
	}

	return false;
}
