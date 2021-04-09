/*
 * 编译的配置
 * */

import * as path from 'path';

export type TConfig = {
  ROOT_DIR: string;
  KIWI_DIR: string;
  TARGET_DIR: string;
  LANGS: string[];
  compileOptions: {
    combDir?: string;
    combBatchDir?: string;
    ignoreDirectory?: string | string[];
    ignoreFile?: string | RegExp;
  }[];
};

const idp: TConfig = {
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

const common: TConfig = {
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

const portal: TConfig = {
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

const admin: TConfig = {
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

export default { idp, common, portal, admin };
