import * as assert from "assert";
import PackageWatcher from "../src/PackageWatcher";
import { Package } from "../src/Shared";

suite("package-watcher Tests", () => {

    test("Zero changed packages", () => {
        const packageJson: Package = {
            dependencies: {
                json2ts: "^0.0.7",
            },
            devDependencies: {
                vscode: "^0.11.0",
            },
            engines: {},
        };

        const changedPackageJson: Package = {
            dependencies: {
                json2ts: "^0.0.7",
            },
            devDependencies: {
                vscode: "^0.11.0",
            },
            engines: {},
        };

        const packageWatcher = new PackageWatcher(packageJson);
        packageWatcher.changed(changedPackageJson, (newPackages, deletedPackes) => {
            assert.equal(Object.keys(newPackages.dependencies).length, 0);
            assert.equal(Object.keys(newPackages.devDependencies).length, 0);
            assert.equal(Object.keys(deletedPackes.dependencies).length, 0);
            assert.equal(Object.keys(deletedPackes.devDependencies).length, 0);
        });
    });

    test("One new dependency package", () => {
        const packageJson: Package = {
            dependencies: {
                json2ts: "^0.0.7",
            },
            devDependencies: {
                vscode: "^0.11.0",
            },
            engines: {},
        };

        const changedPackageJson: Package = {
            dependencies: {
                jasmine: "*",
                json2ts: "^0.0.7",
            },
            devDependencies: {
                vscode: "^0.11.0",
            },
            engines: {},
        };

        const packageWatcher = new PackageWatcher(packageJson);
        packageWatcher.changed(changedPackageJson, (newPackages, deletedPackes) => {
            assert.equal(newPackages.dependencies.jasmine, "*");
            assert.equal(Object.keys(newPackages.dependencies).length, 1);
            assert.equal(Object.keys(newPackages.devDependencies).length, 0);
            assert.equal(Object.keys(deletedPackes.dependencies).length, 0);
            assert.equal(Object.keys(deletedPackes.devDependencies).length, 0);
        });
    });

    test("Two new dependency package", () => {
        const packageJson: Package = {
            dependencies: {
                json2ts: "^0.0.7",
            },
            devDependencies: {
                vscode: "^0.11.0",
            },
            engines: {},
        };

        const changedPackageJson: Package = {
            dependencies: {
                "jasmine": "*",
                "jasmine-node": "*",
                "json2ts": "^0.0.7",
            },
            devDependencies: {
                vscode: "^0.11.0",
            },
            engines: {},
        };

        const packageWatcher = new PackageWatcher(packageJson);
        packageWatcher.changed(changedPackageJson, (newPackages, deletedPackes) => {
            assert.equal(newPackages.dependencies.jasmine, "*");
            assert.equal(newPackages.dependencies["jasmine-node"], "*");
            assert.equal(Object.keys(newPackages.dependencies).length, 2);
            assert.equal(Object.keys(newPackages.devDependencies).length, 0);
            assert.equal(Object.keys(deletedPackes.dependencies).length, 0);
            assert.equal(Object.keys(deletedPackes.devDependencies).length, 0);
        });
    });

    test("One new devDependency package", () => {
        const packageJson: Package = {
            dependencies: {
                json2ts: "^0.0.7",
            },
            devDependencies: {
            },
            engines: {},
        };

        const changedPackageJson: Package = {
            dependencies: {
                json2ts: "^0.0.7",
            },
            devDependencies: {
                vscode: "^0.11.0",
            },
            engines: {},
        };

        const packageWatcher = new PackageWatcher(packageJson);
        packageWatcher.changed(changedPackageJson, (newPackages, deletedPackes) => {
            assert.equal(newPackages.devDependencies.vscode, "^0.11.0");
            assert.equal(Object.keys(newPackages.dependencies).length, 0);
            assert.equal(Object.keys(newPackages.devDependencies).length, 1);
            assert.equal(Object.keys(deletedPackes.dependencies).length, 0);
            assert.equal(Object.keys(deletedPackes.devDependencies).length, 0);
        });
    });

    test("Two new devDependency package", () => {
        const packageJson: Package = {
            dependencies: {
                json2ts: "^0.0.7",
            },
            devDependencies: {
            },
            engines: {},
        };

        const changedPackageJson: Package = {
            dependencies: {
                json2ts: "^0.0.7",
            },
            devDependencies: {
                typescript: "*",
                vscode: "^0.11.0",
            },
            engines: {},
        };

        const packageWatcher = new PackageWatcher(packageJson);
        packageWatcher.changed(changedPackageJson, (newPackages, deletedPackes) => {
            assert.equal(newPackages.devDependencies.vscode, "^0.11.0");
            assert.equal(newPackages.devDependencies.typescript, "*");
            assert.equal(Object.keys(newPackages.dependencies).length, 0);
            assert.equal(Object.keys(newPackages.devDependencies).length, 2);
            assert.equal(Object.keys(deletedPackes.dependencies).length, 0);
            assert.equal(Object.keys(deletedPackes.devDependencies).length, 0);
        });
    });

    test("One deleted dependency package", () => {
        const packageJson: Package = {
            dependencies: {
                json2ts: "^0.0.7",
            },
            devDependencies: {
            },
            engines: {},
        };

        const changedPackageJson: Package = {
            dependencies: {
            },
            devDependencies: {
            },
            engines: {},
        };

        const packageWatcher = new PackageWatcher(packageJson);
        packageWatcher.changed(changedPackageJson, (newPackages, deletedPackes) => {
            assert.equal(deletedPackes.dependencies.json2ts, "^0.0.7");
            assert.equal(Object.keys(newPackages.dependencies).length, 0);
            assert.equal(Object.keys(newPackages.devDependencies).length, 0);
            assert.equal(Object.keys(deletedPackes.dependencies).length, 1);
            assert.equal(Object.keys(deletedPackes.devDependencies).length, 0);
        });
    });

    test("Two deleted dependency package", () => {
        const packageJson: Package = {
            dependencies: {
                json2ts: "^0.0.7",
                rxjs: "*",
            },
            devDependencies: {
            },
            engines: {},
        };

        const changedPackageJson: Package = {
            dependencies: {
            },
            devDependencies: {
            },
            engines: {},
        };

        const packageWatcher = new PackageWatcher(packageJson);
        packageWatcher.changed(changedPackageJson, (newPackages, deletedPackes) => {
            assert.equal(deletedPackes.dependencies.json2ts, "^0.0.7");
            assert.equal(deletedPackes.dependencies.rxjs, "*");
            assert.equal(Object.keys(newPackages.dependencies).length, 0);
            assert.equal(Object.keys(newPackages.devDependencies).length, 0);
            assert.equal(Object.keys(deletedPackes.dependencies).length, 2);
            assert.equal(Object.keys(deletedPackes.devDependencies).length, 0);
        });
    });

    test("One deleted devDependency package", () => {
        const packageJson: Package = {
            dependencies: {
                json2ts: "^0.0.7",
            },
            devDependencies: {
                vscode: "^0.11.0",
            },
            engines: {},
        };

        const changedPackageJson: Package = {
            dependencies: {
                json2ts: "^0.0.7",
            },
            devDependencies: {
            },
            engines: {},
        };

        const packageWatcher = new PackageWatcher(packageJson);
        packageWatcher.changed(changedPackageJson, (newPackages, deletedPackes) => {
            assert.equal(deletedPackes.devDependencies.vscode, "^0.11.0");
            assert.equal(Object.keys(newPackages.dependencies).length, 0);
            assert.equal(Object.keys(newPackages.devDependencies).length, 0);
            assert.equal(Object.keys(deletedPackes.dependencies).length, 0);
            assert.equal(Object.keys(deletedPackes.devDependencies).length, 1);
        });
    });

    test("Two deleted devDependency package", () => {
        const packageJson: Package = {
            dependencies: {
                json2ts: "^0.0.7",
            },
            devDependencies: {
                typescript: "*",
                vscode: "^0.11.0",
            },
            engines: {},
        };

        const changedPackageJson: Package = {
            dependencies: {
                json2ts: "^0.0.7",
            },
            devDependencies: {
            },
            engines: {},
        };

        const packageWatcher = new PackageWatcher(packageJson);
        packageWatcher.changed(changedPackageJson, (newPackages, deletedPackes) => {
            assert.equal(deletedPackes.devDependencies.vscode, "^0.11.0");
            assert.equal(deletedPackes.devDependencies.typescript, "*");
            assert.equal(Object.keys(newPackages.dependencies).length, 0);
            assert.equal(Object.keys(newPackages.devDependencies).length, 0);
            assert.equal(Object.keys(deletedPackes.dependencies).length, 0);
            assert.equal(Object.keys(deletedPackes.devDependencies).length, 2);
        });
    });

    test("Cross dependencies changed", () => {
        const packageJson: Package = {
            dependencies: {
                json2ts: "^0.0.7",
            },
            devDependencies: {
                typescript: "*",
                vscode: "^0.11.0",
            },
            engines: {},
        };

        const changedPackageJson: Package = {
            dependencies: {
                rxjs: "*",
            },
            devDependencies: {
                gulp: "*",
                vscode: "^0.11.0",
            },
            engines: {},
        };

        const packageWatcher = new PackageWatcher(packageJson);
        packageWatcher.changed(changedPackageJson, (newPackages, deletedPackes) => {
            assert.equal(newPackages.dependencies.rxjs, "*");
            assert.equal(newPackages.devDependencies.gulp, "*");
            assert.equal(deletedPackes.dependencies.json2ts, "^0.0.7");
            assert.equal(deletedPackes.devDependencies.typescript, "*");
            assert.equal(Object.keys(newPackages.dependencies).length, 1);
            assert.equal(Object.keys(newPackages.devDependencies).length, 1);
            assert.equal(Object.keys(deletedPackes.dependencies).length, 1);
            assert.equal(Object.keys(deletedPackes.devDependencies).length, 1);
        });
    });
});
