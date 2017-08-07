import * as _ from "lodash";

export interface Dependency {
    [packageName: string]: string;
}

export interface Package {
    engines: Dependency;
    dependencies: Dependency;
    devDependencies: Dependency;
}

type DetectedChangesCallback = (newPackages: Package, deletedPackes: Package) => any;

export class PackageWatcher {
    constructor(private packageJson: Package) {
    }

    public changed(changedPackage: Package, detectedChangesCallback: DetectedChangesCallback) {
        const newPackages: Package = { dependencies: {}, devDependencies: {}, engines: {} };
        const deletedPackes: Package = { dependencies: {}, devDependencies: {}, engines: {} };

        // engines
        for (const key in changedPackage.engines) {
            if (this.exisitsPackage(this.packageJson.engines, key)) {
                newPackages.engines[key] = changedPackage.engines[key];
            }
        }

        if (this.packageJson.engines === undefined) {
            _.forOwn(changedPackage.engines, (value, key) => {
                newPackages.engines[key] = value;
            });
        }

        if (changedPackage.engines === undefined) {
            _.forOwn(this.packageJson.engines, (value, key) => {
                deletedPackes.engines[key] = value;
            });
        }

        for (const key in this.packageJson.engines) {
            if (this.exisitsPackage(changedPackage.engines, key)) {
                deletedPackes.engines[key] = this.packageJson.engines[key];
            }
        }
        // engines

        for (const key in changedPackage.dependencies) {
            if (this.exisitsPackage(this.packageJson.dependencies, key)) {
                newPackages.dependencies[key] = changedPackage.dependencies[key];
            }
        }

        for (const key in changedPackage.devDependencies) {
            if (this.exisitsPackage(this.packageJson.devDependencies, key)) {
                newPackages.devDependencies[key] = changedPackage.devDependencies[key];
            }
        }

        if (this.packageJson.devDependencies === undefined) {
            _.forOwn(changedPackage.devDependencies, (value, key) => {
                newPackages.devDependencies[key] = value;
            });
        }

        if (this.packageJson.dependencies === undefined) {
            _.forOwn(changedPackage.dependencies, (value, key) => {
                newPackages.dependencies[key] = value;
            });
        }

        if (changedPackage.dependencies === undefined) {
            _.forOwn(this.packageJson.dependencies, (value, key) => {
                deletedPackes.dependencies[key] = value;
            });
        }

        if (changedPackage.devDependencies === undefined) {
            _.forOwn(this.packageJson.devDependencies, (value, key) => {
                deletedPackes.devDependencies[key] = this.packageJson.devDependencies[key];
            });
        }

        for (const key in this.packageJson.dependencies) {
            if (this.exisitsPackage(changedPackage.dependencies, key)) {
                deletedPackes.dependencies[key] = this.packageJson.dependencies[key];
            }
        }

        for (const key in this.packageJson.devDependencies) {
            if (this.exisitsPackage(changedPackage.devDependencies, key)) {
                deletedPackes.devDependencies[key] = this.packageJson.devDependencies[key];
            }
        }

        this.packageJson = changedPackage;
        detectedChangesCallback(newPackages, deletedPackes);
    }

    private exisitsPackage(dependencies: Dependency, key: string): boolean {
        if (dependencies != null) {
            return !dependencies.hasOwnProperty(key);
        }
        return false;
    }
}
