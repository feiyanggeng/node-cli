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
exports.writeFile = exports.readFile = exports.getSpecifiedFiles = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
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
        // 格式化为 string[]
        ignoreDirectory = !ignoreDirectory ? [] : Array.isArray(ignoreDirectory) ? ignoreDirectory : [ignoreDirectory];
        const dirName = formatIgnoreDirectory(path.dirname(name));
        const isNotIgnoreDirectory = !ignoreDirectory.some(d => dirName.indexOf(formatIgnoreDirectory(d)) > -1);
        let isNotIgnoreFile = true;
        if (ignoreFile instanceof RegExp) {
            isNotIgnoreFile = !ignoreFile.test(name);
        }
        else if (ignoreFile && typeof ignoreFile === 'string') {
            isNotIgnoreFile = !formatIgnoreFile(name).endsWith(formatIgnoreFile(ignoreFile));
        }
        if (isFile && isNotIgnoreDirectory && isNotIgnoreFile) {
            return files.concat(name);
        }
        return files;
    }, []);
}
exports.getSpecifiedFiles = getSpecifiedFiles;
/**
 * 读取文件
 * @param fileName
 */
function readFile(fileName) {
    if (fs.existsSync(fileName)) {
        return fs.readFileSync(fileName, 'utf-8');
    }
}
exports.readFile = readFile;
/**
 * 读取文件
 * @param fileName
 */
function writeFile(filePath, file) {
    if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, utils_1.prettierFile(file));
    }
}
exports.writeFile = writeFile;
//# sourceMappingURL=file.js.map