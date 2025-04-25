import editorContext from "@/controller/editorContext";
import {
  createElement,
  useEffect,
  useContext,
  memo,
  Fragment,
  useState,
} from "react";

export default function EditorView() {
  // const inputRef = useRef(null);
  const { state, dispatch } = useContext(editorContext);
  const [geometry, setGeometry] = useState<DOMRect>();
  const editor = state.editor;
  const cursor = editor.cursor;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (editor.isIgnorableKeys(event)) {
        return;
      }

      if (editor.isCursorMoveEvent(event)) {
        editor.moveCursor(event);
        dispatch({ type: "type", payload: editor });
        setTimeout(() => {
          const activeCursor = document.querySelector("#activeCursor");
          const geometry = activeCursor?.getBoundingClientRect();
          setGeometry(geometry);
        }, 0);
        return;
      }
      // Varadan
      if (event.key === "Enter") {
        editor.insertLine();
        dispatch({ type: "type", payload: editor });
        setTimeout(() => {
          const activeCursor = document.querySelector("#activeCursor");
          const geometry = activeCursor?.getBoundingClientRect();
          setGeometry(geometry);
        }, 0);
        return;
      }

      if (event.key === "Backspace") {
        cursor.lineCursor.deleteLetters(
          cursor,
          cursor.letterCursor,
          cursor.letterCursor
        );
        dispatch({ type: "type", payload: editor });
        setTimeout(() => {
          const activeCursor = document.querySelector("#activeCursor");
          const geometry = activeCursor?.getBoundingClientRect();
          setGeometry(geometry);
        }, 0);
        return;
      }

      cursor.lineCursor.addLetter(cursor, event.key);
      dispatch({ type: "type", payload: editor });

      setTimeout(() => {
        const activeCursor = document.querySelector("#activeCursor");
        const geometry = activeCursor?.getBoundingClientRect();
        setGeometry(geometry);
      }, 0);
    }
    const activeCursor = document.querySelector("#activeCursor");
    const geometry = activeCursor?.getBoundingClientRect();
    setGeometry(geometry);
    document.removeEventListener("keydown", handleKeyDown);
    document.addEventListener("keydown", handleKeyDown);
    // window.editor = editor
  }, [editor, cursor, dispatch]);
  // console.log(geometry)

  let cursorLeftPos = 0,
    cursorTopPos = 0,
    cursorHeight = 0;
  if (geometry) {
    cursorLeftPos = geometry.left + geometry.width;
    cursorTopPos = geometry.top;
    cursorHeight = geometry.height;
  }

  return (
    <div className="p-10 relative cursor-text ">
      {editor.map((htmlString: string, index: number) => (
        <Fragment key={index}>
          <LineComponent htmlString={htmlString} />
        </Fragment>
      ))}
      <div
        style={{
          left: `${cursorLeftPos}px`,
          top: `${cursorTopPos}px`,
          height: `${cursorHeight}px`,
        }}
        className="animate-cursor font-sans min-h-5 transform -scale-x-50 absolute w-[0.1px] bg-white mb-0 overflow-hidden tracking-tighter white"
      />
    </div>
  );
}

const LineComponent = memo((props: { htmlString: string }) =>
  createElement("pre", {
    className: "h-5 font-sans",
    dangerouslySetInnerHTML: { __html: props.htmlString },
  })
);
LineComponent.displayName = "LineComponent";
