import Editor from "./Editor";
// import { EditorType } from "./types";
// import Line from "./Line";
// import { EditorType } from "./types";

// const editor : Editor = new Editor();
// let line = editor.insertLine(editor.line);
// let curr = line.insertLetter(line.letter, "H");
// curr = line.insertLetter(curr, "A");
// curr = line.insertLetter(curr, "R");
// curr = line.insertLetter(curr, "I");
// curr = line.insertLetter(curr, "N");
// line.insertLetter(curr, "I");

// const newLine = editor.insertLine(line);
// let curr1 = newLine.insertLetter(newLine.letter, "G");
// const curr3 = line.insertLetter(curr1, "O");
// const curr4 = line.insertLetter(curr3, "K");
// const curr5 = line.insertLetter(curr4, "U");
// const curr6 = line.insertLetter(curr5, "L");
// curr1 = line.insertLetter(curr6, "R");
// curr1 = line.insertLetter(curr1, "A");
// curr1 = line.insertLetter(curr1, "D");
// curr1 = line.insertLetter(curr1, "A");
// line.insertLetter(curr1, "N");
// line.deleteLettersFromStartToEnd(curr3, curr1)
// // console.log(curr)

// const newNewLine = editor.insertLine(newLine);
// let curr2 = newNewLine.insertLetter(newNewLine.letter, "K");
// curr2 = line.insertLetter(curr2, "A");
// curr2 = line.insertLetter(curr2, "V");
// line.insertLetter(curr2, "I");
// // line.insertLetter(curr2, "L");
// editor.deleteLineFromStartToEnd(newLine, newNewLine)

// while (line) {
//     let currLine = line.letter;
//     let lineStr = "";
//     while (currLine) {
//         lineStr += currLine.text
//         // console.log(currLine.text)
//         currLine = currLine.nextLetter
//     }
//     console.log(lineStr)
//     if (line && line.nextLine) {
//         line = line.nextLine
//     }else break
// }

export default Editor
