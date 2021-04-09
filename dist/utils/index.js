"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slash = exports.prettierFile = exports.mkdirSync = void 0;
const fs = require("fs");
const prettier = require("prettier");
/**
 * 创建文件夹
 * @param {string} dirPath 文件夹地址
 */
function mkdirSync(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}
exports.mkdirSync = mkdirSync;
/**
 * 使用 Prettier 格式化文件
 * @param fileContent
 */
function prettierFile(fileContent) {
    try {
        return prettier.format(fileContent, {
            parser: 'typescript',
            printWidth: 100,
            singleQuote: true,
            trailingComma: "all",
            arrowParens: "always",
            semi: true,
            tabWidth: 2
        });
    }
    catch (e) {
        console.error(`代码格式化报错！${e.toString()}\n代码为：${fileContent}`);
        return fileContent;
    }
}
exports.prettierFile = prettierFile;
function slash(path) {
    const isExtendedLengthPath = /^\\\\\?\\/.test(path);
    const hasNonAscii = /[^\u0000-\u0080]+/.test(path); // eslint-disable-line no-control-regex
    if (isExtendedLengthPath || hasNonAscii) {
        return path;
    }
    return path.replace(/\\/g, '/');
}
exports.slash = slash;
;
//# sourceMappingURL=index.js.map