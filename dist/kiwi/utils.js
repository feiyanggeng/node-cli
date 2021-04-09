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
exports.slash = exports.getSuggestLangObj = exports.getLangData = exports.writeFile = exports.readFile = exports.renameFolder = exports.deleteFolder = exports.generateObjOnlyKey = exports.prettierFile = exports.lookForFiles = exports.flatten = exports.findMatchValue = exports.findMatchKey = exports.translateText = exports.getProjectConfig = exports.getAllMessages = exports.withTimeout = exports.retry = exports.traverse = exports.getLangDir = exports.getKiwiDir = void 0;
/**
 * @author linhuiw
 * @desc 工具方法
 */
const path = __importStar(require("path"));
const _ = __importStar(require("lodash"));
const fs = __importStar(require("fs"));
const globby = __importStar(require("globby"));
const prettier = __importStar(require("prettier"));
const const_1 = require("./const");
const childProcess = __importStar(require("child_process"));
const CONFIG = getProjectConfig();
const LANG_DIR = path.resolve(CONFIG.kiwiDir, CONFIG.srcLang);
function lookForFiles(dir, fileName) {
    const files = fs.readdirSync(dir);
    for (let file of files) {
        const currName = path.join(dir, file);
        const info = fs.statSync(currName);
        if (info.isDirectory()) {
            if (file === '.git' || file === 'node_modules') {
                continue;
            }
            const result = lookForFiles(currName, fileName);
            if (result) {
                return result;
            }
        }
        else if (info.isFile() && file === fileName) {
            return currName;
        }
    }
}
exports.lookForFiles = lookForFiles;
function getI18N() {
    const I18N_GLOB = `${LANG_DIR}/**/*.ts`;
    const paths = globby.sync(I18N_GLOB);
    const langObj = paths.reduce((prev, curr) => {
        const filename = curr
            .split("/")
            .pop()
            .replace(/\.tsx?$/, "");
        if (filename.replace(/\.tsx?/, "") === "index") {
            return prev;
        }
        const fileContent = getLangData(curr);
        let jsObj = fileContent;
        if (Object.keys(jsObj).length === 0) {
            console.log(`\`${curr}\` 解析失败，该文件包含的文案无法自动补全`);
        }
        return Object.assign(Object.assign({}, prev), { [filename]: jsObj });
    }, {});
    return langObj;
}
/**
 * 获取全部语言, 展平
 */
function getSuggestLangObj() {
    const langObj = getI18N();
    const finalLangObj = flatten(langObj);
    return finalLangObj;
}
exports.getSuggestLangObj = getSuggestLangObj;
/**
 * 获取对应文件的语言
 */
function getLangData(fileName) {
    if (fs.existsSync(fileName)) {
        return getLangJson(fileName);
    }
    else {
        return {};
    }
}
exports.getLangData = getLangData;
/**
 * 获取文件 Json
 */
function getLangJson(fileName) {
    const fileContent = fs.readFileSync(fileName, { encoding: 'utf8' });
    let obj = fileContent.match(/export\s*default\s*({[\s\S]+);?$/)[1];
    obj = obj.replace(/\s*;\s*$/, '');
    let jsObj = {};
    try {
        jsObj = eval('(' + obj + ')');
    }
    catch (err) {
        console.log(obj);
        console.error(err);
    }
    return jsObj;
}
/**
 * 获得项目配置信息
 * .js 文件优先，默认生成的还是 json 文件，但是可以手动改成 .js 文件
 */
function getProjectConfig() {
    const rootDir = path.resolve(process.cwd());
    const configFileJS = lookForFiles(rootDir, const_1.KIWI_CONFIG_FILE.replace(path.extname(const_1.KIWI_CONFIG_FILE), '.js'));
    if (configFileJS && fs.existsSync(configFileJS)) {
        const obj = require(configFileJS);
        return obj.default || obj;
    }
    const configFile = lookForFiles(rootDir, const_1.KIWI_CONFIG_FILE);
    let obj = const_1.PROJECT_CONFIG.defaultConfig;
    if (configFile && fs.existsSync(configFile)) {
        obj = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    }
    return obj;
}
exports.getProjectConfig = getProjectConfig;
/**
 * 获取语言资源的根目录
 */
function getKiwiDir() {
    const config = getProjectConfig();
    if (config) {
        return config.kiwiDir;
    }
}
exports.getKiwiDir = getKiwiDir;
/**
 * 获取对应语言的目录位置
 * @param lang
 */
function getLangDir(lang) {
    const langsDir = getKiwiDir();
    return path.resolve(langsDir, lang);
}
exports.getLangDir = getLangDir;
/**
 * 深度优先遍历对象中的所有 string 属性，即文案
 */
function traverse(obj, cb) {
    function traverseInner(obj, cb, path) {
        _.forEach(obj, (val, key) => {
            if (typeof val === 'string') {
                cb(val, [...path, key].join('.'));
            }
            else if (typeof val === 'object' && val !== null) {
                traverseInner(val, cb, [...path, key]);
            }
        });
    }
    traverseInner(obj, cb, []);
}
exports.traverse = traverse;
/**
 * 获取所有文案
 */
function getAllMessages(lang, filter = (message, key) => true) {
    const srcLangDir = getLangDir(lang);
    let files = fs.readdirSync(srcLangDir);
    files = files.filter(file => file.endsWith('.ts') && file !== 'index.ts').map(file => path.resolve(srcLangDir, file));
    const allMessages = files.map(file => {
        const { default: messages } = require(file);
        const fileNameWithoutExt = path.basename(file).split('.')[0];
        const flattenedMessages = {};
        traverse(messages, (message, path) => {
            const key = fileNameWithoutExt + '.' + path;
            if (filter(message, key)) {
                flattenedMessages[key] = message;
            }
        });
        return flattenedMessages;
    });
    return Object.assign({}, ...allMessages);
}
exports.getAllMessages = getAllMessages;
/**
 * 重试方法
 * @param asyncOperation
 * @param times
 */
function retry(asyncOperation, times = 1) {
    let runTimes = 1;
    const handleReject = e => {
        if (runTimes++ < times) {
            return asyncOperation().catch(handleReject);
        }
        else {
            throw e;
        }
    };
    return asyncOperation().catch(handleReject);
}
exports.retry = retry;
/**
 * 设置超时
 * @param promise
 * @param ms
 */
function withTimeout(promise, ms) {
    const timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(`Promise timed out after ${ms} ms.`);
        }, ms);
    });
    return Promise.race([promise, timeoutPromise]);
}
exports.withTimeout = withTimeout;
/**
 * 使用google翻译
 */
