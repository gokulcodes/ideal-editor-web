import editorContext from "@/controller/editorContext";
import { createElement, useEffect, useContext, useRef } from "react";

export default function EditorView() {
  const { state, dispatch } = useContext(editorContext);
  const editor = state.editor
  const inputRef = useRef(null)
  useEffect(() => {
    let line = editor.insertLine(editor.linePtr);
    let cursor = line.letterPtr;
    // window['editor'] = editor
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
        cursor = line.insertLetter(editor, cursor, event.key);
        dispatch({ type: "type", payload: editor });
        return;
      }
  
      if (event.key === "Backspace") {
        cursor = line.deleteLettersFromStartToEnd(editor, editor.linePtr, cursor, cursor);
        console.log(cursor);
        dispatch({ type: "type", payload: editor });
        return;
      }
  
      if (event.key === "Shift") {
        dispatch({ type: "type", payload: editor });
        return;
      }
  
      cursor = line.insertLetter(editor, cursor, event.key);
      dispatch({ type: "type", payload: editor });
    }
    document.removeEventListener("keydown", handleKeyDown);
    document.addEventListener("keydown", handleKeyDown);
  }, [editor, dispatch]);
  
  function handleFocus() {
  }

  return (
    <div className="p-10 relative cursor-text ">
      {editor.map(editor.line, (str: string, active: boolean) => {
        return createElement("p", {className: `flex justify-start text-start ${active ? "" : ""}`, dangerouslySetInnerHTML: { __html: str } })
      })}
      <input ref={inputRef} autoFocus onClick={handleFocus} className="opacity-0 h-full w-full bg-white absolute top-0 left-0"  />
    </div>
  );
}

// const Lines = (props) => {
//   return useMemo(() => createElement("p", { dangerouslySetInnerHTML: { __html: props.str } }), [props]);
// }