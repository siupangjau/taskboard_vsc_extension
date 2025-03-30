// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import { FileService } from './services/fileService';
import { StorageService } from './services/storageService';
import { Board, BoardFile, BoardFileType, Column, TicketStatus } from './types';

let currentPanel: vscode.WebviewPanel | undefined = undefined;
let fileService: FileService | undefined = undefined;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Extension: TaskBoard is now active');

	fileService = new FileService();
	const storageService = new StorageService(context.workspaceState);

	const columnToCreate: Column[] = [
		{ id: 'todo' as TicketStatus, name: 'To Do', tickets: [] },
		{ id: 'in-progress' as TicketStatus, name: 'In Progress', tickets: [] },
		{ id: 'done' as TicketStatus, name: 'Done', tickets: [] }
	];

	const createNewBoard = async (): Promise<BoardFile> => {
		const fileType = await vscode.window.showQuickPick(
			['json', 'csv'] as BoardFileType[],
			{ placeHolder: 'Select file type for the new board' }
		);

		if (!fileType) {
			throw new Error('No file type selected');
		}

		const defaultUri = vscode.workspace.workspaceFolders?.[0]?.uri || vscode.Uri.file(context.extensionPath);
		const fileUri = await vscode.window.showSaveDialog({
			defaultUri: vscode.Uri.joinPath(defaultUri, `board.${fileType}`),
			filters: {
				'Board Files': [fileType]
			}
		});

		if (!fileUri) {
			throw new Error('No file location selected');
		}

		if (!fileService) {
			throw new Error('File service not initialized');
		}

		const initialBoard: Board = {
			columns: columnToCreate
		};

		await fileService.writeFile(fileUri.fsPath, initialBoard);

		return {
			path: fileUri.fsPath,
			type: fileType as BoardFileType,
			name: vscode.workspace.asRelativePath(fileUri)
		};
	};

	// Create New Board Command
	let createBoardCommand = vscode.commands.registerCommand('taskboard.createBoard', async () => {
		try {
			const boardFile = await createNewBoard();
			if (boardFile) {
				storageService.setLastOpenedFile(boardFile);
				vscode.commands.executeCommand('taskboard.showBoard');
			}
		} catch (error) {
			console.error('Error creating board:', error);
			vscode.window.showErrorMessage(`Error creating board: ${error}`);
		}
	});

	// Open Existing Board Command
	let openBoardCommand = vscode.commands.registerCommand('taskboard.openBoard', async () => {
		try {
			const fileUri = await vscode.window.showOpenDialog({
				canSelectFiles: true,
				canSelectFolders: false,
				canSelectMany: false,
				filters: {
					'Board Files': ['json', 'csv']
				}
			});

			if (!fileUri || fileUri.length === 0) {
				return;
			}

			const fileType = fileUri[0].fsPath.endsWith('.csv') ? 'csv' as const : 'json' as const;
			const boardFile: BoardFile = {
				path: fileUri[0].fsPath,
				type: fileType,
				name: vscode.workspace.asRelativePath(fileUri[0])
			};

			storageService.setLastOpenedFile(boardFile);
			vscode.commands.executeCommand('taskboard.showBoard');
		} catch (error) {
			console.error('Error opening board:', error);
			vscode.window.showErrorMessage(`Error opening board: ${error}`);
		}
	});

	// Show Board Command (modified to only show the current board)
	let showBoardCommand = vscode.commands.registerCommand('taskboard.showBoard', async () => {
		try {
			const boardFile = storageService.getLastOpenedFile();

			if (!boardFile) {
				const message = 'No board is currently open. Would you like to create a new one or open an existing one?';
				const choice = await vscode.window.showQuickPick(
					['Create New Board', 'Open Existing Board'],
					{ placeHolder: message }
				);

				if (!choice) {
					return;
				}

				if (choice === 'Create New Board') {
					vscode.commands.executeCommand('taskboard.createBoard');
				} else {
					vscode.commands.executeCommand('taskboard.openBoard');
				}
				return;
			}

			if (!fileService) {
				throw new Error('File service not initialized');
			}

			if (currentPanel) {
				currentPanel.reveal(vscode.ViewColumn.One);
			} else {
				currentPanel = vscode.window.createWebviewPanel(
					'kanbanBoard',
					'Kanban Board',
					vscode.ViewColumn.One,
					{
						enableScripts: true,
						retainContextWhenHidden: true
					}
				);

				const webviewJsUri = currentPanel.webview.asWebviewUri(
					vscode.Uri.joinPath(context.extensionUri, 'out', 'webview.js')
				);

				// Set up initial content
				currentPanel.webview.html = getWebviewContent(webviewJsUri);

				// Handle messages from the webview
				currentPanel.webview.onDidReceiveMessage(async (message) => {
					console.log('Received message from webview:', message);

					if (!fileService) {
						throw new Error('File service not initialized');
					}

					switch (message.type) {
						case 'boardUpdated':
							try {
								console.log('Saving board update:', message.board);
								await fileService.writeFile(boardFile.path, message.board);
								console.log('Board saved successfully');
							} catch (error) {
								console.error('Error saving board:', error);
								vscode.window.showErrorMessage(`Error saving board: ${error}`);
							}
							break;
						case 'requestBoardData':
							try {
								console.log('Loading board data from:', boardFile.path);
								const board = await fileService.readFile(boardFile.path) as Board;
								if (currentPanel) {
									currentPanel.webview.postMessage({
										type: 'boardData',
										board
									});
									console.log('Board data sent to webview');
								}
							} catch (error) {
								console.error('Error reading board:', error);
								if (currentPanel) {
									currentPanel.webview.postMessage({
										type: 'error',
										error: `Error reading board: ${error}`
									});
								}
							}
							break;
					}
				});

				// Watch for file changes
				fileService.watchFile(boardFile.path, async () => {
					try {
						if (!fileService) {
							throw new Error('File service not initialized');
						}
						const board = await fileService.readFile(boardFile.path) as Board;
						currentPanel?.webview.postMessage({
							type: 'boardData',
							board
						});
					} catch (error) {
						console.error('Error reading board:', error);
						vscode.window.showErrorMessage(`Error reading board: ${error}`);
					}
				});

				// Initial load
				try {
					const board = await fileService.readFile(boardFile.path) as Board;
					currentPanel.webview.postMessage({
						type: 'boardData',
						board
					});
				} catch (error) {
					console.error('Error reading initial board:', error);
					vscode.window.showErrorMessage(`Error reading board: ${error}`);
				}

				currentPanel.onDidDispose(() => {
					currentPanel = undefined;
					if (fileService) {
						fileService.dispose();
					}
				});
			}
		} catch (error) {
			console.error('Error showing board:', error);
			vscode.window.showErrorMessage(`Error showing board: ${error}`);
		}
	});

	context.subscriptions.push(createBoardCommand);
	context.subscriptions.push(openBoardCommand);
	context.subscriptions.push(showBoardCommand);
}

