export type InstallCallback = (count: number) => any;
export type UninstallCallback = (count: number) => any;

export interface Dependency {
    [packageName: string]: string;
}

export interface Package {
    engines: Dependency;
    dependencies: Dependency;
    devDependencies: Dependency;
}
