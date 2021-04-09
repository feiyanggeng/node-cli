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
exports.exportMessages = void 0;
/**
 * @author linhuiw
 * @desc 导出未翻译文件
 */
require("ts-node").register({
    compilerOptions: {
        module: "commonjs",
    },
});
const fs = __importStar(require("fs"));
const d3_dsv_1 = require("d3-dsv");
const utils_1 = require("./utils");
function exportMessages(file, lang) {
    const CONFIG = utils_1.getProjectConfig();
    const langs = lang ? [lang] : CONFIG.distLangs;
    langs.map((lang) => {
        const allMessages = utils_1.getAllMessages(CONFIG.srcLang);
        const existingTranslations = utils_1.getAllMessages(lang, (message, key) => !/[\u4E00-\u9FA5]/.test(allMessages[key]) ||
            allMessages[key] !== message);
        const messagesToTranslate = Object.keys(allMessages)
            .filter((key) => !existingTranslations.hasOwnProperty(key))
            .map((key) => {
            let message = allMessages[key];
            message = JSON.stringify(message).slice(1, -1);
            return [key, message];
        });
        if (messagesToTranslate.length === 0) {
            console.log("All the messages have been translated.");
            return;
        }
        const content = d3_dsv_1.tsvFormatRows(messagesToTranslate);
        const sourceFile = file || `./export-${lang}.tsv`;
        fs.writeFileSync(sourceFile, content);
        console.log(`Exported ${messagesToTranslate.length} message(s).`);
    });
}
exports.exportMessages = exportMessages;
//# sourceMappingURL=export.js.map