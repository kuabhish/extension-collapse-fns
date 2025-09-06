"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode = __toESM(require("vscode"));
function activate(context) {
  let collapseDisposable = vscode.commands.registerCommand("vaderCollapseFns.collapseAllFunctions", async () => {
    console.log("Collapse All Functions command triggered");
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      console.log("No active editor found");
      vscode.window.showInformationMessage("No active editor found!");
      return;
    }
    console.log(`Active editor found, language: ${editor.document.languageId}, file: ${editor.document.fileName}`);
    const text = editor.document.getText();
    const ranges = [];
    const isPython = editor.document.languageId === "python";
    const regex = isPython ? /^([ ]*)def\s+(\w+)\s*\(([\s\S]*?)\)\s*(?:->\s*[\w\[\], ]+)?\s*:/gm : /^\s*(function)\s+(\w+)\s*(?:\((.*?)\))?\s*{/gm;
    console.log(`Using regex for ${isPython ? "Python" : "JS/TS"}`);
    let match;
    let matchCount = 0;
    while ((match = regex.exec(text)) !== null) {
      const startLineNum = editor.document.positionAt(match.index).line;
      const endPos = match.index + match[0].length;
      const endLineNum = editor.document.positionAt(endPos).line;
      const endLine = editor.document.lineAt(endLineNum);
      console.log(`Function starts at line ${startLineNum + 1}, ends at line ${endLineNum + 1}: ${endLine.text}`);
      ranges.push(endLine.range);
    }
    if (ranges.length === 0) {
      console.log("No functions found in the file");
      vscode.window.showInformationMessage("No functions found to collapse!");
      return;
    }
    console.log(`Total functions to collapse: ${matchCount}`);
    for (const range of ranges) {
      const startLine = range.start.line;
      const funcLine = editor.document.lineAt(startLine);
      const funcIndent = funcLine.firstNonWhitespaceCharacterIndex;
      let endLine = startLine;
      for (let i = startLine + 1; i < editor.document.lineCount; i++) {
        const lineText = editor.document.lineAt(i).text;
        if (lineText.trim() === "" || lineText.trim().startsWith("#")) continue;
        const indent = editor.document.lineAt(i).firstNonWhitespaceCharacterIndex;
        if (indent <= funcIndent) break;
        endLine = i;
      }
      if (endLine > startLine) {
        const foldRange = new vscode.Range(startLine, 0, endLine, editor.document.lineAt(endLine).text.length);
        editor.selection = new vscode.Selection(foldRange.start, foldRange.start);
        await vscode.commands.executeCommand("editor.fold");
        console.log(`Folding function from line ${startLine + 1} to ${endLine + 1}`);
      } else {
        console.log(`Skipping fold for one-liner function at line ${startLine + 1}`);
      }
    }
    console.log(`Successfully collapsed ${ranges.length} functions`);
    vscode.window.showInformationMessage(`Collapsed ${ranges.length} functions`);
  });
  let expandDisposable = vscode.commands.registerCommand("vaderCollapseFns.expandAllFunctions", async () => {
    console.log("Expand All Functions command triggered");
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      console.log("No active editor found");
      vscode.window.showInformationMessage("No active editor found!");
      return;
    }
    console.log(`Expanding all folds in file: ${editor.document.fileName}`);
    await vscode.commands.executeCommand("editor.unfoldAll");
    console.log("All folds expanded");
    vscode.window.showInformationMessage("Expanded all functions");
  });
  context.subscriptions.push(collapseDisposable, expandDisposable);
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
