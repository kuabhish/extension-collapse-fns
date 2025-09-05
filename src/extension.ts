import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('vaderCollapseFns.collapseAllFunctions', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage("No active editor found!");
            return;
        }

        // Fetch document symbols (functions, methods, classes, etc.)
        const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
            'vscode.executeDocumentSymbolProvider',
            editor.document.uri
        );

        if (!symbols) {
            vscode.window.showInformationMessage("No symbols found in this file!");
            return;
        }

        const functions: vscode.DocumentSymbol[] = [];

        // Recursively collect only functions and methods
        const gatherFunctions = (symbols: vscode.DocumentSymbol[]) => {
            for (const sym of symbols) {
                if (sym.kind === vscode.SymbolKind.Function || sym.kind === vscode.SymbolKind.Method) {
                    functions.push(sym);
                }
                if (sym.children.length > 0) {
                    gatherFunctions(sym.children);
                }
            }
        };
        gatherFunctions(symbols);

        // Fold each function
        for (const func of functions) {
            const range = func.range;
            editor.selection = new vscode.Selection(range.start, range.start);
            await vscode.commands.executeCommand('editor.fold');
        }

        vscode.window.showInformationMessage(`Collapsed ${functions.length} functions`);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