function translateText(text, toLang, apiKey) {
    const CONFIG = getProjectConfig();
    const options = CONFIG.translateOptions;
    const { translate: googleTranslate } = require('google-translate')(CONFIG.googleApiKey || apiKey, options);
    return withTimeout(new Promise((resolve, reject) => {
        googleTranslate(text, 'zh', const_1.PROJECT_CONFIG.langMap[toLang], (err, translation) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(translation.translatedText);
            }
        });
    }), 15000);
}
exports.translateText = translateText;
function findMatchKey(langObj, text) {
    for (const key in langObj) {
        if (langObj[key] === text) {
            return key;
        }
    }
    return null;
}
exports.findMatchKey = findMatchKey;
function findMatchValue(langObj, key) {
    return langObj[key];
}
exports.findMatchValue = findMatchValue;
/**
 * 将对象拍平
 * @param obj 原始对象
 * @param prefix
 */
function flatten(obj, prefix = '') {
    var propName = prefix ? prefix + '.' : '', ret = {};
    for (var attr in obj) {
        if (_.isArray(obj[attr])) {
            var len = obj[attr].length;
            ret[attr] = obj[attr].join(',');
        }
        else if (typeof obj[attr] === 'object') {
            _.extend(ret, flatten(obj[attr], propName + attr));
        }
        else {
            ret[propName + attr] = obj[attr];
        }
    }
    return ret;
}
exports.flatten = flatten;
/**
 * 使用 Prettier 格式化文件
 * @param fileContent
 */
function prettierFile(fileContent, parser) {
    try {
        return prettier.format(fileContent, parser ? parser : {
            parser: "typescript",
            printWidth: 100,
            singleQuote: true,
            trailingComma: "all",
            arrowParens: "always",
            semi: true,
            tabWidth: 2,
        });
    }
    catch (e) {
        console.error(`代码格式化报错！${e.toString()}\n代码为：${fileContent}`);
        return fileContent;
    }
}
exports.prettierFile = prettierFile;
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
 * 写入文件
 * @param fileName
 */
function writeFile(filePath, file) {
    if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, file);
    }
}
exports.writeFile = writeFile;
/**
 * 生成一个 对于 obj 来说唯一的key
 * @param obj 主体对象
 * @param key 新的键
 */
function generateObjOnlyKey(obj, key, text) {
    let i = 1;
    const generate = () => {
        if (_.get(obj, key) && _.get(obj, key) !== text) {
            key = `${key.split("_")[0]}_${i}`;
            i++;
            return generate();
        }
        return key;
    };
    return generate();
}
exports.generateObjOnlyKey = generateObjOnlyKey;
/**
 * 删除一个文件夹
 * @param filePath 文件夹路径
 */
function deleteFolder(filePath) {
    childProcess.execSync(`rm -rf ${filePath}`);
}
exports.deleteFolder = deleteFolder;
function renameFolder(oldPath, newPath) {
    fs.renameSync(oldPath, newPath);
}
exports.renameFolder = renameFolder;
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
//# sourceMappingURL=utils.js.map