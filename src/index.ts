#!/usr/bin/env node

process.title = "yufu";

const yargs = require("yargs")
  .usage("Usage: $0 <command> [options]")
  .help("h")
  .alias("h", "help")
  .alias("v", "version")
  .commandDir("./commands", { recurse: true })
  .epilog("前端项目工具类脚本集合");

const argvs = yargs.argv;
const command = argvs._[0];

if (!command) {
  console.log("找不到该命令");
}
 