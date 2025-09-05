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
  let disposable = vscode.commands.registerCommand("vaderCollapseFns.collapseAllFunctions", async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage("No active editor found!");
      return;
    }
    const symbols = await vscode.commands.executeCommand(
      "vscode.executeDocumentSymbolProvider",
      editor.document.uri
    );
    if (!symbols) {
      vscode.window.showInformationMessage("No symbols found in this file!");
      return;
    }
    const functions = [];
    const gatherFunctions = (symbols2) => {
      for (const sym of symbols2) {
        if (sym.kind === vscode.SymbolKind.Function || sym.kind === vscode.SymbolKind.Method) {
          functions.push(sym);
        }
        if (sym.children.length > 0) {
          gatherFunctions(sym.children);
        }
      }
    };
    gatherFunctions(symbols);
    for (const func of functions) {
      const range = func.range;
      editor.selection = new vscode.Selection(range.start, range.start);
      await vscode.commands.executeCommand("editor.fold");
    }
    vscode.window.showInformationMessage(`Collapsed ${functions.length} functions`);
  });
  context.subscriptions.push(disposable);
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
