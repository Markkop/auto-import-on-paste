# 📩 Auto Import on Paste README

This extension automatically attempts to import functions when you paste code containing a function call that is not yet imported.  
It detects the function, goes to the end of the function name, call VSCode suggestions and apply the first one.  
It will be triggered by any code change, not only pasted code.

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

## Extension Settings

This extension contributes the following settings:

- `autoImportOnPaste.enable`: Enable/disable the auto-import functionality. Toggle this from the status bar as well.
- `autoImportOnPaste.supportedLanguages`: List of languages that the extension supports. Defaults to JavaScript and TypeScript.
