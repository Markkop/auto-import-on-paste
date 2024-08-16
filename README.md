# 📩 Auto Import on Paste README

This extension automatically attempts to import functions when you paste code containing a function call that is not yet imported.  
Useful for javascript projects where you find yourself copying and pasting functions too many times and need to import it every time manually

https://marketplace.visualstudio.com/items?itemName=mark-kop.auto-import-on-paste

## Features

- **Auto Import Detection**: Automatically detects when a function is pasted into your code and tries to import it.
- **Language Support**: Currently supports JavaScript and TypeScript files.
- **Status Bar Control**: Easily enable or disable the extension directly from the VS Code status bar.

![image](https://github.com/user-attachments/assets/b996c6a9-775c-4076-9abc-a62b710d7b18)

### Demo

![extension](https://github.com/user-attachments/assets/84aa1002-ca7e-4e44-82ba-dba83cd87b9b)

## Requirements

No specific requirements or dependencies are needed to use this extension.

## Usage

It detects the function, checks if it is already imported, goes to the end of the function name, calls VSCode suggestions, and applies the first one.  
It will be triggered by any code change, not only pasted code.  
It is limited to only do that if only one function is detected. We can make it cover multiple functions, but it might take more time and be inconvenient. 


