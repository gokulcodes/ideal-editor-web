"use client";
import EditorView from "@/components/EditorView";
import EditorContext, { editorState, reducer } from "../controller/editorContext"
import { useReducer } from "react";

export default function Home() {
  const [state, dispatch] = useReducer(reducer, editorState)
  
  return (
    <EditorContext.Provider value={{ state, dispatch }} >
      {/* <div className="w-full h-[100vh] flex items-start justify-start" > */}
        <EditorView />
      {/* </div> */}
    </EditorContext.Provider>
  );
}
