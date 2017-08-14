import * as assert from "assert";
import { Package } from "../src/Package";

suite("package-watcher Tests", () => {

    test("Zero changed packages", () => {
        const packageJson = new Package({
            dependencies: {
                json2ts: "^0.0.7",
            },
            devDependencies: {
                vscode: "^0.11.0",
            },
        });

        const changedPackageJson = new Package({
            dependencies: {
                json2ts: "^0.0.7",
            },
            devDependencies: {
                vscode: "^0.11.0",
            },
        });

        packageJson.changed(changedPackageJson, (newPackages, deletedPackages) => {
            assert.equal(Object.keys(newPackages.dependencies).length, 0);
            assert.equal(Object.keys(newPackages.devDependencies).length, 0);
            assert.equal(Object.keys(deletedPackages.dependencies).length, 0);
            assert.equal(Object.keys(deletedPackages.devDependencies).length, 0);
        });
    });

    test("One new dependency package", () => {
        const packageJson = new Package({
            dependencies: {
                json2ts: "^0.0.7",
            },
            devDependencies: {
                vscode: "^0.11.0",
            },
        });

        const changedPackageJson = new Package({
            dependencies: {
                jasmine: "*",
                json2ts: "^0.0.7",
            },
            devDependencies: {
                vscode: "^0.11.0",
            },
        });

        packageJson.changed(changedPackageJson, (newPackages, deletedPackages) => {
            assert.equal(newPackages.dependencies.jasmine, "*");
            assert.equal(Object.keys(newPackages.dependencies).length, 1);
            assert.equal(Object.keys(newPackages.devDependencies).length, 0);
            assert.equal(Object.keys(deletedPackages.dependencies).length, 0);
            assert.equal(Object.keys(deletedPackages.devDependencies).length, 0);
        });
    });

    test("Two new dependency package", () => {
        const packageJson = new Package({
            dependencies: {
                json2ts: "^0.0.7",
            },
            devDependencies: {
                vscode: "^0.11.0",
            },
        });

        const changedPackageJson = new Package({
            dependencies: {
                "jasmine": "*",
                "jasmine-node": "*",
                "json2ts": "^0.0.7",
            },
            devDependencies: {
                vscode: "^0.11.0",
            },
        });

        packageJson.changed(changedPackageJson, (newPackages, deletedPackages) => {
            assert.equal(newPackages.dependencies.jasmine, "*");
            assert.equal(newPackages.dependencies["jasmine-node"], "*");
            assert.equal(Object.keys(newPackages.dependencies).length, 2);
            assert.equal(Object.keys(newPackages.devDependencies).length, 0);
            assert.equal(Object.keys(deletedPackages.dependencies).length, 0);
            assert.equal(Object.keys(deletedPackages.devDependencies).length, 0);
        });
    });

    test("One new devDependency package", () => {
        const packageJson = new Package({
            dependencies: {
                json2ts: "^0.0.7",
            },
            devDependencies: {
            },
        });

        const changedPackageJson = new Package({
            dependencies: {
                json2ts: "^0.0.7",
            },
            devDependencies: {
                vscode: "^0.11.0",
            },
        });

        packageJson.changed(changedPackageJson, (newPackages, deletedPackages) => {
            assert.equal(newPackages.devDependencies.vscode, "^0.11.0");
            assert.equal(Object.keys(newPackages.dependencies).length, 0);
            assert.equal(Object.keys(newPackages.devDependencies).length, 1);
            assert.equal(Object.keys(deletedPackages.dependencies).length, 0);
            assert.equal(Object.keys(deletedPackages.devDependencies).length, 0);
        });
    });

    test("Two new devDependency package", () => {
        const packageJson = new Package({
            dependencies: {
                json2ts: "^0.0.7",
            },
            devDependencies: {
            },
        });

        const changedPackageJson = new Package({
            dependencies: {
                json2ts: "^0.0.7",
            },
            devDependencies: {
                typescript: "*",
                vscode: "^0.11.0",
            },
        });

        packageJson.changed(changedPackageJson, (newPackages, deletedPackages) => {
            assert.equal(newPackages.devDependencies.vscode, "^0.11.0");
            assert.equal(newPackages.devDependencies.typescript, "*");
            assert.equal(Object.keys(newPackages.dependencies).length, 0);
            assert.equal(Object.keys(newPackages.devDependencies).length, 2);
            assert.equal(Object.keys(deletedPackages.dependencies).length, 0);
            assert.equal(Object.keys(deletedPackages.devDependencies).length, 0);
        });
    });

    test("One deleted dependency package", () => {
        const packageJson = new Package({
            dependencies: {
                json2ts: "^0.0.7",
            },
            devDependencies: {
            },
        });

        const changedPackageJson = new Package({
            dependencies: {
            },
            devDependencies: {
            },
        });

        packageJson.changed(changedPackageJson, (newPackages, deletedPackages) => {
            assert.equal(deletedPackages.dependencies.json2ts, "^0.0.7");
            assert.equal(Object.keys(newPackages.dependencies).length, 0);
            assert.equal(Object.keys(newPackages.devDependencies).length, 0);
            assert.equal(Object.keys(deletedPackages.dependencies).length, 1);
            assert.equal(Object.keys(deletedPackages.devDependencies).length, 0);
        });
    });

    test("Two deleted dependency package", () => {
        const packageJson = new Package({
            dependencies: {
                json2ts: "^0.0.7",
                rxjs: "*",
            },
            devDependencies: {
            },
        });

        const changedPackageJson = new Package({
            dependencies: {
            },
            devDependencies: {
            },
        });

        packageJson.changed(changedPackageJson, (newPackages, deletedPackages) => {
            assert.equal(deletedPackages.dependencies.json2ts, "^0.0.7");
            assert.equal(deletedPackages.dependencies.rxjs, "*");
            assert.equal(Object.keys(newPackages.dependencies).length, 0);
            assert.equal(Object.keys(newPackages.devDependencies).length, 0);
            assert.equal(Object.keys(deletedPackages.dependencies).length, 2);
            assert.equal(Object.keys(deletedPackages.devDependencies).length, 0);
        });
    });

    test("One deleted devDependency package", () => {
        const packageJson = new Package({
            dependencies: {
                json2ts: "^0.0.7",
            },
            devDependencies: {
                vscode: "^0.11.0",
            },
        });

        const changedPackageJson = new Package({
            dependencies: {
                json2ts: "^0.0.7",
            },
            devDependencies: {
            },
        });

        packageJson.changed(changedPackageJson, (newPackages, deletedPackages) => {
            assert.equal(deletedPackages.devDependencies.vscode, "^0.11.0");
            assert.equal(Object.keys(newPackages.dependencies).length, 0);
            assert.equal(Object.keys(newPackages.devDependencies).length, 0);
            assert.equal(Object.keys(deletedPackages.dependencies).length, 0);
            assert.equal(Object.keys(deletedPackages.devDependencies).length, 1);
        });
    });

    test("Two deleted devDependency package", () => {
        const packageJson = new Package({
            dependencies: {
                json2ts: "^0.0.7",
            },
            devDependencies: {
                typescript: "*",
                vscode: "^0.11.0",
            },
        });

        const changedPackageJson = new Package({
            dependencies: {
                json2ts: "^0.0.7",
            },
            devDependencies: {
            },
        });

        packageJson.changed(changedPackageJson, (newPackages, deletedPackages) => {
            assert.equal(deletedPackages.devDependencies.vscode, "^0.11.0");
            assert.equal(deletedPackages.devDependencies.typescript, "*");
            assert.equal(Object.keys(newPackages.dependencies).length, 0);
            assert.equal(Object.keys(newPackages.devDependencies).length, 0);
            assert.equal(Object.keys(deletedPackages.dependencies).length, 0);
            assert.equal(Object.keys(deletedPackages.devDependencies).length, 2);
        });
    });

    test("Cross dependencies changed", () => {
        const packageJson = new Package({
            dependencies: {
                json2ts: "^0.0.7",
            },
            devDependencies: {
                typescript: "*",
                vscode: "^0.11.0",
            },
        });

        const changedPackageJson = new Package({
            dependencies: {
                rxjs: "*",
            },
            devDependencies: {
                gulp: "*",
                vscode: "^0.11.0",
            },
        });

        packageJson.changed(changedPackageJson, (newPackages, deletedPackages) => {
            assert.equal(newPackages.dependencies.rxjs, "*");
            assert.equal(newPackages.devDependencies.gulp, "*");
            assert.equal(deletedPackages.dependencies.json2ts, "^0.0.7");
            assert.equal(deletedPackages.devDependencies.typescript, "*");
            assert.equal(Object.keys(newPackages.dependencies).length, 1);
            assert.equal(Object.keys(newPackages.devDependencies).length, 1);
            assert.equal(Object.keys(deletedPackages.dependencies).length, 1);
            assert.equal(Object.keys(deletedPackages.devDependencies).length, 1);
        });
    });
});
