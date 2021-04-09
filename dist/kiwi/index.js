"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runKiwi = void 0;
const inquirer = __importStar(require("inquirer"));
const fs = __importStar(require("fs"));
const init_1 = require("./init");
const sync_1 = require("./sync");
const export_1 = require("./export");
const import_1 = require("./import");
const unused_1 = require("./unused");
const extract_1 = require("./extract/extract");
const comb_1 = __importDefault(require("./comb/comb"));
const check_1 = __importDefault(require("./comb/check"));
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
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield inquirer.prompt({
            type: 'confirm',
            name: 'confirm',
            default: true,
            message: '项目中是否已存在kiwi相关目录？'
        });
        if (!result.confirm) {
            spining('初始化项目', () => __awaiter(this, void 0, void 0, function* () {
                init_1.initProject();
            }));
        }
        else {
            const value = yield inquirer.prompt({
                type: 'input',
                name: 'dir',
                message: '请输入相关目录：'
            });
            spining('初始化项目', () => __awaiter(this, void 0, void 0, function* () {
                init_1.initProject(value.dir);
            }));
        }
    });
}
function importKiwi(filePath, lang, info) {
    return __awaiter(this, void 0, void 0, function* () {
        spining("导入翻译文案", () => __awaiter(this, void 0, void 0, function* () {
            if (!filePath || !lang) {
                console.log("请按格式输入：--import [file] [lang] [info]");
            }
            else {
                yield import_1.importMessages(filePath, lang);
                console.log("开始整理翻译文件...");
                if (info) {
                    check_1.default(info);
                }
                else {
                    comb_1.default();
                }
            }
        }));
    });
}
function exportKiwi(file, lang) {
    spining("导出未翻译的文案", () => {
        if (!file && !lang) {
            export_1.exportMessages();
        }
        else {
            export_1.exportMessages(file, lang);
        }
    });
}
// if (commander.mock) {
//   const spinner = ora('使用 Google 翻译中...').start();
//   sync(async () => {
//     if (commander.mock === true && commander.args.length === 0) {
//       await mockLangs();
//     } else {
//       await mockLangs(commander.mock, commander.args[0]);
//     }
//     spinner.succeed('使用 Google 翻译成功');
//   });
// }
function extract(gk, dir) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!gk) {
            const google = yield inquirer.prompt({
                type: "input",
                name: "gk",
                message: "请输入googleApiKey：",
            });
            gk = google.gk;
        }
        extract_1.extractAll(dir, gk);
    });
}
function runKiwi(yargs) {
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
            description: "一键替换指定文件夹下的所有中文文案 --extract [dirPath] [apiKey]",
            type: "string",
        },
        sync: {
            alias: "s",
            description: "同步各种语言的文案",
            type: "boolean",
        },
        export: {
            alias: "E",
            description: "导出各种语言的翻译文案 --export [file] [lang] ",
            type: "boolean",
        },
        unused: {
            alias: "u",
            description: "导出未使用的文案",
            type: "boolean",
        },
        import: {
            alias: "I",
            description: "导入已经翻译好的文案",
            type: "string",
        },
    })
        .help("h")
        .alias("h", "help")
        .epilog("kiwi 工具命令集合").argv;
    if (argv.init) {
        init();
    }
    else if (argv.extract) {
        const googleApiKey = argv._[1];
        if (fs.existsSync(argv.extract)) {
            extract(googleApiKey, argv.extract);
        }
        else {
            console.log("输入的文件夹不存在！");
            process.exit(1);
        }
    }
    else if (argv.sync) {
        sync_1.sync(() => {
            console.log("同步文案完成");
        });
    }
    else if (argv.export) {
        const file = argv._[1];
        const lang = argv._[2];
        exportKiwi(file, lang);
    }
    else if (argv.unused) {
        spining("导出未使用的文案", () => {
            unused_1.findUnUsed();
        });
    }
    else if (argv.import) {
        const filePath = argv.import;
        const lang = argv._[1];
        const info = argv._[2];
        importKiwi(filePath, lang, info);
    }
    else {
        console.log("找不到改命令");
    }
}
exports.runKiwi = runKiwi;
//# sourceMappingURL=index.js.map