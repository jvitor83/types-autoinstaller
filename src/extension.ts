import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { Package } from "./Package";
import { PackageJson } from "./shared";
import { ChangeCallback, TypingsService } from "./TypesService";

type FileName = "bower.json" | "package.json";

// to store the json of package.json and bower.json
const packages: { [fileName: string]: Package } = {};
let outputChannel: vscode.OutputChannel;
let typingsService: TypingsService;

export function activate(context: vscode.ExtensionContext) {
    outputChannel = vscode.window.createOutputChannel("Types AutoInstaller Watcher");
    outputChannel.show();
    context.subscriptions.push(outputChannel);

    ["package.json", "bower.json"].forEach((fileName: FileName) => {
        startWatcher(fileName, context);
    });

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

function startWatcher(fileName: FileName, context: vscode.ExtensionContext) {
    const filePath = path.join(vscode.workspace.rootPath, fileName);
    const watcher = vscode.workspace.createFileSystemWatcher(filePath);
    initPackage(fileName, filePath);

    watcher.onDidChange((e) => {
        vscode.workspace.openTextDocument(filePath).then((file) => {
            const changes = packages[fileName].getDifferences(new Package(file));
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

function initPackage(fileName: FileName, filePath: string) {
    // When you supple an onUnfulfilled callback to vscode.workspace.openTextDocument,
    // errors still get outputted to the developer console. Using fs allows us to handle all errors
    fs.readFile(filePath, "utf8", (err, data) => {
        if (data) {
            packages[fileName] = new Package(data);
        } else if (err) {
            writeOutput(err.message + "\n");
            packages[fileName] = new Package({ dependencies: {}, devDependencies: {} });
        }
        typingsService = new TypingsService(vscode.workspace.rootPath);
    });
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

function writeOutput(message: string) {
    outputChannel.append(message);
}

// tslint:disable-next-line:no-empty
export function deactivate() { }
