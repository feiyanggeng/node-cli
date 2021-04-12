#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commitCompare_1 = require("./commitCompare");
const genFileSystem_1 = require("./genFileSystem");
const replaceIconfont_1 = require("./replaceIconfont");
const kiwi_1 = require("./kiwi");
process.title = "yufu";
const yargs = require("yargs")
    .usage("Usage: yf [options]")
    .help("h")
    .alias("h", "help")
    .alias("v", "version")
    .options({
    commitCompare: {
        alias: "c",
        describe: "对比两个分支的 commit 信息",
        type: "boolean",
        global: false,
    },
    genfiles: {
        alias: "g",
        describe: "创建 idaas-web 项目中模块初始代码（--genfiles admin/modules/app/appList)",
        type: "string",
        global: false,
    },
    iconfont: {
        alias: "i",
        describe: "替换项目中 iconfont 资源（--iconfont ~/Download/download.zip）",
        type: "string",
        global: false,
    },
})
    .command("kiwi", "kiwi 相关的所有命令集合", kiwi_1.default)
    .epilog("前端项目工具类脚本集合-yufu");
const argvs = yargs.argv;
const command = argvs._[0];
if (!command) {
    if (argvs.commitCompare) {
        commitCompare_1.default();
    }
    else if (argvs.genfiles) {
        genFileSystem_1.default(argvs.genfiles);
    }
    else if (argvs.iconfont) {
        replaceIconfont_1.default(argvs.iconfont);
    }
    else {
        console.log("找不到该命令");
    }
}
//# sourceMappingURL=index.js.map