export function isLineBreak(character: string): boolean {
	if (character === '\n') return true;
	return false;
}

export function deepCopy(obj : object, hash = new WeakMap()) {
  if (Object(obj) !== obj) return obj; // primitives
  if (hash.has(obj)) return hash.get(obj); // circular reference
  
	const result = Array.isArray(obj) ? []
                : Object.create(Object.getPrototypeOf(obj));
  
  hash.set(obj, result);
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(result as any)[key] = deepCopy((obj as any)[key], hash);
	}
  }
  return result;
}