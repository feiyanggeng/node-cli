"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.describe = exports.command = void 0;
const fs = require("fs");
const chalk = require("chalk");
const figlet = require("figlet");
const shell = require("shelljs");
const readline = require("readline");
const GenFileConfig_1 = require("./GenFileConfig");
const utils_1 = require("../../utils");
const actions_1 = require("./template/actions");
const actionTypes_1 = require("./template/actionTypes");
const container_1 = require("./template/container");
const reducer_1 = require("./template/reducer");
const rootView_1 = require("./template/rootView");
const status_1 = require("./template/status");
const style_1 = require("./template/style");
const types_1 = require("./template/types");
const handleError = err => {
    if (err) {
        console.error(chalk.red(err));
        process.exit(1);
    }
};
const createFiles = (moduleName) => {
    const { fileName, folderPath, projectPath, variableName } = GenFileConfig_1.default(moduleName);
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
            return handleError("  😭  Need fileData, folderPath, file arguments to write file");
        }
        let str = replaceStr(fileData);
        fs.writeFileSync(`${folderPath}/${file}`, prettier ? utils_1.prettierFile(str) : str);
    };
    try {
        utils_1.mkdirSync(folderPath.rootPath);
        utils_1.mkdirSync(folderPath.module);
        utils_1.mkdirSync(folderPath.constants);
        utils_1.mkdirSync(folderPath.view);
        utils_1.mkdirSync(folderPath.style);
    }
    catch (e) {
        console.error(chalk.red(e));
        process.exit(1);
    }
    writeFile(actionTypes_1.default, folderPath.constants, `${fileName.actionTypes}.ts`, true);
    writeFile(status_1.default, folderPath.constants, `${fileName.status}.ts`, false);
    writeFile(types_1.default, folderPath.constants, `${fileName.types}.ts`, true);
    writeFile(actions_1.default, folderPath.module, `${fileName.actions}.ts`, true);
    writeFile(reducer_1.default, folderPath.module, `${fileName.reducer}.ts`, true);
    writeFile(container_1.default, folderPath.view, `${fileName.container}.tsx`, true);
    writeFile(rootView_1.default, folderPath.view, `${fileName.rootView}.tsx`, true);
    writeFile(style_1.default, folderPath.style, `${fileName.style}.less`, false);
    // TODO: 这里是异步的，应该作为同步执行，并且需要判断输入的参数是否为一个路径
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question(chalk.yellow(`copy file to idass-web directory? yes or no? \n \n`), (answer) => {
        if (answer === "yes" || answer === "y") {
            utils_1.mkdirSync(projectPath.absoluteTargetDir);
            shell.cp("-R", folderPath.module, projectPath.absoluteTargetDir);
            shell.rm("-rf", folderPath.rootPath);
        }
        console.log(chalk.yellow(figlet.textSync("SUCCESS", { horizontalLayout: "full" })));
        rl.close();
    });
};
const handler = (argv) => {
    createFiles(argv._[1]);
};
exports.handler = handler;
const command = "genfiles";
exports.command = command;
const describe = "创建 idaas-web 项目中模块初始代码";
exports.describe = describe;
//# sourceMappingURL=index.js.map