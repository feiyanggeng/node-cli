"use strict";
/**
 * @author doubledream
 * @desc 文件处理方法
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
exports.initialConfig = exports.getOriginIntlObject = exports.getUsedCombDirs = exports.isFileIgnore = exports.generateValueMap = exports.getSpecifiedFiles = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const _ = __importStar(require("lodash"));
const utils_1 = require("../utils");
// 格式化 ignoreDirectory
function formatIgnoreDirectory(dir) {
    if (!dir)
        return '';
    if (!/^\//.test(dir)) {
        dir = '/' + dir;
    }
    if (!/\/$/.test(dir)) {
        dir = dir + '/';
    }
    return dir;
}
function formatIgnoreFile(file) {
    return !file ? '' : /^\//.test(file) ? file : '/' + file;
}
function isFileIgnore(file, ignoreDirectory, ignoreFile) {
    // 格式化为 string[]
    ignoreDirectory = !ignoreDirectory
        ? []
        : Array.isArray(ignoreDirectory)
            ? ignoreDirectory
            : [ignoreDirectory];
    const dirName = formatIgnoreDirectory(path.dirname(file));
    const isIgnoreDirectory = ignoreDirectory.some((d) => dirName.indexOf(formatIgnoreDirectory(d)) > -1);
    let isIgnoreFile = false;
    if (ignoreFile instanceof RegExp) {
        isIgnoreFile = ignoreFile.test(file);
    }
    else if (ignoreFile && typeof ignoreFile === 'string') {
        isIgnoreFile = formatIgnoreFile(file).endsWith(formatIgnoreFile(ignoreFile));
    }
    return isIgnoreDirectory || isIgnoreFile;
}
exports.isFileIgnore = isFileIgnore;
/**
 * 获取文件夹下符合要求的所有文件
 * @function getSpecifiedFiles
 * @param  {string} dir 路径
 * @param {ignoreDirectory} 忽略文件夹 {ignoreFile} 忽略的文件
 */
function getSpecifiedFiles(dir, ignoreDirectory, ignoreFile) {
    return fs.readdirSync(dir).reduce((files, file) => {
        const name = path.join(dir, file);
        const isDirectory = fs.statSync(name).isDirectory();
        const isFile = fs.statSync(name).isFile();
        if (isDirectory) {
            return files.concat(getSpecifiedFiles(name, ignoreDirectory, ignoreFile));
        }
        if (isFile &&
            !isFileIgnore(name, ignoreDirectory, ignoreFile) &&
            ['.js', '.jsx', '.json', '.ts', '.tsx'].includes(path.extname(name))) {
            return files.concat(name);
        }
        return files;
    }, []);
}
exports.getSpecifiedFiles = getSpecifiedFiles;
// invertObject 具有副作用
function generateValueMap(I18N, invertObject, parentKey) {
    let invertObj = invertObject || {};
    _.forEach(I18N, (value, key) => {
        if (_.isString(value)) {
            // 不能用 lodash _.get _.set 处理不好 key 字符串中有 '.' 的情况
            const existKeys = invertObj[value];
            const currentKey = `I18N${parentKey ? '.' + parentKey : ''}.${key}`;
            invertObj[value] = Array.isArray(existKeys) ? existKeys.concat([currentKey]) : [currentKey];
        }
        else {
            // 对象则递归
            generateValueMap(value, invertObj, key);
        }
    });
    return invertObj;
}
exports.generateValueMap = generateValueMap;
// 解析配置，获得可处理的模块目录
function getUsedCombDirs(option, ROOT_DIR) {
    let { combDir, combBatchDir } = option;
    combDir = combDir ? path.join(ROOT_DIR, combDir) : combDir;
    combBatchDir = combBatchDir ? path.join(ROOT_DIR, combBatchDir) : combBatchDir;
    const usedCombDir = combDir ? [combDir] : [];
    if (combBatchDir) {
        const files = fs.readdirSync(combBatchDir);
        files.forEach((file) => {
            const name = path.join(combBatchDir, file);
            usedCombDir.push(name);
        });
    }
    // 输出 dir | file
    return usedCombDir;
}
exports.getUsedCombDirs = getUsedCombDirs;
// 获得已存在的中英文翻译对象
function getOriginIntlObject(config, kiwiDir) {
    const allLangData = {};
    const I18NPaths = config.LANGS.map((lang) => {
        if (fs.existsSync(path.join(kiwiDir, lang))) {
            return getSpecifiedFiles(path.join(kiwiDir, lang));
        }
        else {
            return [];
        }
    });
    _.forEach(I18NPaths, (langPaths, lIdx) => {
        const I18N = {};
        _.forEach(langPaths, (langPath) => {
            const fileName = path.basename(langPath).split(".")[0];
            if (fileName === "index")
                return;
            I18N[fileName] = utils_1.getLangData(langPath);
        });
        allLangData[config.LANGS[lIdx]] = { I18N: I18N };
    });
    return allLangData;
}
exports.getOriginIntlObject = getOriginIntlObject;
// 预先将路径解析好
function initialConfig() {
    const config = utils_1.getProjectConfig();
    const ROOT_DIR = path.resolve(process.cwd(), "./");
    const { kiwiDir } = config;
    const KIWI_DIR = path.join(ROOT_DIR, kiwiDir);
    const TARGET_DIR = path.join(ROOT_DIR, ".Intl");
    const LANGS = [...config.distLangs, config.srcLang];
    return Object.assign(Object.assign({}, config), { KIWI_DIR, TARGET_DIR, ROOT_DIR, LANGS });
}
exports.initialConfig = initialConfig;
//# sourceMappingURL=utils.js.map