"use strict";
/**
 * @author linhuiw
 * @desc 初始化 kiwi 项目的文件以及配置
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.initProject = void 0;
const _ = __importStar(require("lodash"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const utils_1 = require("./utils");
const const_1 = require("./const");
function creteConfigFile(existDir) {
    if (!utils_1.lookForFiles(path.resolve(process.cwd(), `./`), const_1.KIWI_CONFIG_FILE)) {
        const existConfigFile = _.endsWith(existDir, "/")
            ? `${existDir}${const_1.KIWI_CONFIG_FILE}`
            : `${existDir}/${const_1.KIWI_CONFIG_FILE}`;
        if (existDir &&
            fs.existsSync(existDir) &&
            !fs.existsSync(existConfigFile)) {
            const config = JSON.stringify(Object.assign(Object.assign({}, const_1.PROJECT_CONFIG.defaultConfig), { kiwiDir: existDir, configFile: existConfigFile }), null, 2);
            fs.writeFile(existConfigFile, config, (err) => {
                if (err) {
                    console.log(err);
                }
            });
        }
        else if (!fs.existsSync(const_1.PROJECT_CONFIG.configFile)) {
            const config = JSON.stringify(const_1.PROJECT_CONFIG.defaultConfig, null, 2);
            fs.writeFile(const_1.PROJECT_CONFIG.configFile, config, (err) => {
                if (err) {
                    console.log(err);
                }
            });
        }
    }
}
function createCnFile() {
    const cnDir = `${const_1.PROJECT_CONFIG.dir}/zh-CN`;
    if (!fs.existsSync(cnDir)) {
        fs.mkdirSync(cnDir);
        fs.writeFile(`${cnDir}/index.ts`, const_1.PROJECT_CONFIG.zhIndexFile, (err) => {
            if (err) {
                console.log(err);
            }
        });
        fs.writeFile(`${cnDir}/common.ts`, const_1.PROJECT_CONFIG.zhTestFile, (err) => {
            if (err) {
                console.log(err);
            }
        });
    }
}
function initProject(existDir) {
    /** 初始化配置文件夹 */
    if (existDir) {
        if (!fs.existsSync(existDir)) {
            console.log("输入的目录不存在，已为你生成默认文件夹");
            fs.mkdirSync(const_1.PROJECT_CONFIG.dir);
        }
    }
    else if (!fs.existsSync(const_1.PROJECT_CONFIG.dir)) {
        console.log("创建文件夹");
        fs.mkdirSync(const_1.PROJECT_CONFIG.dir);
    }
    creteConfigFile(existDir);
    if (!(existDir && fs.existsSync(existDir))) {
        createCnFile();
    }
}
exports.initProject = initProject;
//# sourceMappingURL=init.js.map