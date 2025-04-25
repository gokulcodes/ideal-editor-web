![Ideal poster](https://github.com/gokulcodes/ideal-web/blob/main/public/poster.png?raw=true)

# ideal
A minimal, fast, and distraction-free text editor built for the web. Perfect for taking quick notes, writing drafts, or capturing ideas on the go — all with seamless cloud storage.

## Requirements
* Files & Folders
* Image support
* Cloud / Local storage
* Focus Mode - You & Your Ideal Editor
* Typerace feature
* Next set of word suggession using AI
* All Text, Headings, List, Code, Table formating options
* Hierarchy preview
* Code editor mode
* Notes taking mode
* Search
* Virtualized line rendering

## Algorithm
* Letter & Line storing technique - N-Array Tree using LinkedList pointers

```
class Editor{
    head: Line
    linePtr: Line
}

class Line{
    letterHead: Letter
    letterPtr: Letter
    nextLine: Pointer
    prevLine: Pointer
}

class Letter{
    text: <All keyboard supported letter>
    nextLetter: Pointer
    prevLetter: Pointer
}
```

### Basic text editing functionalities with keyboard:
Delete:
* Delete a character at the end
* Delete a character at the middle
* Delete a character at beginning of the line
* Delete at the beginning of the line 
    - deletes the current and then move the content from current line to it's previous line
    - Moves the cursor the previous line and before the current line's first word

Insert Character
* Insert a character at beginning of the line
* Insert a character at the end of the line
* Insert a character at the middle of the line
* Insert multiple spaces between text
* Insert tabs between / start / end of the line

Insert Line
* Insert a new line by doing enter key
* create a new line by doing cmd + c if the clipboard content has line breaks
* Insert a new line by keeping the cursor in the middle of the line
    * Move the content of the current line next to the cursor to the new line created next to it
* Multiple empty lines

Cursor movements:
* Left arrow moves the cursor to one position left in the current line
* Right arrow moves the cursor to one position right in the current line
* Move the cursor to beginning of the paragraph. Do left key now. Move the cursor to previous line's end letter
* Move the cursor to end of the line, do right key. move the cursor to next line's beginning
* After deleting a text / deleting a line cursor movement should be normal. It should'nt jump or stay at the same place on any movement key presses

Select group of letters & lines
* Press Shift + Left arrow 
    - Select letter from current cursor point to leftmost cursor movement
    - If we reach the beginning of the line, keep moving the selection space to previous line and so on
* Press Shift + Right arrow - Select letter from current cursor point to leftmost cursor movement
    - Select letter from current cursor point to rightmost cursor movement
    - If we reach the end of the line, keep moving the selection space to next line and so on

Note: Write all this function to be modular enough to be used in mouse movements

Special keyboard actions
* Cmd + C 
    - if any selection is made, Copy the selection
    - if no selection, copy the current line content to clipboard
* Cmd + A
    - Select the entire text from top to bottom
* Cmd + V
    - Insert whatever in the clipboard next to the current cursor point
* Cmd + X 
    - Copy the active line content to clipboard. It deletes the current line and join previous line & next line
* Cmd + A > Delete
    - Delete the entire selected text
* Cmd + A > Cmd + V
    - Delete the entire selected text and insert the content from clipboard from deleted position
* Home / Cmd + Left 
    - Move to last word break or character position
* End / Cmd + Right
    - Move to next word break or character position
* Cmd + Up / Home
    - Move to beginning of the whole line
* Cmd + Right / Home
    - Move to end of the whole line
* Tabs
    - Insert a tab space from the cursor point

* Only allow AlphaNumeric, Special Characters & Emojis inside editor view
