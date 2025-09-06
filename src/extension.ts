import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    // Command to collapse all functions
    let collapseDisposable = vscode.commands.registerCommand('vaderCollapseFns.collapseAllFunctions', async () => {
        console.log('Collapse All Functions command triggered');
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            console.log('No active editor found');
            vscode.window.showInformationMessage("No active editor found!");
            return;
        }

        console.log(`Active editor found, language: ${editor.document.languageId}, file: ${editor.document.fileName}`);

        const text = editor.document.getText();
        const ranges: vscode.Range[] = [];

        // Regex for Python (def) and JS/TS (function)
        const isPython = editor.document.languageId === 'python';
        const regex = isPython
            ? /^([ ]*)def\s+(\w+)\s*\(([\s\S]*?)\)\s*(?:->\s*[\w\[\], ]+)?\s*:/gm
            : /^\s*(function)\s+(\w+)\s*(?:\((.*?)\))?\s*{/gm;


        console.log(`Using regex for ${isPython ? 'Python' : 'JS/TS'}`);

        let match;
        let matchCount = 0;
        while ((match = regex.exec(text)) !== null) {
            // // Calculate line number using positionAt for accuracy
            // const lineNum = editor.document.positionAt(match.index).line;
            // const line = editor.document.lineAt(lineNum);
            // // const symbolType = match[1]; // 'def' or 'function'
            // // const symbolName = match[2]; // function name
            // console.log(`debug -- line ${lineNum + 1}: ${line.text}`,  line,line.range);
            // // console.log(`Found ${symbolType} '${symbolName}' at line ${lineNum + 1}`);
            // ranges.push(line.range);
            // matchCount++;

            // Start line (where `def` begins)
            const startLineNum = editor.document.positionAt(match.index).line;

            // End line (where the regex finished, after `):`)
            const endPos = match.index + match[0].length;
            const endLineNum = editor.document.positionAt(endPos).line;

            const endLine = editor.document.lineAt(endLineNum);

            console.log(`Function starts at line ${startLineNum + 1}, ends at line ${endLineNum + 1}: ${endLine.text}`);

            ranges.push(endLine.range);
        }

        if (ranges.length === 0) {
            console.log('No functions found in the file');
            vscode.window.showInformationMessage("No functions found to collapse!");
            return;
        }

        console.log(`Total functions to collapse: ${matchCount}`);

        // Fold each detected function
        for (const range of ranges) {
            const startLine = range.start.line;
            const funcLine = editor.document.lineAt(startLine);
            const funcIndent = funcLine.firstNonWhitespaceCharacterIndex;

            // Find end line by checking indentation
            let endLine = startLine;
            for (let i = startLine + 1; i < editor.document.lineCount; i++) {
                const lineText = editor.document.lineAt(i).text;
                // Skip empty lines or comments
                if (lineText.trim() === '' || lineText.trim().startsWith('#')) continue;

                const indent = editor.document.lineAt(i).firstNonWhitespaceCharacterIndex;
                if (indent <= funcIndent) break; // Reached next block
                endLine = i;
            }

            if (endLine > startLine) {
                const foldRange = new vscode.Range(startLine, 0, endLine, editor.document.lineAt(endLine).text.length);
                editor.selection = new vscode.Selection(foldRange.start, foldRange.start);
                await vscode.commands.executeCommand('editor.fold');
                console.log(`Folding function from line ${startLine + 1} to ${endLine + 1}`);
            } else {
                console.log(`Skipping fold for one-liner function at line ${startLine + 1}`);
            }
        }

        // for (const range of ranges) {
        //     const startLine = range.start.line;
        //     const endLine = range.end.line;

        //     if (endLine > startLine) {
        //         const foldRange = new vscode.Range(startLine, 0, endLine, 0);
        //         editor.selection = new vscode.Selection(foldRange.start, foldRange.start);
        //         await vscode.commands.executeCommand('editor.fold');
        //         console.log(`Folding function from line ${startLine + 1} to ${endLine + 1}`);
        //     } else {
        //         console.log(`Skipping one-liner function at line ${startLine + 1}`);
        //     }
        // }


        console.log(`Successfully collapsed ${ranges.length} functions`);
        vscode.window.showInformationMessage(`Collapsed ${ranges.length} functions`);
    });

    // Command to expand all functions
    let expandDisposable = vscode.commands.registerCommand('vaderCollapseFns.expandAllFunctions', async () => {
        console.log('Expand All Functions command triggered');
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            console.log('No active editor found');
            vscode.window.showInformationMessage("No active editor found!");
            return;
        }

        console.log(`Expanding all folds in file: ${editor.document.fileName}`);

        // Expand all folding ranges in the document
        await vscode.commands.executeCommand('editor.unfoldAll');

        console.log('All folds expanded');
        vscode.window.showInformationMessage("Expanded all functions");
    });

    context.subscriptions.push(collapseDisposable, expandDisposable);
}

export function deactivate() {}