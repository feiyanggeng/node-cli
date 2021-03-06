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
Object.defineProperty(exports, "__esModule", { value: true });
exports.findChineseText = void 0;
/**
 * @author doubledream
 * @desc 利用 Ast 查找对应文件中的中文文案
 */
const ts = __importStar(require("typescript"));
const compiler = __importStar(require("@angular/compiler"));
const compilerVue = __importStar(require("vue-template-compiler"));
const DOUBLE_BYTE_REGEX = /[^\x00-\xff]/g;
/**
 * 去掉文件中的注释
 * @param code
 * @param fileName
 */
function removeFileComment(code, fileName) {
    const printer = ts.createPrinter({ removeComments: true });
    const sourceFile = ts.createSourceFile('', code, ts.ScriptTarget.ES2015, true, fileName.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    return printer.printFile(sourceFile);
}
/**
 * 查找 Ts 文件中的中文
 * @param code
 */
function findTextInTs(code, fileName) {
    const matches = [];
    const ast = ts.createSourceFile('', code, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TSX);
    function visit(node) {
        switch (node.kind) {
            case ts.SyntaxKind.StringLiteral: {
                /** 判断 Ts 中的字符串含有中文 */
                const { text } = node;
                if (text.match(DOUBLE_BYTE_REGEX)) {
                    const start = node.getStart();
                    const end = node.getEnd();
                    const range = { start, end };
                    matches.push({
                        range,
                        text,
                        isString: true
                    });
                }
                break;
            }
            case ts.SyntaxKind.JsxElement: {
                const { children } = node;
                children.forEach(child => {
                    if (child.kind === ts.SyntaxKind.JsxText) {
                        const text = child.getText();
                        /** 修复注释含有中文的情况，Angular 文件错误的 Ast 情况 */
                        const noCommentText = removeFileComment(text, fileName);
                        if (noCommentText.match(DOUBLE_BYTE_REGEX)) {
                            const start = child.getStart();
                            const end = child.getEnd();
                            const range = { start, end };
                            matches.push({
                                range,
                                text: text.trim(),
                                isString: false
                            });
                        }
                    }
                });
                break;
            }
            case ts.SyntaxKind.TemplateExpression: {
                const { pos, end } = node;
                const templateContent = code.slice(pos, end);
                if (templateContent.match(DOUBLE_BYTE_REGEX)) {
                    const start = node.getStart();
                    const end = node.getEnd();
                    const range = { start, end };
                    matches.push({
                        range,
                        text: code.slice(start + 1, end - 1),
                        isString: true
                    });
                }
                break;
            }
            case ts.SyntaxKind.NoSubstitutionTemplateLiteral: {
                const { pos, end } = node;
                const templateContent = code.slice(pos, end);
                if (templateContent.match(DOUBLE_BYTE_REGEX)) {
                    const start = node.getStart();
                    const end = node.getEnd();
                    const range = { start, end };
                    matches.push({
                        range,
                        text: code.slice(start + 1, end - 1),
                        isString: true
                    });
                }
            }
        }
        ts.forEachChild(node, visit);
    }
    ts.forEachChild(ast, visit);
    return matches;
}
/**
 * 查找 HTML 文件中的中文
 * @param code
 */
function findTextInHtml(code) {
    const matches = [];
    const ast = compiler.parseTemplate(code, 'ast.html', {
        preserveWhitespaces: false
    });
    function visit(node) {
        const value = node.value;
        if (value && typeof value === 'string' && value.match(DOUBLE_BYTE_REGEX)) {
            const valueSpan = node.valueSpan || node.sourceSpan;
            let { start: { offset: startOffset }, end: { offset: endOffset } } = valueSpan;
            const nodeValue = code.slice(startOffset, endOffset);
            let isString = false;
            /** 处理带引号的情况 */
            if (nodeValue.charAt(0) === '"' || nodeValue.charAt(0) === "'") {
                isString = true;
            }
            const range = { start: startOffset, end: endOffset };
            matches.push({
                range,
                text: value,
                isString
            });
        }
        else if (value && typeof value === 'object' && value.source && value.source.match(DOUBLE_BYTE_REGEX)) {
            /**
             * <span>{{expression}}中文</span> 这种情况的兼容
             */
            const chineseMatches = value.source.match(DOUBLE_BYTE_REGEX);
            chineseMatches.map(match => {
                const valueSpan = node.valueSpan || node.sourceSpan;
                let { start: { offset: startOffset }, end: { offset: endOffset } } = valueSpan;
                const nodeValue = code.slice(startOffset, endOffset);
                const start = nodeValue.indexOf(match);
                const end = start + match.length;
                const range = { start, end };
                matches.push({
                    range,
                    text: match[0],
                    isString: false
                });
            });
        }
        if (node.children && node.children.length) {
            node.children.forEach(visit);
        }
        if (node.attributes && node.attributes.length) {
            node.attributes.forEach(visit);
        }
    }
    if (ast.nodes && ast.nodes.length) {
        ast.nodes.forEach(visit);
    }
    return matches;
}
/**
 * 递归匹配vue代码的中文
 * @param code
 */
function findTextInVue(code) {
    const vueObejct = compilerVue.compile(code.toString(), { outputSourceRange: true });
    let TextaArr = findVueText(vueObejct.ast);
    const sfc = compilerVue.parseComponent(code.toString());
    let vueTemp = findTextInVueTs(sfc.script.content, 'fileName', sfc.script.start);
    return vueTemp.concat(TextaArr);
}
function findTextInVueTs(code, fileName, startNum) {
    const matches = [];
    const ast = ts.createSourceFile('', code, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS);
    function visit(node) {
        switch (node.kind) {
            case ts.SyntaxKind.StringLiteral: {
                /** 判断 Ts 中的字符串含有中文 */
                const { text } = node;
                if (text.match(DOUBLE_BYTE_REGEX)) {
                    const start = node.getStart();
                    const end = node.getEnd();
                    /** 加一，减一的原因是，去除引号 */
                    const range = { start: start + startNum, end: end + startNum };
                    matches.push({
                        range,
                        text,
                        isString: true
                    });
                }
                break;
            }
            case ts.SyntaxKind.TemplateExpression: {
                const { pos, end } = node;
                let templateContent = code.slice(pos, end);
                templateContent = templateContent.toString().replace(/\$\{[^\}]+\}/, '');
                if (templateContent.match(DOUBLE_BYTE_REGEX)) {
                    const start = node.getStart();
                    const end = node.getEnd();
                    /** 加一，减一的原因是，去除`号 */
                    const range = code.indexOf('${') !== -1 ? { start: start + startNum, end: end + startNum } : { start: start + startNum + 1, end: end + startNum - 1 };
                    matches.push({
                        range,
                        text: code.slice(start + 1, end - 1),
                        isString: true
                    });
                }
                break;
            }
        }
        ts.forEachChild(node, visit);
    }
    ts.forEachChild(ast, visit);
    return matches;
}
function findVueText(ast) {
    let arr = [];
    const regex1 = /\`(.+?)\`/g;
    function emun(ast) {
        if (ast.expression) {
            let text = ast.expression.match(regex1);
            if (text && text[0].match(DOUBLE_BYTE_REGEX)) {
                text.forEach(itemText => {
                    const varInStr = itemText.match(/(\$\{[^\}]+?\})/g);
                    if (varInStr)
                        itemText.match(DOUBLE_BYTE_REGEX) && arr.push({ text: ' ' + itemText, range: { start: ast.start + 2, end: ast.end - 2 }, isString: true });
                    else
                        itemText.match(DOUBLE_BYTE_REGEX) && arr.push({ text: itemText, range: { start: ast.start, end: ast.end }, isString: false });
                });
            }
            else {
                ast.tokens && ast.tokens.forEach(element => {
                    if (typeof (element) === 'string' && element.match(DOUBLE_BYTE_REGEX)) {
                        arr.push({ text: element, range: { start: ast.start + ast.text.indexOf(element), end: ast.start + ast.text.indexOf(element) + element.length }, isString: false });
                    }
                });
            }
        }
        else if (!ast.expression && ast.text) {
            ast.text.match(DOUBLE_BYTE_REGEX) && arr.push({ text: ast.text, range: { start: ast.start, end: ast.end }, isString: false });
        }
        else {
            ast.children && ast.children.forEach(item => {
                emun(item);
            });
        }
    }
    emun(ast);
    return arr;
}
/**
 * 递归匹配代码的中文
 * @param code
 */
function findChineseText(code, fileName) {
    if (fileName.endsWith('.html')) {
        return findTextInHtml(code);
    }
    else if (fileName.endsWith('.vue')) {
        return findTextInVue(code);
    }
    else {
        return findTextInTs(code, fileName);
    }
}
exports.findChineseText = findChineseText;
//# sourceMappingURL=findChineseText.js.map