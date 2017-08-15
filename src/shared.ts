export interface Dependency {
    [depName: string]: string;
}

export interface PackageJson {
    "dependencies": Dependency;
    "devDependencies": Dependency;
}
