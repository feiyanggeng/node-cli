"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.describe = exports.command = void 0;
const fs = require("fs");
const chalk = require("chalk");
const path = require("path");
const _ = require("lodash");
const unzip = require("unzipper");
const utils_1 = require("../../utils");
function replaceIconfont(iconfontSourcePath) {
    iconfontSourcePath = utils_1.slash(iconfontSourcePath);
    const sourcePathArr = iconfontSourcePath.split("/");
    const iconfontZip = _.last(sourcePathArr);
    const iconfontSuffix = iconfontZip.split(".")[1];
    if (!fs.existsSync(iconfontSourcePath)) {
        console.log(chalk.yellow(" 😭  Must pass the EXIST file! \n"));
        process.exit(1);
    }
    if (iconfontSuffix !== "zip") {
        console.log(chalk.yellow(" 😭  Must pass the iconfont download zip file! \n"));
        process.exit(1);
    }
    _.pullAt(sourcePathArr, sourcePathArr.length - 1);
    sourcePathArr.push("iconfont");
    const unzipTargetPath = sourcePathArr.join("/");
    if (!fs.existsSync(unzipTargetPath)) {
        fs.mkdirSync(unzipTargetPath, 0o755);
    }
    const appDirectory = fs.realpathSync(process.cwd());
    const iconfontTargetPath = path.resolve(appDirectory, "static/fonts");
    const copyFile = (sourcePath, targetPath, replaceFunc) => {
        fs.copyFile(sourcePath, targetPath, (err) => {
            if (err) {
                console.error(chalk.red(err));
            }
            else {
                console.log(chalk.green("copy"), chalk.yellow(_.last(targetPath.split("/"))), chalk.green("success!"));
            }
        });
    };
    fs.createReadStream(iconfontSourcePath)
        .pipe(unzip.Parse())
        .on("entry", function (entry) {
        const fileName = _.last(entry.path.split("/"));
        const type = entry.type; // 'Directory' or 'File'
        if (type === "File") {
            const sourcePath = path.join(unzipTargetPath, fileName);
            entry.pipe(fs.createWriteStream(sourcePath)).on("close", function () {
                if (["eot", "js", "svg", "ttf", "woff", "css"].includes(_.last(fileName.split(".")))) {
                    utils_1.mkdirSync(iconfontTargetPath);
                    const targetPath = path.join(iconfontTargetPath, fileName);
                    copyFile(sourcePath, targetPath);
                }
            });
        }
        else {
            entry.autodrain();
        }
    });
}
const handler = (argv) => {
    replaceIconfont(argv._[1]);
};
exports.handler = handler;
const command = "iconfont";
exports.command = command;
const describe = "替换项目中 iconfont 资源（iconfont ~/Download/download.zip）";
exports.describe = describe;
//# sourceMappingURL=index.js.map