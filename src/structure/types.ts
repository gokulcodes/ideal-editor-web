type LetterType = {
    text: string;
    nextLetter: LetterType;
    prevLetter: LetterType;
}

type LineType = {
    letter : LetterType;
    nextLine : LineType;
    prevLine: LineType;
    insertLetter: Function,
    deleteLetter: Function
}

type EditorType = {
    line: LineType,
    insertLine: Function,
    deleteLine: Function
}

export type {
    LetterType,
    LineType,
    EditorType
}