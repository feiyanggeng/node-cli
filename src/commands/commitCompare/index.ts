/**
 * 两个分支的 commit 对比
 */

import * as inquirer from "inquirer";
import * as shell from "shelljs";
import * as chalk from "chalk";
import * as fs from "fs";
import * as path from "path";

const prompt = inquirer.createPromptModule();

const promptMessages = [
  {
    type: "input",
    name: "leftBranch",
    validate(input) {
      const done = this.async();
      if (!input) {
        done(chalk.red("This branch is required!"));
      } else {
        done(null, true);
      }
    },
    message: "What is the fast forward branch. (e.g. RC-ADMIN-20.5.4-B)",
  },
  {
    type: "input",
    name: "rightBranch",
    default: "master",
    message:
      "What is the branch to be compared. Press enter to choose [master]",
  },
];

function getCommitLogs(branchName, logFormat) {
  try {
    const resultStr = shell.exec(
      `git log origin/${branchName} --pretty=format:"${logFormat}"`,
      { silent: true }
    );
    return resultStr.split("\n");
  } catch (err) {
    return [];
  }
}

function writeDiffLogs(lBranch, rBranch) {
  console.log(lBranch, rBranch);
  const lLogs = getCommitLogs(lBranch, "%h / %s / %ae / %ci");
  const rLogs = getCommitLogs(rBranch, "%s");
  const dirPath = path.resolve(process.cwd(), "./commitDiffs");
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
  const filePath = path.resolve(dirPath, `${lBranch}_${rBranch}_diff.md`);
  fs.appendFileSync(
    filePath,
    `## ${lBranch} 和 ${rBranch} commit 对比结果：\n\n`
  );
  // 每次加入运行脚本时间戳；
  fs.appendFileSync(filePath, `> 运行时间：${new Date().toLocaleString()}\n\n`);
  fs.appendFileSync(
    filePath,
    "| commit id | commit title | author | timestamp |\n| --- | :--- | --- | --- |\n"
  );
  lLogs.forEach((log) => {
    const logInfos = log.split(" / ");
    const commitInfo = logInfos[1];
    if (!rLogs.includes(commitInfo)) {
      fs.appendFileSync(filePath, `|${logInfos.join(" | ")} |\n`);
    }
  });
  fs.appendFileSync(filePath, `\n\n`);
}

const handler = () => {
  prompt(promptMessages).then((answer) => {
    const { leftBranch, rightBranch } = answer;
    writeDiffLogs(leftBranch, rightBranch);
  });
};

const command = "commitCompare";
const describe = "对比两个分支的 commit 信息";

export { command, describe, handler };


