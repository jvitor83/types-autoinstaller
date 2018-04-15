"use strict";

import * as vscode from "vscode";
import { Package, PackageWatcher } from "./PackageWatcher";
import { InstallCallback, UninstallCallback } from "./shared";
import { TypingsService } from "./TypesService";

let npmPackageWatcher: PackageWatcher;
let bowerPackageWatcher: PackageWatcher;
let outputChannel: vscode.OutputChannel;
let typingsService: TypingsService;

export function activate(context: vscode.ExtensionContext) {
    outputChannel = vscode.window.createOutputChannel("Types AutoInstaller Watcher");
    outputChannel.show();
    context.subscriptions.push(outputChannel);

    startNpmWatch(context);
    startBowerWatch(context);

    const installAllDependenciesCommand = vscode.commands.registerCommand(
        "types.installAllDependencies",
        (commandContext) => installAllDependencies(commandContext),
    );
    context.subscriptions.push(installAllDependenciesCommand);
}

function installAllDependencies(context: vscode.ExtensionContext) {
    const npmPath = vscode.workspace.rootPath + "/package.json";
    openDocument(npmPath, (file) => {
        const packageJson: Package = JSON.parse(file.getText());
        // Install
        installPackages(packageJson, (count) => {
            writeOutput(`Installed Types of ${count} npm package(s)\n`);
            readBower();
        });
    }, () => {
        readBower();
    });

    const readBower = () => {
        const bowerPath = vscode.workspace.rootPath + "/bower.json";
        openDocument(bowerPath, (file) => {
            const packageJson: Package = JSON.parse(file.getText());
            // Install
            installPackages(packageJson, (count) => {
                writeOutput(`Installed Types of ${count} bower package(s)\n`);
            });
        });
    };
}

function startNpmWatch(context: vscode.ExtensionContext) {
    const path = vscode.workspace.rootPath + "/package.json";

    initNpmWatcher(path);

    const watcher = vscode.workspace.createFileSystemWatcher(path);
    watcher.onDidChange((e) => {
        if (isNpmWatcherDeactivated()) {
            initNpmWatcher(path);
        }

        openDocument(path, (file) => {
            const packageJson: Package = JSON.parse(file.getText());
            npmPackageWatcher.changed(packageJson, (newPackages, deletedPackes) => {
                // Install
                installPackages(newPackages, (installCount) => {
                    if (installCount) {
                        writeOutput(`Installed Types of ${installCount} npm package(s)\n`);
                    }
                    // Uninstall
                    uninstallPackages(deletedPackes, (uninstallCount) => {
                        if (uninstallCount) {
                            writeOutput(`Uninstalled Types of ${uninstallCount} npm package(s)\n`);
                        }
                    });
                });
            });
        });
    });

    context.subscriptions.push(watcher);
}

function isNpmWatcherDeactivated() {
    return !npmPackageWatcher;
}

function initNpmWatcher(path: string) {
    openDocument(path, (file) => {
        if (file != null) {
            const packageJson: Package = JSON.parse(file.getText());
            const useYarn: boolean =
                vscode.workspace.getConfiguration("types-autoinstaller")
                    .get("useYarn");
            npmPackageWatcher = new PackageWatcher(packageJson);
            typingsService = new TypingsService(vscode.workspace.rootPath, useYarn);
        }
    });
}

function startBowerWatch(context: vscode.ExtensionContext) {
    const path = vscode.workspace.rootPath + "/bower.json";

    initBowerWatcher(path);

    const watcher = vscode.workspace.createFileSystemWatcher(path);
    watcher.onDidChange((e) => {
        if (isBowerWatcherDeactivated()) {
            initBowerWatcher(path);
        }

        openDocument(path, (file) => {
            const bowerJson: Package = JSON.parse(file.getText());
            bowerPackageWatcher.changed(bowerJson, (newPackages, deletedPackes) => {
                // Install
                installPackages(newPackages, (installCount) => {
                    if (installCount) {
                        writeOutput(`Installed Types of ${installCount} bower package(s)\n`);
                    }
                    // Uninstall
                    uninstallPackages(deletedPackes, (uninstallCount) => {
                        if (uninstallCount) {
                            writeOutput(`Uninstalled Types of ${uninstallCount} bower package(s)\n`);
                        }
                    });
                });
            });
        });
    });

    context.subscriptions.push(watcher);
}

function installPackages(packageJson: Package, callback: InstallCallback, installEngines: boolean = false) {
    // if devOverride is true, put all @types for regular dependencies into the
    // devDepenencies section of package.json. This is ideal behaviour if you're
    // not going to be publishing your package to the registry.
    const devOverride: boolean = vscode.workspace.getConfiguration("types-autoinstaller").get("saveAsDevDependency");

    typingsService.install(packageJson.dependencies || {}, devOverride, writeOutput, (counta) => {
        typingsService.install(packageJson.devDependencies || {}, true, writeOutput, (countb) => {
            typingsService.install(packageJson.engines || {}, false, writeOutput, (countc) => {
                callback(counta + countb + countc);
            });
        });
    });
}

function uninstallPackages(packageJson: Package, callback: UninstallCallback) {
    const devOverride: boolean = vscode.workspace.getConfiguration("types-autoinstaller").get("saveAsDevDependency");

    typingsService.uninstall(packageJson.dependencies || {}, devOverride, writeOutput, (counta) => {
        typingsService.uninstall(packageJson.devDependencies || {}, true, writeOutput, (countb) => {
            typingsService.uninstall(packageJson.engines || {}, false, writeOutput, (countc) => {
                callback(counta + countb + countc);
            });
        });
    });
}

function isBowerWatcherDeactivated() {
    return !bowerPackageWatcher;
}

function initBowerWatcher(path: string) {
    openDocument(path, (file) => {
        const bowerJson: Package = JSON.parse(file.getText());
        const useYarn: boolean =
        vscode.workspace.getConfiguration("types-autoinstaller")
            .get("useYarn");
        bowerPackageWatcher = new PackageWatcher(bowerJson);
        typingsService = new TypingsService(vscode.workspace.rootPath, useYarn);
    });
}

function writeOutput(message: string) {
    outputChannel.append(message);
}

function openDocument(filePath: string, onfulfilled: (file: vscode.TextDocument) => void, onrejected?: () => void) {
    // delay the reading of the document so that vscode has a chance to pick up any external changes (e.g by npm/yarn)
    setTimeout(() => {
        vscode.workspace.openTextDocument(filePath).then(onfulfilled, onrejected);
    }, 800);
}

// tslint:disable-next-line:no-empty
export function deactivate() { }
