#!/usr/bin/env node

const startCompare = require("./commitCompare");
const createFiles = require("./genFileSystem");
const replaceIconfont = require("./replaceIconfont")
const { runKiwi } = require("./kiwi")

process.title = "yufu";

const yargs = require("yargs")
  .usage("Usage: YUFU [options]")
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
      describe: "创建 idaas-web 项目中模块初始代码 (参数值：模块的名称)",
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
  .command("kiwi", "kiwi 相关的所有命令集合", runKiwi)
  .epilog("前端项目工具类脚本集合");

const argvs = yargs.argv;
const command = argvs._[0];

if (!command) {
  if (argvs.commitCompare) {
    startCompare();
  } else if (argvs.genfiles) {
    createFiles(argvs.genfiles);
  } else if (argvs.iconfont) {
    replaceIconfont(argvs.iconfont);
  } else {
    console.log("找不到该命令");
  }
}
 