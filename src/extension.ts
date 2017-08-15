import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { Package } from "./Package";
import * as shared from "./shared";
import { ChangeCallback, TypingsService } from "./TypesService";

type FileName = "package.json" | "bower.json";
const fileNames: [FileName] = ["package.json", "bower.json"];

// to store the json of package.json and bower.json
const packages: { [fileName: string]: Package } = {};
let outputChannel: vscode.OutputChannel;
let typingsService: TypingsService;

export function activate(context: vscode.ExtensionContext) {
    outputChannel = vscode.window.createOutputChannel("Types AutoInstaller Watcher");
    outputChannel.show();
    context.subscriptions.push(outputChannel);

    fileNames.forEach((fileName: FileName) => {
        // initiate a Package for the file
        const filePath = path.join(vscode.workspace.rootPath, fileName);
        initPackage(fileName, filePath);

        // start a watcher for the file
        const watcher = vscode.workspace.createFileSystemWatcher(filePath);
        watcher.onDidChange(packageOnChange(fileName, filePath));
        context.subscriptions.push(watcher);
    });

    const installAllDependenciesCommand = vscode.commands.registerCommand(
        "types.installAllDependencies",
        (commandContext) => installAllDependencies(commandContext),
    );
    context.subscriptions.push(installAllDependenciesCommand);
}

function installAllDependencies(context: vscode.ExtensionContext) {
    fileNames.forEach((fileName) => {
        installPackages(packages[fileName], (count) => {
            reportResults(fileName, "Install", count);
        });
    });
}

function readPackage(filePath: string): Promise<Package> {
    // we need to wait 1 second before reading package.json/bower.json in order to give vscode
    // time to pick up the changes (if any).
    return wait(1000).then((): Promise<Package> => {
        return readFilePromise(filePath);
    });
}

async function initPackage(fileName: FileName, filePath: string) {
    // initiates a Package for the given file, e.g package.json
    try {
        packages[fileName] = await readPackage(filePath);
    } catch (err) {
        packages[fileName] = new Package({ dependencies: {}, devDependencies: {} });
        writeOutput(`The following error occurred while reading ${fileName}:\n${err.message}\n`);
    }
    typingsService = new TypingsService(vscode.workspace.rootPath);
}

function packageOnChange(fileName: FileName, filePath: string) {
    return async (e: vscode.Uri) => {
        // creates a package that reflects the changed file
        const changedPackage = await readPackage(filePath);

        // gets the differences between the current package and the changed one
        const changes = packages[fileName].getDifferences(changedPackage);

        // update our package with a reference to the changed one
        packages[fileName] = changedPackage;

        installPackages(changes.newDeps, (installCount) => {
            if (installCount) {
                reportResults(fileName, "Install", installCount);
            }

            uninstallPackages(changes.removedDeps, (uninstallCount) => {
                if (uninstallCount) {
                    reportResults(fileName, "Uninstall", installCount);
                }
            });
        });
    };
}

function installPackages(packageJson: shared.PackageJson, callback: ChangeCallback) {
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

function uninstallPackages(packageJson: shared.PackageJson, callback: ChangeCallback) {
    const devOverride: boolean = vscode.workspace.getConfiguration("types-autoinstaller").get("saveAsDevDependency");

    typingsService.uninstall(packageJson.dependencies || {}, devOverride, writeOutput, (depCount) => {
        typingsService.uninstall(packageJson.devDependencies || {}, true, writeOutput, (devDepCount) => {
            callback(depCount + devDepCount);
        });
    });
}

function reportResults(fileName: FileName, changeType: "Install" | "Uninstall", count: number) {
    const packageType = fileName === "package.json" ? "npm" : "bower";
    writeOutput(`${changeType}ed types for ${count} ${packageType} dependencies\n`);
}

function writeOutput(message: string) {
    outputChannel.append(message);
}

function wait(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function readFilePromise(filePath: string): Promise<Package> {
    // using fs instead of vscode.workspace.openTextDocument so that all errors
    // can be handled. If you use a try/catch or even provide an unfulfilled callback for
    // vscode.workspace.openTextDocument, some errors still get logged in the developer console.
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, "utf8", (err, data) => {
            err ? reject(err) : resolve(new Package(data));
        });
    });
}

// tslint:disable-next-line:no-empty
export function deactivate() { }
