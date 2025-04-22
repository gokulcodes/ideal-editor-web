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

## Algorithm
* Letter & Line storing technique - LinkedList

```
class Line{
    sentence: Letter
    nextLine: Pointer
    prevLine: Pointer
}

class Letter{
    text: <All keyboard supported letter>
    nextLetter: Pointer
    prevLetter: Pointer
}
```