import * as _ from "lodash";
import * as vscode from "vscode";
import { Dependency, PackageJson } from "./shared";

type DepName = string;
type Version = string;
type PackageSection = "dependencies" | "devDependencies";
interface PackageDiff {
    newDeps: PackageJson;
    removedDeps: PackageJson;
}

export class Package implements PackageJson {
    public dependencies: Dependency;
    public devDependencies: Dependency;

    constructor(input: vscode.TextDocument | PackageJson | string) {
        // lets us create a Package from either a string, an object or a vscode TextDocument
        let newJson: PackageJson = {
            dependencies: {},
            devDependencies: {},
        };

        if ((input as vscode.TextDocument).getText) {
            newJson = JSON.parse((input as vscode.TextDocument).getText());
        } else if (typeof input === "string") {
            // necessary when we're reading a package file using fs.readFile
            newJson = JSON.parse(input as string);
        } else {
            newJson = input as PackageJson;
        }

        // doing this so that we don't have to keep the entire json object in memory,
        // only the bits we need
        this.dependencies = newJson.dependencies;
        this.devDependencies = newJson.devDependencies;
    }

    public getDifferences(changedPackage: Package): PackageDiff {
        // returns the differences between the deps in the current Package and another Package
        const newDeps: PackageJson = { dependencies: {}, devDependencies: {} };
        const removedDeps: PackageJson = { dependencies: {}, devDependencies: {} };

        ["dependencies", "devDependencies"].forEach((section: PackageSection) => {
            // loop through the current deps and compare with the new changedPackage to see if
            // any were removed
            _.forOwn(this[section], (version, depName) => {
                if (this.isRemovedDep(depName, changedPackage, section)) {
                    removedDeps[section][depName] = version;
                }
            });

            // loop through deps in changedPackage and compare with the current deps to see if
            // any are new/updated/downgraded
            _.forOwn(changedPackage[section], (version, depName) => {
                if (this.isNewOrChangedDep(depName, version, section)) {
                    newDeps[section][depName] = version;
                }
            });
        });

        return { newDeps, removedDeps };
    }

    private isNewDep(depName: DepName, section: PackageSection): boolean {
        // returns true if depName is a new dependency
        // logic: if the property didn't exist in the old package file, it must be new
        return !this[section].hasOwnProperty(depName);
    }

    private isChangedDep(depName: DepName, version: Version, section: PackageSection): boolean {
        // returns true if the dep has been updated or downgraded
        // logic: if the property existed in the old package file but the value has changed, the dep has been updated
        return this[section].hasOwnProperty(depName) && this[section][depName] !== version;
    }

    private isNewOrChangedDep(depName: DepName, version: Version, section: PackageSection): boolean {
        // returns true if the given dep is new or has been updated/downgraded
        return this.isNewDep(depName, section) || this.isChangedDep(depName, version, section);
    }

    private isRemovedDep(depName: DepName, changedPackage: Package, section: PackageSection): boolean {
        // returns true if the given dep has been uninstalled
        // logic: if the given depName doesn't exist as a property, it means the dep has been removed
        return !changedPackage[section].hasOwnProperty(depName);
    }
}
