"use strict";

import * as vscode from "vscode";
import {Package, PackageWatcher} from "./PackageWatcher";
import {TypingsService} from "./TypesService";

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
    vscode.workspace.openTextDocument(npmPath).then((file) => {
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
        vscode.workspace.openTextDocument(bowerPath).then((file) => {
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

        vscode.workspace.openTextDocument(path).then((file) => {
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
    vscode.workspace.openTextDocument(path).then((file) => {
        if (file != null) {
            const packageJson: Package = JSON.parse(file.getText());
            npmPackageWatcher = new PackageWatcher(packageJson);
            typingsService = new TypingsService(vscode.workspace.rootPath);
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

        vscode.workspace.openTextDocument(path).then((file) => {
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

function installPackages(packageJson: Package, callback: any, installEngines: boolean = false) {
    // if devOverride is true, put all @types for regular dependencies into the
    // devDepenencies section of package.json. This is ideal behaviour if you're
    // not going to be publishing your package to the registry.
    const devOverride: boolean = vscode.workspace.getConfiguration("types-autoinstaller").get("saveAsDevDependency");

    typingsService.install(packageJson.dependencies || {}, devOverride, writeOutput, (depCount) => {
        typingsService.install(packageJson.devDependencies || {}, true, writeOutput, (devDepCount) => {
            typingsService.install(
                packageJson.engines || {},
                false, writeOutput,
                (engineCount) => callback(depCount + devDepCount + engineCount),
            );
        });
    });
}

function uninstallPackages(packageJson: Package, callback: any) {
    const devOverride: boolean = vscode.workspace.getConfiguration("types-autoinstaller").get("saveAsDevDependency");

    typingsService.uninstall(packageJson.dependencies || {}, devOverride, writeOutput, (depCount) => {
        typingsService.uninstall(packageJson.devDependencies || {}, true, writeOutput, (devDepCount) => {
            typingsService.uninstall(
                packageJson.engines || {},
                false, writeOutput,
                (engineCount) => callback(depCount + devDepCount + engineCount),
            );
        });
    });
}

function isBowerWatcherDeactivated() {
    return !bowerPackageWatcher;
}

function initBowerWatcher(path: string) {
    vscode.workspace.openTextDocument(path).then((file) => {
        const bowerJson: Package = JSON.parse(file.getText());
        bowerPackageWatcher = new PackageWatcher(bowerJson);
        typingsService = new TypingsService(vscode.workspace.rootPath);
    });
}

function writeOutput(message: string) {
    outputChannel.append(message);
}

// tslint:disable-next-line:no-empty
export function deactivate() {}
