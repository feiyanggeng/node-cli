"use strict";
/**
 * @author doubledream
 * @desc 更新文件
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
exports.createImportI18N = exports.hasImportI18N = exports.replaceAndUpdate = void 0;
const fs = __importStar(require("fs-extra"));
const _ = __importStar(require("lodash"));
const ts = __importStar(require("typescript"));
const file_1 = require("./file");
const utils_1 = require("../utils");
function updateLangFiles(keyValue, text, validateDuplicate) {
    const CONFIG = utils_1.getProjectConfig();
    const srcLangDir = utils_1.getLangDir(CONFIG.srcLang);
    if (!_.startsWith(keyValue, 'I18N.')) {
        return;
    }
    const [, filename, ...restPath] = keyValue.split('.');
    const fullKey = restPath.join('.');
    const targetFilename = `${srcLangDir}/${filename}.ts`;
    if (!fs.existsSync(targetFilename)) {
        fs.writeFileSync(targetFilename, generateNewLangFile(fullKey, text));
        addImportToMainLangFile(filename);
        console.log(`成功新建语言文件 ${targetFilename}`);
    }
    else {
        // 清除 require 缓存，解决手动更新语言文件后再自动抽取，导致之前更新失效的问题
        const mainContent = utils_1.getLangData(targetFilename);
        const obj = mainContent;
        if (Object.keys(obj).length === 0) {
            console.log(`${filename} 解析失败，该文件包含的文案无法自动补全`);
        }
        if (validateDuplicate && _.get(obj, fullKey) !== undefined) {
            console.log(`${targetFilename} 中已存在 key 为 \`${fullKey}\` 的翻译，请重新命名变量`);
            throw new Error('duplicate');
        }
        // \n 会被自动转义成 \\n，这里转回来
        text = text.replace(/\\n/gm, '\n');
        _.set(obj, fullKey, text);
        fs.writeFileSync(targetFilename, utils_1.prettierFile(`export default ${JSON.stringify(obj, null, 2)}`));
    }
}
function getI18FileOnlyKey(keyValue, text) {
    const CONFIG = utils_1.getProjectConfig();
    const srcLangDir = utils_1.getLangDir(CONFIG.srcLang);
    const [, filename, ...restPath] = keyValue.split(".");
    const fullKey = restPath.join(".");
    const targetFilename = `${srcLangDir}/${filename}.ts`;
    const mainContent = utils_1.getLangData(targetFilename);
    const obj = mainContent;
    const newFullKey = _.get(obj, fullKey) ? utils_1.generateObjOnlyKey(obj, fullKey, text)
        : fullKey;
    return `I18N.${filename}.${newFullKey}`;
}
function generateNewLangFile(key, value) {
    const obj = _.set({}, key, value);
    return utils_1.prettierFile(`export default ${JSON.stringify(obj, null, 2)}`);
}
function addImportToMainLangFile(newFilename) {
    const CONFIG = utils_1.getProjectConfig();
    const srcLangDir = utils_1.getLangDir(CONFIG.srcLang);
    let mainContent = '';
    if (fs.existsSync(`${srcLangDir}/index.ts`)) {
        mainContent = fs.readFileSync(`${srcLangDir}/index.ts`, 'utf8');
        mainContent = mainContent.replace(/^(\s*import.*?;)$/m, `$1\nimport ${newFilename} from './${newFilename}';`);
        if (/(}[\s|\,]*\);)/.test(mainContent)) {
            if (/\,\s*(}[\s|\,]*\);)/.test(mainContent)) {
                /** 最后一行包含,号 */
                mainContent = mainContent.replace(/(}[\s|\,]*\);)/, `  ${newFilename},\n$1`);
            }
            else {
                /** 最后一行不包含,号 */
                mainContent = mainContent.replace(/(\s*}[\s|\,]*\);)/, `,\n  ${newFilename},\n$1`);
            }
        }
        // 兼容 export default { common };的写法
        if (/(};)/.test(mainContent)) {
            if (/\,\s*(};)/.test(mainContent)) {
                /** 最后一行包含,号 */
                mainContent = mainContent.replace(/(};)/, `  ${newFilename},\n$1`);
            }
            else {
                /** 最后一行不包含,号 */
                mainContent = mainContent.replace(/\n(};)/, `,\n  ${newFilename},\n$1`);
            }
        }
    }
    else {
        mainContent = `import ${newFilename} from './${newFilename}';\n\nexport default Object.assign({}, {\n  ${newFilename},\n});`;
    }
    fs.writeFileSync(`${srcLangDir}/index.ts`, utils_1.prettierFile(mainContent));
}
/**
 * 检查是否添加 import I18N 命令
 * @param filePath 文件路径
 */
