import Editor from "@/structure";
import { createContext } from "react";

export const editorState = {
  editor: new Editor(),
};

interface ActionType {
  type: string,
  payload: unknown
}

interface EditorStateType{
  editor: Editor
}

export const reducer = (state : EditorStateType, action : ActionType) => {
  switch (action.type) {
    case "type":
      return { ...state, editor: action.payload };
  }
};

const editorContext = createContext();

export default editorContext;
