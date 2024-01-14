import { useEffect, useState } from "react";
import {
  Editor,
  EditorState,
  Modifier,
  RichUtils,
  convertFromRaw,
  convertToRaw,
} from "draft-js";
import "draft-js/dist/Draft.css";
import "./Editor.css";


export default function EditorComponent() {
  // Adding style for red color
  const mapStyle = {
    RED_TEXT: {
      color: "red",
    },
  };

  // setting editor state
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  // getting editor data from local storage
  useEffect(() => {
    const savedEditorData = getDataFromStorage();

    if (savedEditorData !== null) {
      const savedState = convertFromRaw(savedEditorData);
      setEditorState(EditorState.createWithContent(savedState));
    }
  }, []);

  // applying styles according to code secrets set 
  const applyBlockFormatting = (isInlineStyles: boolean, propertyVal: string) => {
    const selection = editorState.getSelection();
    const savedState = editorState.getCurrentContent();

    const newSavedState = Modifier.replaceText(
      savedState,
      selection.merge({
        anchorOffset: 0, 
        focusOffset: selection.getFocusOffset(),
      }),
      " "
    );
    const newEditorState = EditorState.push(
      editorState,
      newSavedState,
      "remove-range"
    );

    if (isInlineStyles) {
      setEditorState(RichUtils.toggleInlineStyle(newEditorState, propertyVal));
    } else {
      setEditorState(RichUtils.toggleBlockType(newEditorState, propertyVal));
    }
  };

  // saving data to localStorage
  const handleSaveEditorData = () => {
    const data = convertToRaw(editorState.getCurrentContent());
    localStorage.setItem("data", JSON.stringify(data));
    console.log('******* Data Saved *******')
  };

  // fetching data from localStorage
  const getDataFromStorage = () => {
    const savedData = localStorage.getItem("data");
    return savedData ? JSON.parse(savedData) : null;
  };

  // handling different key commands
  const handleKeyCommand = (command: string) => {
    const newEditorState = RichUtils.handleKeyCommand(editorState, command);

    if (newEditorState) {
      setEditorState(newEditorState);
      return "handled";
    }

    return "not-handled";
  };

  // setting command for different inputs
  const handleBeforeInput = (input: string) => {
    const selection = editorState.getSelection();
    const savedState = editorState.getCurrentContent();
    const blockKey = selection.getStartKey();
    const block = savedState.getBlockForKey(blockKey);
    const blockText = block.getText();
    // Applying styles for each case
    if (blockText.startsWith("#") && input === " ") {
      applyBlockFormatting(false, "header-one");
      return "handled";
    } else if (
      blockText.startsWith("*") &&
      blockText.length < 2 &&
      input === " "
    ) {
      applyBlockFormatting(true, "BOLD");
      return "handled";
    } else if (
      blockText.startsWith("**") &&
      blockText.length == 2 &&
      input === " "
    ) {
      applyBlockFormatting(true, "RED_TEXT");
      return "handled";
    } else if (blockText.startsWith("***") && input === " ") {
      applyBlockFormatting(true, "UNDERLINE");
      return "handled";
    }

    return "not-handled";
  };

  return (
    <div className='editor_container'>
      <div className='editor__header'>
        <div></div>
        <div className="editor__name">Demo File</div>
        <button className="btn__element" onClick={handleSaveEditorData}>Save</button>
      </div>
      <div className='rich_editor'>
        <Editor
          customStyleMap={mapStyle}
          editorState={editorState}
          onChange={setEditorState}
          handleKeyCommand={handleKeyCommand}
          handleBeforeInput={handleBeforeInput}
          placeholder="Welcome to Rich Editor, start here..."
        />
      </div>
      <div className="editor__rules">
          <div style={{ fontSize: '20px'}}><strong>NOTE :</strong></div>
          <div className="info__container">
            <code># :</code> 
            <div>Heading Text</div>
          </div>
          <div className="info__container">
            <code>* :</code> 
            <div><strong>Bold Text</strong></div>
          </div>
          <div className="info__container">
            <code>** :</code> 
            <div style={{ color: 'red'}}>Red color Text</div>
          </div>
          <div className="info__container">
            <code>*** :</code> 
            <div style={{ textDecoration: 'underline'}}>Underline Text</div>
          </div>
      </div>
    </div>
  );
};