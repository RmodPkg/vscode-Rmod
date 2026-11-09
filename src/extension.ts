import * as vscode from 'vscode';

interface RmodCommand {
  label: string;
  id: string;
  buildCommand: (filePath: string) => string;
}

async function isPositron(): Promise<boolean> {
  const cmds = await vscode.commands.getCommands(true);
  return cmds.includes('workbench.action.executeCode.console');
}

// Wrapper to send R code depending on environment
async function sendToR(rCode: string, positron: boolean): Promise<void> {
  if (positron) {
    try {
      await vscode.commands.executeCommand('workbench.action.executeCode.console', {
        langId: 'r',
        code: rCode,
        focus: true
      });
      vscode.window.showInformationMessage('Sent Rmod command to Positron Console');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      vscode.window.showErrorMessage('Failed to send command to Positron Console: ' + message);
    }
  } else {
    const cmds = await vscode.commands.getCommands(true);
    if (!cmds.includes('r.runCommand')) {
      const choice = await vscode.window.showErrorMessage(
        'The official R extension for VS Code (REditorSupport.r) is required to run Rmod commands. Please install it.',
        'Install'
      );
      if (choice === 'Install') {
        await vscode.commands.executeCommand('workbench.extensions.installExtension', 'REditorSupport.r');
      }
      return;
    }
    try {
      await vscode.commands.executeCommand('r.runCommand', rCode);
      vscode.window.showInformationMessage('Sent Rmod command to R terminal');
    } catch {
      vscode.window.showErrorMessage('Failed to send command to R. Is the R extension running?');
    }
  }
}

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  // Detect environment once at activation
  const positron = await isPositron();

  const execDisposable = vscode.commands.registerCommand('rmod.executeSelectionOrLine', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor.');
      return;
    }

    const doc = editor.document;
    const selection = editor.selection;
    let code = '';

    if (!selection.isEmpty) {
      code = doc.getText(selection);
    } else {
      const line = doc.lineAt(selection.active.line);
      code = line.text;
    }

    if (code.trim().length === 0) {
      vscode.window.showInformationMessage('Nothing to run.');
      return;
    }

    await sendToR(code, positron);
  });

  context.subscriptions.push(execDisposable);

  // Define all commands to support
  const commands: RmodCommand[] = [
    { label: 'Run Rmod',                    id: 'rmod.run',      buildCommand: (fp) => `Rmod::compileRmod("${fp}")` },
    { label: 'Run Rmod with C++',           id: 'rmod.runcpp',   buildCommand: (fp) => `Rmod::compileRmod("${fp}", cpp = TRUE)` },
    { label: 'Load Rmod',                   id: 'rmod.load',     buildCommand: (fp) => `Rmod::compileRmod("${fp}", run = FALSE)` },
    { label: 'Load Rmod with C++',          id: 'rmod.loadcpp',  buildCommand: (fp) => `Rmod::compileRmod("${fp}", run = FALSE, cpp = TRUE)` },
    { label: 'Write Rmod to script',        id: 'rmod.write',    buildCommand: (fp) => `Rmod::compileRmod("${fp}", write = TRUE)` },
    { label: 'Write Rmod to R/C++ package', id: 'rmod.writecpp', buildCommand: (fp) => `Rmod::compileRmod("${fp}", write = TRUE, cpp = TRUE)` },
    { label: 'Pre-process Rmod',            id: 'rmod.preproc',  buildCommand: (fp) => `Rmod::preprocRmod("${fp}")` }
  ];

  // Register the commands themselves
  for (const cmd of commands) {
    const disposable = vscode.commands.registerCommand(cmd.id, async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('No active editor.');
        return;
      }
      const filePath = editor.document.uri.fsPath.replace(/\\/g, '/');
      const rCode = cmd.buildCommand(filePath);
      await sendToR(rCode, positron);
    });
    context.subscriptions.push(disposable);
  }
}

export function deactivate(): void {}
