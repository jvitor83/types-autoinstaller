# Typescript - packages types installer

## Installation 
You can browse and install extensions from within VS Code. Press `Ctrl+P` and narrow down the list commands by typing `ext install types-autoinstaller`.

### Usage
Any time you save either package.json or bower.json the typings packages will be installed/uninstalled automatically in the background.

> Sample:
> 
> When you install a package
> ```shell
> npm install --save lodash
> ```
> 
> This plugin automatically run this command: 
> ```shell
> npm install --save @types/lodash
> ```
>  


#### Commands
To initially install all types of a project, open the Command Palette with <kbd>F1</kbd> and type in `Types: Install definitions for all dependencies`, press <kbd>Enter</kbd> to select it.

### Settings

**types-autoinstaller.saveAsDevDependency**: Set this to `true` to save all types to the devDependencies section of package.json

**types-autoinstaller.useYarn**: Set this to `true` to use yarn for package changes instead of npm

### Contributing
Feel free to submit a pull request if you find any bugs (to see a list of active issues, visit the [Issues section](https://github.com/jvitor83/types-autoinstaller/issues)).
Please make sure all commits are properly documented.

### License
MIT-licensed

** Enjoy! **
