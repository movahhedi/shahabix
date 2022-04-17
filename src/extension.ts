import path = require("path");
import * as vscode from "vscode";

var config = vscode.workspace.getConfiguration('shahabix');
var myStatusBarItem: vscode.StatusBarItem | null = null;

function updateStatusBar() {
	config = vscode.workspace.getConfiguration('shahabix');

	if (myStatusBarItem === null) {
		myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, -1);
		myStatusBarItem.text = 'Shahabix';
		myStatusBarItem.command = 'shahabix.revealFile';
	}

	let textEditor = vscode.window.activeTextEditor;
	if (textEditor && textEditor.document && ! textEditor.document.isUntitled) {
		var filePath = textEditor.document.fileName;
		if ( ! config.statusBar.showFullPath) {
			filePath = vscode.workspace.asRelativePath(textEditor.document.fileName);
			filePath = path.normalize(filePath);
		}
		myStatusBarItem.tooltip = 'Reveal file';
		myStatusBarItem.text = filePath;
		myStatusBarItem.show();
	}
	else {
		myStatusBarItem.text = '';
		myStatusBarItem.hide();
	}

	return myStatusBarItem;
}

function revealFile() {
	vscode.commands.executeCommand("revealFileInOS");
}

function revealRootFolder() {
	let workspaceFolder: vscode.Uri | undefined;
	if (vscode.window.activeTextEditor !== undefined && ! vscode.window.activeTextEditor.document.isUntitled) {
		// workspaceFolder = vscode.window.activeTextEditor.document.uri;
		workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.window.activeTextEditor.document.uri)?.uri;
	}
	else if (vscode.workspace.workspaceFolders !== undefined) {
		workspaceFolder = vscode.workspace.workspaceFolders[0].uri;
	}
	else if (vscode.workspace.workspaceFile) {
		workspaceFolder = vscode.workspace.workspaceFile;
	}
	else {
		vscode.window.showInformationMessage("There are no folders to open in the workspace.");
	}
	if (workspaceFolder !== undefined) {
		vscode.env.openExternal(workspaceFolder);
	}
}

export function activate(context: vscode.ExtensionContext) {
	console.log("Hi, Shahabix is running as smooth as your breakfast orange juice!");
	config = vscode.workspace.getConfiguration('shahabix');

	let disposable;

	if (config.statusBar.enableShowPath) {
		myStatusBarItem = updateStatusBar();
		context.subscriptions.push(myStatusBarItem);
	
		disposable = vscode.window.onDidChangeActiveTextEditor(updateStatusBar);
		context.subscriptions.push(disposable);
	
		disposable = vscode.workspace.onDidSaveTextDocument(updateStatusBar);
		context.subscriptions.push(disposable);

		disposable = vscode.workspace.onDidRenameFiles(updateStatusBar);
		context.subscriptions.push(disposable);

		disposable = vscode.workspace.onDidChangeConfiguration(updateStatusBar);
		context.subscriptions.push(disposable);

		updateStatusBar();
	}

	disposable = vscode.commands.registerCommand("shahabix.revealFile", revealFile);
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand("shahabix.revealRootFolder", revealRootFolder);
	context.subscriptions.push(disposable);
}

export function deactivate() {}

