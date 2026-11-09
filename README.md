# Rmod Extension

Syntax highlighting and commands for **Rmod** files (`*.Rmod`, `*.rmod`) from the [Rmod package for R](https://github.com/RmodPkg/Rmod).

## Features
- Syntax highlighting for Rmod files
- Commands to run and compile Rmod files directly in VS Code / Positron
- Editor title menu ("Rmod commands") and Command Palette entries, shown only for Rmod files

<!-- demo:start -->
https://github.com/user-attachments/assets/7dea2456-a76e-4068-885a-3eb7a7af8991
<!-- demo:end -->

## Commands

| Command | R code sent |
|---|---|
| Run Rmod | `Rmod::compileRmod(file)` |
| Run Rmod with C++ | `Rmod::compileRmod(file, cpp = TRUE)` |
| Load Rmod | `Rmod::compileRmod(file, run = FALSE)` |
| Load Rmod with C++ | `Rmod::compileRmod(file, run = FALSE, cpp = TRUE)` |
| Write Rmod to script | `Rmod::compileRmod(file, write = TRUE)` |
| Write Rmod to R/C++ package | `Rmod::compileRmod(file, write = TRUE, cpp = TRUE)` |
| Pre-process Rmod | `Rmod::preprocRmod(file)` |
| Run Rmod selection or line | `Ctrl+Enter` in an Rmod file |

## Requirements
- The `Rmod` R package (and its dependencies) installed in R.
- In VS Code: the [R Extension for VS Code](https://marketplace.visualstudio.com/items?itemName=REditorSupport.r). The extension offers to install it if missing.
- In Positron: no extra extension is needed.
