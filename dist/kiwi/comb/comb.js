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
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * 用来梳理 admin | idp | portal 中翻译文件（I18N）的脚本
 * NOTICE：先到 ./config.ts 中完成编译配置再执行 npm run comb
 * 使用 TS 是因为项目中的 I18N 文件是 TS 的
 * */
const fs = __importStar(require("fs"));
const _ = __importStar(require("lodash"));
const path = __importStar(require("path"));
const utils_1 = require("./utils");
const utils_2 = require("../utils");
// 避免 key 相同 value 值不相同的文案间互相覆盖
function avoidCoverage(preKey, targetIntl, zhValue, enValue) {
    const existZhValue = _.get(targetIntl, `zh-CN.${preKey}`);
    const existEnValue = _.get(targetIntl, `en-US.${preKey}`);
    if (!existZhValue)
        return preKey;
    if (existZhValue !== zhValue || existEnValue !== enValue) {
        const [count] = preKey.match(/\d+$/g) || [0];
        const nextKey = count ? preKey.replace(/\d+$/, `${+count + 1}`) : `${preKey}_1`;
        return avoidCoverage(nextKey, targetIntl, zhValue, enValue);
    }
    return preKey;
}
// 去除 JSON 中空对象
function formatJSONValue(key, value) {
    return _.isObject(value) && _.isEmpty(value) ? undefined : value;
}
// 生成新的翻译文件
function generateIntl(nextTargetIntl, config) {
    Object.keys(nextTargetIntl).forEach((lang) => {
        /*
        * Notice: JSON.stringify 使用了两次
        *  因为我们之前有逻辑 -- 将重复的值对应 key 的 value 改为 undefined
        *  第一遍 JSON.stringify 将 undefined 去掉，第二遍将第一遍处理产生的 空对象 {} 去掉
        * */
        const modulesMap = JSON.parse(JSON.stringify(nextTargetIntl[lang].I18N));
        const langDir = path.join(config.TARGET_DIR, lang);
        const moduleNames = [];
        if (!fs.existsSync(config.TARGET_DIR))
            fs.mkdirSync(config.TARGET_DIR);
        if (!fs.existsSync(langDir))
            fs.mkdirSync(langDir);
        _.forEach(modulesMap, (obj, moduleName) => {
            if (_.isEmpty(obj))
                return;
            moduleNames.push(moduleName);
            const moduleFile = path.join(config.TARGET_DIR, lang, `${moduleName}.ts`);
            const code = utils_2.prettierFile(`export default ${JSON.stringify(obj, formatJSONValue, 2)}`);
            fs.writeFileSync(moduleFile, code);
        });
        // 创建 index.ts
        fs.writeFileSync(path.join(config.TARGET_DIR, lang, 'index.ts'), utils_2.prettierFile(`
        ${moduleNames.map((name) => `import ${name} from \'./${name}\';`).join('\n')}
        
        export default Object.assign({}, {
          ${moduleNames.map((name) => `${name},`).join('\n')}
        });
      `));
    });
}
// 生成问题报告
function generateReport(invert, nextTargetIntl) {
    let doubleUsed = {};
    let canUnique = [];
    _.forEach(invert, (existKeys, value) => {
        if (Array.isArray(existKeys) && existKeys.length > 1) {
            const doubleVariable = existKeys.map((key) => ({
                variable: key,
                en: _.get(nextTargetIntl, `en-US.${key}`),
            }));
            const groups = _.groupBy(doubleVariable, (item) => item.en);
            let canNotUnique = [];
            _.forEach(groups, (group, en) => {
                // 中英文都相等，可以完全替换掉
                if (group.length > 1) {
                    let commonVariable = null;
                    let otherVariables = [];
                    group.forEach((g) => {
                        if (g.variable.startsWith('I18N.common.')) {
                            commonVariable = g.variable;
                        }
                        else {
                            otherVariables.push(g.variable);
                        }
                    });
                    if (commonVariable) {
                        canUnique.push(...otherVariables.map((from) => ({ from, to: commonVariable, cn: value, en })));
                        return;
                    }
                }
                canNotUnique.push(...group);
            });
            if (canNotUnique && canNotUnique.length > 0) {
                doubleUsed[value] = canNotUnique;
            }
        }
    });
    return { doubleUsed, canUnique };
}
// 写入问题报告
function writeReport(config, report) {
    const code = utils_2.prettierFile(JSON.stringify(report, null, 2), { parser: 'json' });
    if (!fs.existsSync(config.TARGET_DIR))
        fs.mkdirSync(config.TARGET_DIR);
    fs.writeFileSync(path.join(config.TARGET_DIR, 'comb_report.json'), code);
}
// 将问题报告中 canUnique 的部分变量替换掉
function uniqueVariable(canUnique, invertKeyFileMap, nextTargetIntl) {
    let undo = [];
    const LANGS = Object.keys(nextTargetIntl);
    let needDealFileMap = {};
    // 以 file 为基准，保证每个需要修改的 file 只读写一次
    canUnique.forEach((item) => {
        const fileNames = invertKeyFileMap[item.from];
        if (!Array.isArray(fileNames) || fileNames.length === 0) {
            undo.push(Object.assign(Object.assign({}, item), { reason: "no fileNames" }));
            return;
        }
        fileNames.forEach((fileName) => {
            if (!fileName)
                return;
            const prev = needDealFileMap[fileName];
            needDealFileMap[fileName] = Array.isArray(prev) ? prev.concat([item]) : [item];
        });
    });
    Object.keys(needDealFileMap).forEach((fileName) => {
        const items = needDealFileMap[fileName] || [];
        const code = utils_2.readFile(fileName);
        let nextCode = code;
        items.forEach((item) => {
            const reg = new RegExp(`${item.from.split('.').join('\\.')}(?=\\W+)`, 'g');
            const matches = code.match(reg) || [];
            if (matches.length > 0) {
                nextCode = nextCode.replace(reg, item.to);
                // 删除翻译文件中的重复部分
                LANGS.forEach((lang) => {
                    if (_.has(nextTargetIntl, `${lang}.${item.from}`)) {
                        _.set(nextTargetIntl, `${lang}.${item.from}`, undefined); // 后续写入时会 JSON.stringify
                    }
                });
            }
            else {
                undo.push(Object.assign(Object.assign({}, item), { reason: 'no matchs' }));
            }
        });
        // 替换 code
        utils_2.writeFile(fileName, nextCode);
    });
    return { undo, nextTargetIntl };
}
// 解析 config 批量处理
function extractIntlBatch(config, originIntl, targetIntl) {
    // 在原有基础上累加
    let nextTargetIntl = targetIntl;
    // 用来记录处理过程中的非正常情况，抛给开发者衡量如何解决
    const errorLogs = [];
    // 以 value 为 key 的map 用来去重
    const invert = utils_1.generateValueMap(_.get(targetIntl, 'zh-CN.I18N'));
    const invertKeyFileMap = {};
    config.compileOptions.forEach((option) => {
        const { ignoreDirectory, ignoreFile } = option;
        const usedCombDir = utils_1.getUsedCombDirs(option, config.ROOT_DIR);
        usedCombDir.forEach((dir) => {
            const stat = fs.statSync(dir);
            if (stat.isDirectory())
                extractIntlSoleDir(dir, ignoreDirectory, ignoreFile);
            if (stat.isFile())
                extractIntlSoleFile(dir, ignoreDirectory, ignoreFile);
        });
    });
    function extractIntlSoleFile(file, ignoreDirectory, ignoreFile) {
        const IntlFileName = path.basename(path.dirname(file));
        if (!utils_1.isFileIgnore(file, ignoreDirectory, ignoreFile)) {
            handleFile(file, IntlFileName); // baseKey 为空
        }
    }
    function extractIntlSoleDir(dir, ignoreDirectory, ignoreFile) {
        const IntlFileName = path.basename(dir);
        const usedFiles = utils_1.getSpecifiedFiles(dir, ignoreDirectory, ignoreFile);
        usedFiles.forEach((file) => {
            // 需要拿到当前文件相对于 dir 的相对路径下第一级目录名称作为 key
            const baseKey = (file.replace(dir, '') || '').split(path.sep)[1]; // [0] 永远会是 ''
            // 排除 baseKey 为 constants、view、utils、tools 或者文件名 等情况
            const isUnused = ['constants', 'view', 'utils', 'tools', path.basename(file)].includes(baseKey);
            handleFile(file, IntlFileName, isUnused ? undefined : baseKey);
        });
    }
    function handleFile(file, IntlFileName, baseKey) {
        const code = utils_2.readFile(file);
        let nextCode = code;
        if (code) {
            const reg = /I18N\.((\w|\.)+)/g;
            const matches = nextCode.match(reg) || [];
            let hasMatch = false;
            matches.forEach((match) => {
                if (['I18N.get', 'I18N.template', 'I18N.getLang'].includes(match))
                    return;
                const variableKey = match.split('.').pop();
                const advanceKey = _.compact(['I18N', IntlFileName, baseKey, variableKey]).join('.');
                const commonKey = ['I18N', 'common', variableKey].join('.');
                // 以 zh-CN 与 en-US 为基准处理重复值
                const zhValue = _.get(originIntl, `zh-CN.${match}`);
                const enValue = _.get(originIntl, `en-US.${match}`);
                // 非字符串，不再处理，转入 error log
                if (!_.isString(zhValue)) {
                    errorLogs.push({ file, variable: match, errorMsg: '取值非字符串' });
                    return;
                }
                const existKeys = invert[zhValue] || [];
                const isExist = Array.isArray(existKeys) && existKeys.length > 0;
                let determineKey = avoidCoverage(advanceKey, targetIntl, zhValue, enValue);
                if (isExist) {
                    // 如果中文已存在则检查英文是否是重复的，如果不是则证明其为在不同语境下的翻译，不应该视为重复key
                    const existEnValue = _.get(targetIntl, `en-US.${existKeys[0]}`);
                    // existKeys[0] === determineKey 意味着同一页面对同一个变量有多次引用，这个时候 determineKey 不应该改成 commonKey
                    if (existEnValue === enValue && existKeys[0] !== determineKey) {
                        determineKey = avoidCoverage(commonKey, targetIntl, zhValue, enValue);
                    }
                    const existKeyFileMap = invertKeyFileMap[determineKey] || [];
                    if (existKeys[0] === determineKey && !existKeyFileMap.includes(file)) {
                        invertKeyFileMap[determineKey] = existKeyFileMap.concat(file);
                    }
                }
                else {
                    // 如果 key 不曾存在, 增将其记录到 invertKeyFileMap 中，后续用来二次替换变量
                    invertKeyFileMap[determineKey] = [file];
                }
                // 默认 value 中文相同时，其翻译的英文 key 也是相同的
                const nextKeys = isExist ? _.uniq([...existKeys, determineKey]) : [determineKey];
                invert[zhValue] = nextKeys;
                // 转移其他语言的值到 targetIntl
                config.LANGS.forEach((lang) => {
                    const value = _.get(originIntl, `${lang}.${match}`);
                    _.set(nextTargetIntl, `${lang}.${determineKey}`, value);
                });
                // 替换掉代码中的引用
                hasMatch = true; // 到这步证明有正常的 match 到
                /*
                * 为避免生成的 determineKey 与原 match 到的 key 有重复的情况（会导致计算后的 determineKey 被再次改写）
                * 例如： I18N.XX.A 要被替换为 I18N.XX.B, 但是 code 中已经存在了 I18N.XX.B， 这里的 I18N.XX.B 要被替换为 I18N.XX.C
                * 如果 先替换 I18N.XX.A => I18N.XX.B, 在将 I18N.XX.B => I18N.XX.C 则最终的结果是 I18N.XX.A => I18N.XX.C
                * 因此，做如下处理: 被替换的值做一下包装，替换后在解开包装
                * */
                const matchReg = new RegExp(`${match.split('.').join('\\.')}(?=\\W+)`, 'g');
                const firstRoundReplaceKey = `${determineKey}_FIRST_ROUND_REPLACE_MARK`;
                nextCode = nextCode.replace(matchReg, firstRoundReplaceKey);
            });
            nextCode = nextCode.replace(/(I18N\.((\w|\.)+))_FIRST_ROUND_REPLACE_MARK/g, '$1');
            // 替换源文件中的引用
            if (hasMatch) {
                utils_2.writeFile(file, nextCode);
            }
        }
    }
    // 生成问题报告
    const { doubleUsed, canUnique } = generateReport(invert, nextTargetIntl);
    const { undo, nextTargetIntl: nTargetIntl } = uniqueVariable(canUnique, invertKeyFileMap, nextTargetIntl);
    const explain = {
        errorLogs: 'errorLogs：解析时失败的变量，需要开发者手动处理',
        doubleUsed: 'doubleUsed：某些引用值的中文是重复的，但是英文是不同的，这里对其做了记录',
        undo: 'undo：针对重复的引用值，脚本内已经处理了，这里会把未处理的、不可处理的列举出来，加给开发者手动操作 ',
    };
    writeReport(config, { explain, errorLogs, doubleUsed, undo });
    // 生成新的翻译文件
    generateIntl(nTargetIntl, config);
}
function comb() {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        console.log('整理国际化翻译中...');
        const config = utils_1.initialConfig();
        // 1. 获得已存在的中英文翻译对象(原始的，整理后的)
        const originIntl = utils_1.getOriginIntlObject(config, config.KIWI_DIR);
        const targetIntl = utils_1.getOriginIntlObject(config, config.TARGET_DIR);
        // 2. 翻译提取
        extractIntlBatch(config, originIntl, targetIntl);
        // 3. 拷贝 kiwi-config.json
        fs.copyFileSync(path.join(config.KIWI_DIR, 'kiwi-config.json'), path.join(config.TARGET_DIR, 'kiwi-config.json'));
        utils_2.deleteFolder(config.KIWI_DIR);
        utils_2.renameFolder(config.TARGET_DIR, config.KIWI_DIR);
        console.log('\x1b[36m%s\x1b[0m', `  整理完成，请查看报告文件 ${path.join(config.KIWI_DIR, 'comb_report.json')}.\n`);
    });
}
exports.default = comb;
//# sourceMappingURL=comb.js.map