"use strict";
/*
 * 编译的配置
 * */
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
const path = __importStar(require("path"));
const idp = {
    /** admin | idp | portal | common */
    ROOT_DIR: path.resolve(__dirname, './packages/idaas-web/src/idp'),
    /** kiwi 翻译文件地址 */
    KIWI_DIR: '.kiwi',
    TARGET_DIR: '.Intl',
    /** 支持的语言, 需要与 kiwi 下名称一致 */
    LANGS: ['en-US', 'zh-CN'],
    compileOptions: [
        {
            /** 处理单个文件夹 这个文件夹下的所有翻译会组成一个 ts 翻译文件（相对 ROOT_DIR 定位） */
            combDir: 'base',
            /** 批量处理多个文件夹，会以这个文件夹下第一层文件夹为名称生成 ts 翻译文件（相对 ROOT_DIR 定位） */
            combBatchDir: '',
            /** 忽略的文件夹 */
            ignoreDirectory: ['components', 'I18N'],
            /** 忽略的文件 */
            ignoreFile: '',
        },
        {
            combDir: 'base/components',
        },
        {
            combBatchDir: 'modules',
        },
    ],
};
const common = {
    /** admin | idp | portal | common */
    ROOT_DIR: path.resolve(__dirname, "../../../packages/idaas-web/src/common"),
    /** kiwi 翻译文件地址 */
    KIWI_DIR: ".kiwi",
    TARGET_DIR: ".Intl",
    /** 支持的语言, 需要与 kiwi 下名称一致 */
    LANGS: ["en-US", "zh-CN"],
    compileOptions: [
        {
            combBatchDir: "/",
            ignoreDirectory: [
                "baseComponent",
                "I18N",
                ".kiwi",
                "compositions",
                "static",
            ],
        },
        {
            combDir: "baseComponent",
        },
        {
            combDir: "compositions",
        },
    ],
};
const portal = {
    /** admin | idp | portal | common */
    ROOT_DIR: path.resolve(__dirname, "../../../packages/idaas-web/src/portal"),
    /** kiwi 翻译文件地址 */
    KIWI_DIR: ".kiwi",
    TARGET_DIR: ".Intl",
    /** 支持的语言, 需要与 kiwi 下名称一致 */
    LANGS: ["en-US", "zh-CN"],
    compileOptions: [
        {
            combDir: "base",
            ignoreDirectory: ["components"],
        },
        {
            combDir: "base/components",
        },
        {
            combDir: "compositions",
        },
        {
            combBatchDir: "modules",
        },
    ],
};
const admin = {
    /** admin | idp | portal | common */
    ROOT_DIR: path.resolve(__dirname, "../../../packages/idaas-web/src/admin"),
    /** kiwi 翻译文件地址 */
    KIWI_DIR: ".kiwi",
    TARGET_DIR: ".Intl",
    /** 支持的语言, 需要与 kiwi 下名称一致 */
    LANGS: ["en-US", "zh-CN"],
    compileOptions: [
        {
            combDir: "base",
            ignoreDirectory: ["components", "I18N"],
        },
        {
            combDir: "base/components",
        },
        {
            combDir: "compositions",
        },
        {
            combBatchDir: "modules",
        },
    ],
};
exports.default = { idp, common, portal, admin };
//# sourceMappingURL=config.js.map