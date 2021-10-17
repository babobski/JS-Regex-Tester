// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(
		vscode.commands.registerCommand('jsregextester.openJSRegexTester', async () => {
			const panel = vscode.window.createWebviewPanel(
				'JSRegexTester',
				'JS Regex Tester',
				vscode.ViewColumn.One,
				getWebviewOptions(context.extensionPath)
			);

			panel.title = 'JS Regex Tester';
			

			let referenceJSON = fs.readFileSync(path.join(context.extensionPath, 'media', 'js', 'reference.json'));
			let jsonAsString = referenceJSON.toString('utf8');

			panel.webview.onDidReceiveMessage(
				async message => {
					switch (message.command) {
						case 'view_opened':
							panel.webview.postMessage({
								command: 'getting_data',
								reference: JSON.stringify(jsonAsString),
							});
							break;
					}
				}
			);
			
			panel.iconPath = {light: vscode.Uri.file(path.join(context.extensionPath, 'media', 'icons/icon-light.svg')), dark: vscode.Uri.file(path.join(context.extensionPath, 'media', 'icons/icon-dark.svg'))};

			let htmlDoc = fs.readFileSync(path.join(context.extensionPath, 'media', 'JSRegexTester.html'));
			let docAsString = htmlDoc.toString('utf8');

			const nonce = getNonce();

			const styleMainPath = vscode.Uri.file(
				path.join(context.extensionPath, 'media', 'css/style.css')
			);

			const styleMainUri = panel.webview.asWebviewUri(styleMainPath);	

			const scriptRegexColorizerPathOnDisk = vscode.Uri.file(
				path.join(context.extensionPath, 'media', 'js/regex-colorizer.min.js')
			);
	
			const scriptRegexColorizerUri = panel.webview.asWebviewUri(scriptRegexColorizerPathOnDisk);

			let replacements = {
				nonce: nonce,
				scriptRegexColorizerUri: scriptRegexColorizerUri.toString(),
				styleMainUri: styleMainUri.toString()
			};

			for (const [key, value] of Object.entries(replacements)) {
				let regEx = new RegExp('\\${' + key + '}', 'g');
				docAsString = docAsString.replace(regEx, value);
			}

			panel.webview.html = docAsString;
		})
	);
}

// this method is called when your extension is deactivated
export function deactivate() {}

function getWebviewOptions(extensionUri: string): vscode.WebviewOptions {
	return {
		// Enable javascript in the webview
		enableScripts: true,

		// And restrict the webview to only loading content from our extension's `media` directory.
		localResourceRoots: [
			vscode.Uri.file(
				path.join(extensionUri, 'media')
			),
		]
	};
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
