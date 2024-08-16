import * as vscode from 'vscode';

let isEnabled = true; // Global state to track whether the extension is enabled
let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
	console.log('Auto Import on Paste extension is now active');

	// Create a status bar item
	statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.command = 'extension.toggleAutoImport';
	context.subscriptions.push(statusBarItem);

	// Register the toggle command
	let toggleCommand = vscode.commands.registerCommand('extension.toggleAutoImport', () => {
		isEnabled = !isEnabled;
		updateStatusBar();
	});
	context.subscriptions.push(toggleCommand);

	// Update the status bar for the first time
	updateStatusBar();

	// Event listener for text document changes
	let disposable = vscode.workspace.onDidChangeTextDocument(event => {
		if (!isEnabled) {
			console.log('Auto Import on Paste is disabled');
			return;
		}

		if (event.contentChanges.length > 0) {
			const change = event.contentChanges[0];
			if (change.text.includes('\n')) {
				handlePastedCode(event.document, change);
			}
		}
	});

	context.subscriptions.push(disposable);
}

async function handlePastedCode(document: vscode.TextDocument, change: vscode.TextDocumentContentChangeEvent) {
	if (document.languageId !== 'javascript' && document.languageId !== 'typescript') {
		console.log(`Unsupported language: ${document.languageId}`);
		return;
	}

	try {
		const pastedText = change.text;
		console.log('Pasted text:', pastedText);

		if (!pastedText || pastedText.trim() === '') {
			console.log('Pasted text is empty or whitespace only');
			return;
		}

		const functionCalls = extractFunctionCalls(pastedText);
		console.log('Extracted function calls:', functionCalls);

		if (functionCalls.length !== 1) {
			console.log(`Found ${functionCalls.length} functions. Only processing when there's exactly one function.`);
			return;
		}

		const func = functionCalls[0];
		if (!isAlreadyImported(document, func)) {
			console.log(`Attempting to import function: ${func}`);
			const endPosition = change.range.start.translate(change.text.split('\n').length - 1, change.text.split('\n').pop()!.length);
			await triggerSuggestionForFunction(document, func, change.range.start, endPosition);
		} else {
			console.log(`Function ${func} is already imported`);
		}
	} catch (error) {
		console.error('Error handling pasted code:', (error as any).message);
		vscode.window.showErrorMessage(`Error handling pasted code: ${(error as any).message}`);
	}
}


function extractFunctionCalls(text: string): string[] {
	const functionCallRegex = /\b(?!if|for|while|switch)(\w+)\s*\(/g;
	const matches = text.matchAll(functionCallRegex);
	const calls = [...new Set([...matches].map(match => match[1]))];
	const filteredCalls = calls.filter(call => !isBuiltInFunction(call));
	console.log('All function calls:', calls);
	console.log('Filtered function calls:', filteredCalls);
	return filteredCalls;
}

function isBuiltInFunction(func: string): boolean {
	const builtIns = ['console', 'parseInt', 'parseFloat', 'setTimeout', 'setInterval'];
	const result = builtIns.includes(func);
	console.log(`Is ${func} a built-in function? ${result}`);
	return result;
}

function isAlreadyImported(document: vscode.TextDocument, functionName: string): boolean {
	const fullText = document.getText();
	const importRegex = new RegExp(`import.*\\b${functionName}\\b.*from`, 'g');
	const result = importRegex.test(fullText);
	console.log(`Is ${functionName} already imported? ${result}`);
	return result;
}

async function triggerSuggestionForFunction(document: vscode.TextDocument, functionName: string, startPosition: vscode.Position, endPosition: vscode.Position) {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		console.log('No active text editor');
		return;
	}

	await vscode.window.withProgress({
		location: vscode.ProgressLocation.Notification,
		title: `Importing ${functionName}...`,
		cancellable: false
	}, async (progress) => {
		const functionIndex = document.getText().indexOf(functionName, document.offsetAt(startPosition));
		console.log(`Function ${functionName} found at index: ${functionIndex}`);
		const functionPosition = document.positionAt(functionIndex + functionName.length);
		editor.selection = new vscode.Selection(functionPosition, functionPosition);

		const isImportAdded = () => {
			const fullText = editor.document.getText();
			const importRegex = new RegExp(`import.*\\b${functionName}\\b.*from`, 'g');
			return importRegex.test(fullText);
		};

		const attemptAcceptSuggestion = async (maxAttempts: number = 5, delay: number = 100): Promise<boolean> => {
			for (let attempt = 1; attempt <= maxAttempts; attempt++) {
				console.log(`Attempt ${attempt} to accept suggestion for ${functionName}`);
				await vscode.commands.executeCommand('acceptSelectedSuggestion');

				if (isImportAdded()) {
					console.log(`Successfully imported function: ${functionName}`);
					return true;
				}

				await new Promise(resolve => setTimeout(resolve, delay));
				progress.report({ increment: (100 / maxAttempts) * attempt });
			}
			return false;
		};

		await vscode.commands.executeCommand('editor.action.triggerSuggest');

		let success = await attemptAcceptSuggestion(1, 0);
		if (!success) {
			success = await attemptAcceptSuggestion(15, 100);
		}

		if (!success) {
			console.log(`Failed to import function: ${functionName} after multiple attempts`);
			vscode.window.showErrorMessage(`Failed to import function: ${functionName}`);
		}

		// Move cursor to the end of the pasted code
		const finalPosition = new vscode.Position(endPosition.line + 1, endPosition.character);
		editor.selection = new vscode.Selection(finalPosition, finalPosition);
	});
}


function updateStatusBar() {
	if (isEnabled) {
		statusBarItem.text = `Auto Import: $(check) `;
		statusBarItem.tooltip = `Click to disable Auto Import on Paste`;
	} else {
		statusBarItem.text = `Auto Import: $(x) `;
		statusBarItem.tooltip = `Click to enable Auto Import on Paste`;
	}
	statusBarItem.show();
}

export function deactivate() {
	console.log('Auto Import on Paste extension is now deactivated');
}
