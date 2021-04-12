import * as inquirer from 'inquirer';
import * as fs from "fs";
import { initProject } from './init';
import { sync } from './sync';
import { exportMessages } from './export';
import { importMessages } from './import';
import { findUnUsed } from './unused';
import { extractAll } from './extract/extract';
import comb from "./comb/comb";
import checkComb from "./comb/check"

/**
 * 进度条加载
 * @param text
 * @param callback
 */
function spining(text, callback) {
  console.log(`${text}中...`);
  if (callback) {
    callback();
  }
  console.log(`${text}成功`);
}

async function init () {
    const result = await inquirer.prompt({
      type: 'confirm',
      name: 'confirm',
      default: true,
      message: '项目中是否已存在kiwi相关目录？'
    });
    if (!result.confirm) {
      spining('初始化项目', async () => {
        initProject();
      });
    } else {
      const value = await inquirer.prompt({
        type: 'input',
        name: 'dir',
        message: '请输入相关目录：'
      });
      spining('初始化项目', async () => {
        initProject(value.dir);
      });
    }
  }

async function importKiwi(filePath, lang, info) {
    spining("导入翻译文案", async () => {
      if (!filePath || !lang) {
        console.log(
          "请按格式输入：--import [file] [lang] [info]"
        );
      } else {
        await importMessages(filePath, lang);

        console.log("开始整理翻译文件...");
        if (info) {
          checkComb(info);
        } else {
          comb();
        }
      }
    });
}

function exportKiwi (file, lang) {
    spining("导出未翻译的文案", () => {
    if (!file && !lang) {
      exportMessages();
    } else {
      exportMessages(file, lang);
    }
  });
}

async function extract(gk, dir) {
  if (!gk) {
    const google = await inquirer.prompt({
      type: "input",
      name: "gk",
      message: "请输入googleApiKey：",
    });
    gk = google.gk;
  }
  extractAll(dir, gk);
}


function builder(yargs) {
  const argv = yargs
    .reset()
    .options({
      init: {
        alias: "i",
        description: "初始化 kiwi 文件夹",
        type: "boolean",
      },
      extract: {
        alias: "e",
        description:
          "一键替换指定文件夹下的所有中文文案 --extract [dirPath] [apiKey]",
        type: "string",
      },
      sync: {
        alias: "s",
        description: "同步各种语言的文案",
        type: "boolean",
      },
      export: {
        alias: "E",
        description: "导出各种语言的翻译文案 --export [filePath] [lang] ",
        type: "boolean",
      },
      unused: {
        alias: "u",
        description: "导出未使用的文案",
        type: "boolean",
      },
      import: {
        alias: "I",
        description: "导入已经翻译好的文案 --import [filePath] [lang]",
        type: "string",
      },
    })
    .help("h")
    .alias("h", "help")
    .epilog("kiwi 工具命令集合").argv;

  if (argv.init) {
    init();
  } else if (argv.extract) {
    const googleApiKey = argv._[1];
    if (fs.existsSync(argv.extract)) {
      extract(googleApiKey, argv.extract);
    } else {
      console.log("输入的文件夹不存在！");
      process.exit(1);
    }
  } else if (argv.sync) {
    sync(() => {
      console.log("同步文案完成");
    });
  } else if (argv.export) {
    const file = argv._[1];
    const lang = argv._[2];
    exportKiwi(file, lang);
  } else if (argv.unused) {
    spining("导出未使用的文案", () => {
      findUnUsed();
    });
  } else if (argv.import) {
    const filePath = argv.import;
    const lang = argv._[1];
    const info = argv._[2];
    importKiwi(filePath, lang, info);
  } else {
    console.log("找不到改命令");
  }
}

const command = "kiwi", describe = "kiwi相关命令集合"

export { command, describe, builder };