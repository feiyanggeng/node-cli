/**
 * @author linhuiw
 * @desc 项目配置文件配置信息
 */
export const KIWI_CONFIG_FILE = 'kiwi-config.json';

export const PROJECT_CONFIG = {
  dir: "./.kiwi",
  configFile: `./.kiwi/${KIWI_CONFIG_FILE}`,
  defaultConfig: {
    kiwiDir: "./.kiwi",
    configFile: `./.kiwi/${KIWI_CONFIG_FILE}`,
    srcLang: "zh-CN",
    distLangs: ["en-US", "zh-TW"],
    googleApiKey: "",
    translateOptions: {
      concurrentLimit: 10,
      requestOptions: {},
    },
    importI18N: `import I18N from 'src/utils/I18N';`,
    ignoreDir: "", // NOTICE: 增加对数组的支持，可以传入 string | string[]
    ignoreFile: "", // NOTICE: 增加对 RegExp 的支持，可以传入 string 或者 RegExp 的字符串
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
