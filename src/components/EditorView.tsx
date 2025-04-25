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

      if (event.key === "Tab") {
        cursor.lineCursor.addLetter(cursor, '\t');
        dispatch({ type: "type", payload: editor });
        setTimeout(() => {
          const activeCursor = document.querySelector("#activeCursor");
          const geometry = activeCursor?.getBoundingClientRect();
          setGeometry(geometry);
        }, 0);
        return;
      }
      
      function cb() {
        dispatch({ type: "type", payload: editor })
      }

      if (editor.isKeyboardShortcut(event)) {
        console.time('Keyboard Operations');
        editor.handleKeyboardShortcuts(cb, event).then(() => {
          setTimeout(() => {
            const activeCursor = document.querySelector("#activeCursor");
            const geometry = activeCursor?.getBoundingClientRect();
            setGeometry(geometry);
            console.timeEnd('Keyboard Operations');
          }, 100)
        })
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
    function handleClick(this: Document, event: MouseEvent) {
      console.log(event)
      if (!event || !event.target) {
        return;
      }
      const targetNode = event.target as HTMLElement
      const parentNode = targetNode.parentNode as HTMLElement;
      const lineNo = parseInt(parentNode.id.split('_')[1]);
      const textNo = parseInt(targetNode.id.split('_')[1]);
      editor.moveCursorToNthLine(lineNo, textNo);
      dispatch({ type: "type", payload: editor });
      setTimeout(() => {
        const activeCursor = document.querySelector("#activeCursor");
        const geometry = activeCursor?.getBoundingClientRect();
        setGeometry(geometry);
      }, 0)
    }
    const activeCursor = document.querySelector("#activeCursor");
    const geometry = activeCursor?.getBoundingClientRect();
    setGeometry(geometry);
    document.removeEventListener("keydown", handleKeyDown);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("click", handleClick);
    // window.editor = editor
  }, [editor, cursor,  dispatch]);
  // console.log(geometry)

  let cursorLeftPos = 0,
    cursorTopPos = 0,
    cursorHeight = 0;
  if (geometry) {
    cursorLeftPos = geometry.left + geometry.width;
    cursorTopPos = geometry.top;
    cursorHeight = geometry.height + 10;
  }

  return (
    <div className="p-10 relative cursor-text ">
      {editor.map((htmlString: string, index: number) => (
        <Fragment key={index}>
          <LineComponent lineIndex={index} htmlString={htmlString} />
        </Fragment>
      ))}
      <div
        style={{
          left: `${cursorLeftPos}px`,
          top: `${cursorTopPos}px`,
          height: `${cursorHeight}px`
        }}
        className="animate-cursor font-sans min-h-8 transform -scale-x-50 -mt-2 absolute w-[0.8px] bg-green-400 mb-0 overflow-hidden tracking-tighter white"
      />
    </div>
  );
}

const LineComponent = memo((props: { htmlString: string, lineIndex: number }) =>
  createElement("pre", {
    id: `line_${props.lineIndex}`,
    className: "h-8 text-xl font-sans",
    dangerouslySetInnerHTML: { __html: props.htmlString },
  })
);
LineComponent.displayName = "LineComponent";
