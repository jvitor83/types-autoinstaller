import * as childProcess from "child_process";
import { Dependency } from "./PackageWatcher";
import { InstallCallback, UninstallCallback } from "./shared";

export class TypingsService {
    constructor(private rootPath: string) { }

    public install(
        dependency: Dependency,
        isDev: boolean = false,
        stateCallback: StateCallback,
        callback: InstallCallback,
    ) {
        const installCommands = Object.keys(dependency).map((key) => {
            return (installCb: Callback) => this.installDependency(key, isDev, stateCallback, this.rootPath, installCb);
        });
        if (installCommands && installCommands.length) {
            let successCount = 0;
            const run = (index: number) => {
                installCommands[index]((success) => {
                    if (success) {
                        successCount++;
                    }
                    const newIndex = index + 1;
                    (installCommands.length > newIndex) ?
                        run(newIndex) :
                        callback(successCount);
                },
                );
            };
            run(0);
        } else {
            callback(0);
        }
    }

    public uninstall(
        dependency: Dependency,
        isDev: boolean = false,
        stateCallback: StateCallback,
        callback: UninstallCallback,
    ) {
        const uninstallCommands = Object.keys(dependency).map((key) => {
            return (uninstallCb: Callback) => {
                this.uninstallDependency(key, isDev, stateCallback, this.rootPath, uninstallCb);
            };
        });
        if (uninstallCommands && uninstallCommands.length) {
            let successCount = 0;
            const run = (index: number) => {
                uninstallCommands[index]((success) => {
                    if (success) {
                        successCount++;
                    }
                    const newIndex = index + 1;
                    (uninstallCommands.length > newIndex) ?
                        run(newIndex) :
                        callback(successCount);
                });
            };
            run(0);
        } else {
            callback(0);
        }
    }

    private installDependency(
        key: string,
        isDev: boolean = false,
        stateCallback: StateCallback,
        rootPath: string,
        callback: Callback,
    ) {

        if (!(key.indexOf("@types") > -1)) {

            stateCallback(`Installing types package '${key}'\n`);
            let saveString = "--save";
            if (isDev) {
                saveString = "--save-dev";
            }
            const command = `npm install @types/${key} ` + saveString;

            childProcess.exec(command, { cwd: rootPath, env: process.env }, (error, stdout, sterr) => {
                if (sterr && sterr.indexOf("ERR!") > -1) {
                    if (sterr.match(/ERR! 404/g)) {
                        stateCallback(`Types for package '${key}' not found\n\n`);
                    } else {
                        stateCallback(sterr);
                    }
                    callback(false);
                } else {
                    stateCallback(stdout);
                    stateCallback(`Successfully installed Types for package '${key}'\n\n`);
                    callback(true);
                }
            });
        }
    }

    private uninstallDependency(
        key: string,
        isDev: boolean = false,
        stateCallback: StateCallback,
        rootPath: string,
        callback: Callback,
    ) {
        stateCallback(`Uninstalling types package '${key}'\n`);
        let saveString = "--save";
        if (isDev) {
            saveString = "--save-dev";
        }
        const command = `npm uninstall @types/${key} ` + saveString;

        childProcess.exec(command, { cwd: rootPath, env: process.env }, (error, stdout, sterr) => {
            if (!(error == null && stdout.indexOf("@types") > -1)) {
                stateCallback(stdout);
                callback(false);
            } else {
                stateCallback(stdout);
                stateCallback(`Successfully uninstalled Types for package '${key}'\n\n`);
                callback(true);
            }
        });
    }
}

type StateCallback = (message: string) => any;

type Callback = (success: boolean) => any;
