"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROJECT_CONFIG = exports.KIWI_CONFIG_FILE = void 0;
/**
 * @author linhuiw
 * @desc 项目配置文件配置信息
 */
exports.KIWI_CONFIG_FILE = 'kiwi-config.json';
exports.PROJECT_CONFIG = {
    dir: "./.kiwi",
    configFile: `./.kiwi/${exports.KIWI_CONFIG_FILE}`,
    defaultConfig: {
        kiwiDir: "./.kiwi",
        configFile: `./.kiwi/${exports.KIWI_CONFIG_FILE}`,
        srcLang: "zh-CN",
        distLangs: ["en-US", "zh-TW"],
        googleApiKey: "",
        translateOptions: {
            concurrentLimit: 10,
            requestOptions: {},
        },
        importI18N: `import I18N from 'src/utils/I18N';`,
        ignoreDir: "",
        ignoreFile: "",
        compileOptions: [
            {
                /** 处理单个文件夹 这个文件夹下的所有翻译会组成一个 ts 翻译文件（相对 ROOT_DIR 定位） */
                combDir: "base",
                /** 批量处理多个文件夹，会以这个文件夹下第一层文件夹为名称生成 ts 翻译文件（相对 ROOT_DIR 定位） */
                combBatchDir: "",
                /** 忽略的文件夹 */
                ignoreDirectory: ["components", "I18N"],
                /** 忽略的文件 */
                ignoreFile: "",
            },
            {
                combDir: "base/components",
            },
            {
                combBatchDir: "modules",
            },
        ],
    },
    langMap: {
        ["en-US"]: "en",
        ["en_US"]: "en",
        ["zh-TW"]: "zh-tw",
    },
    zhIndexFile: `import common from './common';

  export default Object.assign({}, {
    common
  });`,
    zhTestFile: `export default {
    test: '测试'
  }`,
};
//# sourceMappingURL=const.js.map