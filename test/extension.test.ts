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

        const changes = packageJson.getDifferences(changedPackageJson);
        assert.equal(Object.keys(changes.newDeps.dependencies).length, 0);
        assert.equal(Object.keys(changes.newDeps.devDependencies).length, 0);
        assert.equal(Object.keys(changes.removedDeps.dependencies).length, 0);
        assert.equal(Object.keys(changes.removedDeps.devDependencies).length, 0);
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

        const changes = packageJson.getDifferences(changedPackageJson);
        assert.equal(changes.newDeps.dependencies.jasmine, "*");
        assert.equal(Object.keys(changes.newDeps.dependencies).length, 1);
        assert.equal(Object.keys(changes.newDeps.devDependencies).length, 0);
        assert.equal(Object.keys(changes.removedDeps.dependencies).length, 0);
        assert.equal(Object.keys(changes.removedDeps.devDependencies).length, 0);
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

        const changes = packageJson.getDifferences(changedPackageJson);
        assert.equal(changes.newDeps.dependencies.jasmine, "*");
        assert.equal(changes.newDeps.dependencies["jasmine-node"], "*");
        assert.equal(Object.keys(changes.newDeps.dependencies).length, 2);
        assert.equal(Object.keys(changes.newDeps.devDependencies).length, 0);
        assert.equal(Object.keys(changes.removedDeps.dependencies).length, 0);
        assert.equal(Object.keys(changes.removedDeps.devDependencies).length, 0);
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

        const changes = packageJson.getDifferences(changedPackageJson);
        assert.equal(changes.newDeps.devDependencies.vscode, "^0.11.0");
        assert.equal(Object.keys(changes.newDeps.dependencies).length, 0);
        assert.equal(Object.keys(changes.newDeps.devDependencies).length, 1);
        assert.equal(Object.keys(changes.removedDeps.dependencies).length, 0);
        assert.equal(Object.keys(changes.removedDeps.devDependencies).length, 0);
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

        const changes = packageJson.getDifferences(changedPackageJson);
        assert.equal(changes.newDeps.devDependencies.vscode, "^0.11.0");
        assert.equal(changes.newDeps.devDependencies.typescript, "*");
        assert.equal(Object.keys(changes.newDeps.dependencies).length, 0);
        assert.equal(Object.keys(changes.newDeps.devDependencies).length, 2);
        assert.equal(Object.keys(changes.removedDeps.dependencies).length, 0);
        assert.equal(Object.keys(changes.removedDeps.devDependencies).length, 0);
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

        const changes = packageJson.getDifferences(changedPackageJson);
        assert.equal(changes.removedDeps.dependencies.json2ts, "^0.0.7");
        assert.equal(Object.keys(changes.newDeps.dependencies).length, 0);
        assert.equal(Object.keys(changes.newDeps.devDependencies).length, 0);
        assert.equal(Object.keys(changes.removedDeps.dependencies).length, 1);
        assert.equal(Object.keys(changes.removedDeps.devDependencies).length, 0);
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

        const changes = packageJson.getDifferences(changedPackageJson);
        assert.equal(changes.removedDeps.dependencies.json2ts, "^0.0.7");
        assert.equal(changes.removedDeps.dependencies.rxjs, "*");
        assert.equal(Object.keys(changes.newDeps.dependencies).length, 0);
        assert.equal(Object.keys(changes.newDeps.devDependencies).length, 0);
        assert.equal(Object.keys(changes.removedDeps.dependencies).length, 2);
        assert.equal(Object.keys(changes.removedDeps.devDependencies).length, 0);
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

        const changes = packageJson.getDifferences(changedPackageJson);
        assert.equal(changes.removedDeps.devDependencies.vscode, "^0.11.0");
        assert.equal(Object.keys(changes.newDeps.dependencies).length, 0);
        assert.equal(Object.keys(changes.newDeps.devDependencies).length, 0);
        assert.equal(Object.keys(changes.removedDeps.dependencies).length, 0);
        assert.equal(Object.keys(changes.removedDeps.devDependencies).length, 1);
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

        const changes = packageJson.getDifferences(changedPackageJson);
        assert.equal(changes.removedDeps.devDependencies.vscode, "^0.11.0");
        assert.equal(changes.removedDeps.devDependencies.typescript, "*");
        assert.equal(Object.keys(changes.newDeps.dependencies).length, 0);
        assert.equal(Object.keys(changes.newDeps.devDependencies).length, 0);
        assert.equal(Object.keys(changes.removedDeps.dependencies).length, 0);
        assert.equal(Object.keys(changes.removedDeps.devDependencies).length, 2);
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

        const changes = packageJson.getDifferences(changedPackageJson);
        assert.equal(changes.newDeps.dependencies.rxjs, "*");
        assert.equal(changes.newDeps.devDependencies.gulp, "*");
        assert.equal(changes.removedDeps.dependencies.json2ts, "^0.0.7");
        assert.equal(changes.removedDeps.devDependencies.typescript, "*");
        assert.equal(Object.keys(changes.newDeps.dependencies).length, 1);
        assert.equal(Object.keys(changes.newDeps.devDependencies).length, 1);
        assert.equal(Object.keys(changes.removedDeps.dependencies).length, 1);
        assert.equal(Object.keys(changes.removedDeps.devDependencies).length, 1);
    });
});
