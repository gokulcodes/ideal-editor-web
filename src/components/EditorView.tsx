import editorContext from "@/controller/editorContext";
import { createElement, useEffect, useContext } from "react";
export default function EditorView() {
  const { state, dispatch } = useContext(editorContext);
  const editor = state.editor
  useEffect(() => {
    let line = editor.insertLine(editor.linePtr);
    let cursor = line.letterPtr;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Enter") {
        line = editor.insertLine(line);
        cursor = line.letterPtr;
        dispatch({ type: "type", payload: editor });
        return;
      }

      if (event.key === "ArrowLeft") {
        cursor = line.moveLetterPtr(-1);
        dispatch({ type: "type", payload: editor });
        return;
      }

      if (event.key === "ArrowRight") {
        cursor = line.moveLetterPtr(1);
        dispatch({ type: "type", payload: editor });
        return;
      }

      if (event.key === "ArrowUp") {
        line = editor.moveLinePtr(-1);
        cursor = line.letterPtr;
        dispatch({ type: "type", payload: editor });
        return;
      }

      if (event.key === "ArrowDown") {
        line = editor.moveLinePtr(1);
        cursor = line.letterPtr;
        dispatch({ type: "type", payload: editor });
        return;
      }

      if (cursor == null) {
        cursor = line.insertLetter(cursor, event.key);
        dispatch({ type: "type", payload: editor });
        return;
      }

      if (event.key === "Backspace") {
        cursor = line.deleteLettersFromStartToEnd(cursor, cursor);
        dispatch({ type: "type", payload: editor });
        return;
      }

      if (event.key === "Shift") {
        dispatch({ type: "type", payload: editor });
        return;
      }

      cursor = line.insertLetter(cursor, event.key);
      dispatch({ type: "type", payload: editor });
    }
    document.removeEventListener("keydown", handleKeyDown);
    document.addEventListener("keydown", handleKeyDown);
  }, [editor, dispatch]);

  function handleFocus() {
    navigator.virtualKeyboard.show()
  }

  return (
    <div contentEditable className="p-10" onFocus={handleFocus}>
      {editor.map(editor.line, (str: string) => {
        return createElement("p", { dangerouslySetInnerHTML: { __html: str } })
      })}
    </div>
  );
}

// const Lines = (props) => {
//   return useMemo(() => createElement("p", { dangerouslySetInnerHTML: { __html: props.str } }), [props]);
// }