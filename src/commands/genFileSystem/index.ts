import * as fs from "fs";
import * as chalk from "chalk";
import * as figlet from "figlet";
import * as shell from "shelljs";
import * as readline from "readline";
import genFileConfig from "./GenFileConfig";
import { mkdirSync, prettierFile } from "../../utils"

import actionsData from "./template/actions";
import actionTypeData from "./template/actionTypes";
import containerData from "./template/container";
import reducerData from "./template/reducer";
import rootViewData from "./template/rootView";
import statusData from "./template/status";
import styleData from "./template/style";
import typesData from "./template/types";

const handleError = err => {
  if (err) {
    console.error(chalk.red(err));
    process.exit(1);
  }
};

const createFiles = (moduleName) => {
  const { fileName, folderPath, projectPath, variableName } = genFileConfig(
    moduleName
  );

  const replaceStr = (sourceText) => {
    const regs = [
      {
        reg: /\$base\$/g,
        str: fileName.base,
      },
      {
        reg: /\$actions\$/g,
        str: fileName.actions,
      },
      {
        reg: /\$store\$/g,
        str: fileName.store,
      },
      {
        reg: /\$reducer\$/g,
        str: fileName.reducer,
      },
      {
        reg: /\$rootView\$/g,
        str: fileName.rootView,
      },
      {
        reg: /\$container\$/g,
        str: fileName.container,
      },
      {
        reg: /\$actionTypes\$/g,
        str: fileName.actionTypes,
      },
      {
        reg: /\$types\$/g,
        str: fileName.types,
      },
      {
        reg: /\$status\$/g,
        str: fileName.status,
      },
      {
        reg: /\$stateName\$/g,
        str: variableName.state,
      },
      {
        reg: /\$style\$/g,
        str: `${fileName.style}.less`,
      },
      {
        reg: /\$styleLess\$/g,
        str: variableName.style,
      },
    ];

    for (let i = 0; i < regs.length; i++) {
      let regStr = regs[i];
      sourceText = sourceText.replace(regStr.reg, regStr.str);
    }

    return sourceText;
  };

  const writeFile = (fileData, folderPath, file, prettier) => {
    if (!fileData || !folderPath || !file) {
      return handleError(
        "  😭  Need fileData, folderPath, file arguments to write file"
      );
    }
    let str = replaceStr(fileData);
    fs.writeFileSync(`${folderPath}/${file}`, prettier ? prettierFile(str) : str);
  };

  try {
    mkdirSync(folderPath.rootPath)
    mkdirSync(folderPath.module);
    mkdirSync(folderPath.constants);
    mkdirSync(folderPath.view);
    mkdirSync(folderPath.style);
  } catch (e) {
    console.error(chalk.red(e));
    process.exit(1);
  }

  writeFile(
    actionTypeData,
    folderPath.constants,
    `${fileName.actionTypes}.ts`,
    true
  );
  writeFile(statusData, folderPath.constants, `${fileName.status}.ts`, false);
  writeFile(typesData, folderPath.constants, `${fileName.types}.ts`, true);
  writeFile(
    actionsData,
    folderPath.module,
    `${fileName.actions}.ts`,
    true
  );
  writeFile(
    reducerData,
    folderPath.module,
    `${fileName.reducer}.ts`,
    true
  );
  writeFile(
    containerData,
    folderPath.view,
    `${fileName.container}.tsx`,
    true
  );
  writeFile(
    rootViewData,
    folderPath.view,
    `${fileName.rootView}.tsx`,
    true
  );
  writeFile(
    styleData,
    folderPath.style,
    `${fileName.style}.less`,
    false
  );

  // TODO: 这里是异步的，应该作为同步执行，并且需要判断输入的参数是否为一个路径

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question(
    chalk.yellow(`copy file to idass-web directory? yes or no? \n \n`),
    (answer) => {
      if (answer === "yes" || answer === "y") {
        mkdirSync(projectPath.absoluteTargetDir);
        shell.cp("-R", folderPath.module, projectPath.absoluteTargetDir);
        shell.rm("-rf", folderPath.rootPath);
      }
      console.log(
        chalk.yellow(figlet.textSync("SUCCESS", { horizontalLayout: "full" }))
      );
      rl.close();
    }
  );
};

const handler = (argv) => {
  createFiles(argv._[1])
}
const command = "genfiles";
const describe = "创建 idaas-web 项目中模块初始代码";

export { command, describe, handler };