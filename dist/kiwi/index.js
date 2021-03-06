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
 * ???????????????
 * @param text
 * @param callback
 */
function spining(text, callback) {
    console.log(`${text}???...`);
    if (callback) {
        callback();
    }
    console.log(`${text}??????`);
}
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield inquirer.prompt({
            type: 'confirm',
            name: 'confirm',
            default: true,
            message: '????????????????????????kiwi???????????????'
        });
        if (!result.confirm) {
            spining('???????????????', () => __awaiter(this, void 0, void 0, function* () {
                init_1.initProject();
            }));
        }
        else {
            const value = yield inquirer.prompt({
                type: 'input',
                name: 'dir',
                message: '????????????????????????'
            });
            spining('???????????????', () => __awaiter(this, void 0, void 0, function* () {
                init_1.initProject(value.dir);
            }));
        }
    });
}
function importKiwi(filePath, lang, info) {
    return __awaiter(this, void 0, void 0, function* () {
        spining("??????????????????", () => __awaiter(this, void 0, void 0, function* () {
            if (!filePath || !lang) {
                console.log("?????????????????????--import [file] [lang] [info]");
            }
            else {
                yield import_1.importMessages(filePath, lang);
                console.log("????????????????????????...");
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
    spining("????????????????????????", () => {
        if (!file && !lang) {
            export_1.exportMessages();
        }
        else {
            export_1.exportMessages(file, lang);
        }
    });
}
// if (commander.mock) {
//   const spinner = ora('?????? Google ?????????...').start();
//   sync(async () => {
//     if (commander.mock === true && commander.args.length === 0) {
//       await mockLangs();
//     } else {
//       await mockLangs(commander.mock, commander.args[0]);
//     }
//     spinner.succeed('?????? Google ????????????');
//   });
// }
function extract(gk, dir) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!gk) {
            const google = yield inquirer.prompt({
                type: "input",
                name: "gk",
                message: "?????????googleApiKey???",
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
            description: "????????? kiwi ?????????",
            type: "boolean",
        },
        extract: {
            alias: "e",
            description: "??????????????????????????????????????????????????? --extract [dirPath] [apiKey]",
            type: "string",
        },
        sync: {
            alias: "s",
            description: "???????????????????????????",
            type: "boolean",
        },
        export: {
            alias: "E",
            description: "????????????????????????????????? --export [file] [lang] ",
            type: "boolean",
        },
        unused: {
            alias: "u",
            description: "????????????????????????",
            type: "boolean",
        },
        import: {
            alias: "I",
            description: "??????????????????????????????",
            type: "string",
        },
    })
        .help("h")
        .alias("h", "help")
        .epilog("kiwi ??????????????????").argv;
    if (argv.init) {
        init();
    }
    else if (argv.extract) {
        const googleApiKey = argv._[1];
        if (fs.existsSync(argv.extract)) {
            extract(googleApiKey, argv.extract);
        }
        else {
            console.log("??????????????????????????????");
            process.exit(1);
        }
    }
    else if (argv.sync) {
        sync_1.sync(() => {
            console.log("??????????????????");
        });
    }
    else if (argv.export) {
        const file = argv._[1];
        const lang = argv._[2];
        exportKiwi(file, lang);
    }
    else if (argv.unused) {
        spining("????????????????????????", () => {
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
        console.log("??????????????????");
    }
}
exports.runKiwi = runKiwi;
//# sourceMappingURL=index.js.map