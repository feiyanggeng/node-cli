/**
 * GenFileConfig
 * generator folder path and fileName;
 *
 */
import * as fs from 'fs';
import * as chalk from "chalk";
import * as path from "path";

export default name => {
  let appDirectory = fs.realpathSync(process.cwd());

  if (!/^\w/.test(name)) {
    console.warn(chalk.green("module name must start with letter"));
    process.exit(1);
  }
  let app = "",
    targetDir = "",
    absoluteTargetDir = "",
    targetModule = name;
  const inRootDir = /^(admin\/)|(portal\/)|(idp\/)/.test(name);
  const inModuleDir = /src\/(admin|portal|idp)/.test(appDirectory);
  if (inRootDir && !inModuleDir) {
    if (name.indexOf(app + "/modules") < 0 || !/\/(\w+)$/.test(name)) {
      console.warn(
        chalk.green(
          'if you want to generate file system in idaas-web project, please enter target directory path like "admin/modules/test" \n'
        )
      );
      process.exit(1);
    }
    app = name.match(/^(admin|portal|idp)/)[1];
    targetModule = name.match(/\/(\w+)$/)[1];
    targetDir = name.match(/^\w+\/(.+)\/\w+$/)[1];
    appDirectory = /\/(src)$/.test(appDirectory)
      ? appDirectory
      : `${appDirectory}/src`;
    absoluteTargetDir = path.join(appDirectory, app, targetDir || "");
  } else if (inModuleDir) {
    app = appDirectory.match(/src\/(admin|portal|idp)/)[1];
    targetModule = name.match(/\/?(\w+)$/)[1];
    targetDir = name.match(/(.+)\/\w+$/)? name.match(/(.+)\/\w+$/)[1] : "";
    absoluteTargetDir = path.join(appDirectory, targetDir || "");
  } else {
    console.warn(
      chalk.green(
        'if you want to generate file system in idaas-web project, please enter target directory path like "admin/modules/test" \n'
      )
    );
    process.exit(1);
  }
  const ModuleName = targetModule.replace(
    /^\w/,
    targetModule.charAt(0).toUpperCase()
  );
  return {
    fileName: {
      base: app === "admin" ? "base" : app + "Base",
      actionTypes: ModuleName + "ActionsTypes",
      status: ModuleName + "Status",
      desc: ModuleName + "Description",
      types: ModuleName + "Types",
      actions: ModuleName + "Actions",
      store: ModuleName + "Store",
      reducer: ModuleName + "Reducer",
      container: ModuleName + "Container",
      rootView: ModuleName + "RootView",
      style: ModuleName,
    },
    variableName: {
      state: targetModule + "State",
      style: ModuleName + "Less",
    },
    folderPath: {
      rootPath: `./tempDist`,
      module: `./tempDist/${targetModule}`,
      constants: `./tempDist/${targetModule}/constants`,
      view: `./tempDist/${targetModule}/view`,
      style: `./tempDist/${targetModule}/style`,
    },
    projectPath: {
      app: app,
      targetDir: targetDir,
      targetModule: targetModule,
      absoluteTargetDir: absoluteTargetDir,
    },
  };
};
