"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * 用来梳理 admin | idp | portal 中翻译文件（I18N）的脚本
 * NOTICE：先到 ./config.ts 中完成编译配置再执行 npm run comb
 * 使用 TS 是因为项目中的 I18N 文件是 TS 的
 * */
const chalk = require("chalk");
const fs = require("fs");
const _ = require("lodash");
const path = require("path");
const utils_1 = require("./utils");
const utils_2 = require("../utils");
// 写入问题报告
function writeReport(config, report) {
    const code = utils_2.prettierFile(JSON.stringify(report, null, 2), { parser: 'json' });
    if (!fs.existsSync(config.TARGET_DIR))
        fs.mkdirSync(config.TARGET_DIR);
    fs.writeFileSync(path.join(config.TARGET_DIR, 'check_report.json'), code);
}
// 解析 config 批量处理
function extractIntlBatch(config, targetIntl, needLogInfo) {
    // 用来记录处理过程中没有引用的变量及所在目录
    const errorLogs = {};
    const fileZH = {};
    config.compileOptions.forEach((option) => {
        const { ignoreDirectory, ignoreFile } = option;
        const usedCombDir = utils_1.getUsedCombDirs(option, config.ROOT_DIR);
        usedCombDir.forEach((dir) => {
            const stat = fs.statSync(dir);
            if (stat.isDirectory()) {
                const usedFiles = utils_1.getSpecifiedFiles(dir, ignoreDirectory, ignoreFile);
                usedFiles.forEach((file) => handleFile(file));
            }
            if (stat.isFile() && !utils_1.isFileIgnore(dir, ignoreDirectory, ignoreFile)) {
                handleFile(dir);
            }
        });
    });
    function handleFile(file) {
        const code = utils_2.readFile(file);
        if (code) {
            const reg = /I18N\.((\w|\.)+)/g;
            const matches = code.match(reg) || [];
            matches.forEach((match) => {
                if (['I18N.get', 'I18N.template', 'I18N.getLang'].includes(match))
                    return;
                const isKeyUseful = config.LANGS.every((lang) => {
                    const value = _.get(targetIntl, `${lang}.${match}`);
                    const isStr = _.isString(value);
                    if (needLogInfo && lang === "zh-CN") {
                        const prevZH = fileZH[file];
                        fileZH[file] = [
                            ...(Array.isArray(prevZH) ? prevZH : []),
                            isStr ? value : "ERROR: 取值非字符串，查看 errorLogs",
                        ];
                    }
                    return value && isStr;
                });
                if (!isKeyUseful) {
                    const existFiles = errorLogs[match];
                    errorLogs[match] = Array.isArray(existFiles) ? existFiles.concat(file) : [file];
                }
            });
        }
    }
    const explain = {
        errorLogs: 'errorLogs：check 时出错的变量及使用这个变量的文件，出错原因：没有对应的中英文，或者变量取值不是字符串',
        fileZH: 'fileZH：文件中所包含的中文，可以用来在两个版本间对比，判断是否有少值, 需要 npm run comb -- --check --info',
    };
    writeReport(config, { explain, errorLogs, fileZH });
}
function checkComb(needLogInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        console.log('检查国际化翻译中...');
        const config = utils_1.initialConfig();
        // 1. 获得需要check的中英文翻译对象,请确保项目中已经开始使用这个翻译对象了（即：I18N 引用的是 config.TARGET_DIR 指向的翻译文件）
        const targetIntl = yield utils_1.getOriginIntlObject(config, config.TARGET_DIR);
        extractIntlBatch(config, targetIntl, needLogInfo);
        utils_2.deleteFolder(config.KIWI_DIR);
        utils_2.renameFolder(config.TARGET_DIR, config.KIWI_DIR);
        console.log(chalk.cyan(`  检查完成，请查看检查报告 ${path.join(config.TARGET_DIR, 'check_report.json')}.\n`));
    });
}
exports.default = checkComb;
//# sourceMappingURL=check.js.map