function getWebviewContent(webviewJsUri: vscode.Uri): string {
	const codiconsUri = currentPanel?.webview.asWebviewUri(
		vscode.Uri.joinPath(vscode.Uri.file(__dirname), '../node_modules/@vscode/codicons/dist/codicon.css')
	);

	return `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${currentPanel?.webview.cspSource} https:; script-src ${currentPanel?.webview.cspSource} 'unsafe-inline' 'unsafe-eval'; style-src ${currentPanel?.webview.cspSource} 'unsafe-inline'; font-src ${currentPanel?.webview.cspSource};">
			<title>Kanban Board</title>
			<link href="${codiconsUri}" rel="stylesheet" />
			<style>
				body {
					margin: 0;
					padding: 0;
					height: 100vh;
					overflow: hidden;
					background-color: var(--vscode-editor-background);
					color: var(--vscode-editor-foreground);
				}
				#root {
					height: 100vh;
				}
			</style>
			<script>
				const vscode = acquireVsCodeApi();
				window.vscode = vscode;
			</script>
		</head>
		<body>
			<div id="root"></div>
			<script src="${webviewJsUri}"></script>
		</body>
		</html>`;
}

// This method is called when your extension is deactivated
export function deactivate() {
	if (fileService) {
		fileService.dispose();
	}
}
