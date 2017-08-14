import * as fs from "fs";
import * as vscode from "vscode";
import { Package } from "./Package";
import { PackageJson } from "./shared";
import { ChangeCallback, TypingsService } from "./TypesService";

let npmPackageWatcher: Package;
let bowerPackageWatcher: Package;
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
        // Install
        installPackages(new Package(file), (count) => {
            writeOutput(`Installed Types of ${count} npm package(s)\n`);
            readBower();
        });
    }, () => {
        readBower();
    });

    const readBower = () => {
        const bowerPath = vscode.workspace.rootPath + "/bower.json";
        vscode.workspace.openTextDocument(bowerPath).then((file) => {
            // Install
            installPackages(new Package(file), (count) => {
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
            const changes = npmPackageWatcher.getDifferences(new Package(file));
            // Install
            installPackages(changes.newDeps, (installCount) => {
                if (installCount) {
                    writeOutput(`Installed Types of ${installCount} npm package(s)\n`);
                }
                // Uninstall
                uninstallPackages(changes.removedDeps, (uninstallCount) => {
                    if (uninstallCount) {
                        writeOutput(`Uninstalled Types of ${uninstallCount} npm package(s)\n`);
                    }
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
            npmPackageWatcher = new Package(file);
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
            const changes = bowerPackageWatcher.getDifferences(new Package(file));
            // Install
            installPackages(changes.newDeps, (installCount) => {
                if (installCount) {
                    writeOutput(`Installed Types of ${installCount} bower package(s)\n`);
                }
                // Uninstall
                uninstallPackages(changes.removedDeps, (uninstallCount) => {
                    if (uninstallCount) {
                        writeOutput(`Uninstalled Types of ${uninstallCount} bower package(s)\n`);
                    }
                });
            });
        });
    });

    context.subscriptions.push(watcher);
}

function installPackages(packageJson: PackageJson, callback: ChangeCallback) {
    // if devOverride is true, put all @types for regular dependencies into the
    // devDepenencies section of package.json. This is ideal behaviour if you're
    // not going to be publishing your package to the registry.
    const devOverride: boolean = vscode.workspace.getConfiguration("types-autoinstaller").get("saveAsDevDependency");

    typingsService.install(packageJson.dependencies || {}, devOverride, writeOutput, (depCount) => {
        typingsService.install(packageJson.devDependencies || {}, true, writeOutput, (devDepCount) => {
            return callback(depCount + devDepCount);
        });
    });
}

function uninstallPackages(packageJson: PackageJson, callback: ChangeCallback) {
    const devOverride: boolean = vscode.workspace.getConfiguration("types-autoinstaller").get("saveAsDevDependency");

    typingsService.uninstall(packageJson.dependencies || {}, devOverride, writeOutput, (depCount) => {
        typingsService.uninstall(packageJson.devDependencies || {}, true, writeOutput, (devDepCount) => {
            callback(depCount + devDepCount);
        });
    });
}

function isBowerWatcherDeactivated() {
    return !bowerPackageWatcher;
}

function initBowerWatcher(path: string) {
    // using fs here since using vscode.workspace.openTextDocument causes errors to be
    // thrown if bower.json doesn't exist
    fs.readFile(path, "utf8", (err, data) => {
        if (data) {
            bowerPackageWatcher = new Package(data);
            typingsService = new TypingsService(vscode.workspace.rootPath);
        } else if (err && !err.message.includes("ENOENT: no such file")) {
            // throw the error, unless bower.json doesn't exist
            throw err;
        }
    });
}

function writeOutput(message: string) {
    outputChannel.append(message);
}

// tslint:disable-next-line:no-empty
export function deactivate() { }
