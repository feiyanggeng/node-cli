import * as fs  from 'fs';
import * as chalk  from 'chalk';
import * as path  from 'path';
import * as _  from 'lodash';
import * as unzip  from 'unzipper';
import { slash, mkdirSync } from "../utils";

function replaceIconfont(iconfontSourcePath) {
  iconfontSourcePath = slash(iconfontSourcePath);
  const sourcePathArr: string[] = iconfontSourcePath.split("/");
  const iconfontZip: string = _.last(sourcePathArr);
  const iconfontSuffix = iconfontZip.split(".")[1];
  if (!fs.existsSync(iconfontSourcePath)) {
    console.log(chalk.yellow(" 😭  Must pass the EXIST file! \n"));
    process.exit(1);
  }
  if (iconfontSuffix !== "zip") {
    console.log(
      chalk.yellow(" 😭  Must pass the iconfont download zip file! \n")
    );
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

  const copyFile = (sourcePath, targetPath, replaceFunc?:Function) => {
    fs.copyFile(sourcePath, targetPath, (err) => {
      if (err) {
        console.error(chalk.red(err));
      } else {
        console.log(
          chalk.green("copy"),
          chalk.yellow(_.last(targetPath.split("/"))),
          chalk.green("success!")
        );
      }
    });
  };

  fs.createReadStream(iconfontSourcePath)
    .pipe(unzip.Parse())
    .on("entry", function (entry) {
      const fileName: string = _.last(entry.path.split("/"));
      const type = entry.type; // 'Directory' or 'File'
      if (type === "File") {
        const sourcePath = path.join(unzipTargetPath, fileName);
        entry.pipe(fs.createWriteStream(sourcePath)).on("close", function () {
          if (
            ["eot", "js", "svg", "ttf", "woff", "css"].includes(
              _.last(fileName.split("."))
            )
          ) {
            mkdirSync(iconfontTargetPath);
            const targetPath = path.join(iconfontTargetPath, fileName);
            copyFile(sourcePath, targetPath);
          }
        });
      } else {
        entry.autodrain();
      }
    });
}

export default replaceIconfont;