function hasImportI18N(filePath) {
    const code = file_1.readFile(filePath);
    const ast = ts.createSourceFile('', code, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TSX);
    let hasImportI18N = false;
    function visit(node) {
        if (node.kind === ts.SyntaxKind.ImportDeclaration) {
            const importClause = node.importClause;
            // import I18N from 'src/utils/I18N';
            if (_.get(importClause, 'kind') === ts.SyntaxKind.ImportClause) {
                if (importClause.name) {
                    if (importClause.name.escapedText === 'I18N') {
                        hasImportI18N = true;
                    }
                }
                else {
                    const namedBindings = importClause.namedBindings;
                    // import { I18N } from 'src/utils/I18N';
                    if (namedBindings.kind === ts.SyntaxKind.NamedImports) {
                        namedBindings.elements.forEach(element => {
                            if (element.kind === ts.SyntaxKind.ImportSpecifier && _.get(element, 'name.escapedText') === 'I18N') {
                                hasImportI18N = true;
                            }
                        });
                    }
                    // import * as I18N from 'src/utils/I18N';
                    if (namedBindings.kind === ts.SyntaxKind.NamespaceImport) {
                        if (_.get(namedBindings, 'name.escapedText') === 'I18N') {
                            hasImportI18N = true;
                        }
                    }
                }
            }
        }
    }
    ts.forEachChild(ast, visit);
    return hasImportI18N;
}
exports.hasImportI18N = hasImportI18N;
/**
 * 在合适的位置添加 import I18N 语句
 * @param filePath 文件路径
 */
function createImportI18N(filePath) {
    const CONFIG = utils_1.getProjectConfig();
    const code = file_1.readFile(filePath);
    const ast = ts.createSourceFile('', code, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TSX);
    const isTsFile = _.endsWith(filePath, '.ts');
    const isTsxFile = _.endsWith(filePath, '.tsx');
    const isJsFile = _.endsWith(filePath, '.js');
    const isJsxFile = _.endsWith(filePath, '.jsx');
    const isVueFile = _.endsWith(filePath, '.vue');
    if (isTsFile || isTsxFile || isJsFile || isJsxFile) {
        const importStatement = `${CONFIG.importI18N}\n`;
        const pos = ast.getStart(ast, false);
        const updateCode = code.slice(0, pos) + importStatement + code.slice(pos);
        return updateCode;
    }
    else if (isVueFile) {
        const importStatement = `${CONFIG.importI18N}\n`;
        const updateCode = code.replace(/<script>/g, `<script>\n${importStatement}`);
        return updateCode;
    }
}
exports.createImportI18N = createImportI18N;
/**
 * 更新文件
 * @param filePath 当前文件路径
 * @param arg  目标字符串对象
 * @param val  目标 key
 * @param validateDuplicate 是否校验文件中已经存在要写入的 key
 */
function replaceAndUpdate(filePath, arg, i18Key, validateDuplicate) {
    const code = file_1.readFile(filePath);
    const isHtmlFile = _.endsWith(filePath, '.html');
    const isVueFile = _.endsWith(filePath, '.vue');
    let newCode = code;
    let finalReplaceText = arg.text;
    const { start, end } = arg.range;
    let val = i18Key;
    // 若是字符串，删掉两侧的引号
    if (arg.isString) {
        // 如果引号左侧是 等号，则可能是 jsx 的 props，此时要替换成 {
        const preTextStart = start - 1;
        const [last2Char, last1Char] = code.slice(preTextStart, start + 1).split('');
        let finalReplaceVal = val;
        // 若是模板字符串，看看其中是否包含变量
        if (last1Char === '`') {
            const varInStr = arg.text.match(/(\$\{[^\}]+?\})/g);
            if (varInStr) {
                const kvPair = varInStr.map((str, index) => {
                    return `val${index + 1}: ${str.replace(/^\${([^\}]+)\}$/, '$1')}`;
                });
                varInStr.forEach((str, index) => {
                    finalReplaceText = finalReplaceText.replace(str, `{val${index + 1}}`);
                });
                val = getI18FileOnlyKey(i18Key, finalReplaceText);
                finalReplaceVal = `I18N.get(${val}, { ${kvPair.join(',\n')} })`;
            }
        }
        if (last2Char === "=") {
            if (isHtmlFile) {
                finalReplaceVal = "{{" + val + "}}";
            }
            else if (isVueFile) {
                finalReplaceVal = "{{" + val + "}}";
            }
            else {
                finalReplaceVal = "{" + val + "}";
            }
        }
        newCode = `${code.slice(0, start)}${finalReplaceVal}${code.slice(end)}`;
    }
    else {
        if (isHtmlFile || isVueFile) {
            newCode = `${code.slice(0, start)}{{${val}}}${code.slice(end)}`;
        }
        else {
            newCode = `${code.slice(0, start)}{${val}}${code.slice(end)}`;
        }
    }
    try {
        // 更新语言文件
        updateLangFiles(val, finalReplaceText, validateDuplicate);
        // 若更新成功再替换代码
        return file_1.writeFile(filePath, newCode);
    }
    catch (e) {
        return Promise.reject(e.message);
    }
}
exports.replaceAndUpdate = replaceAndUpdate;
//# sourceMappingURL=replace.js.map