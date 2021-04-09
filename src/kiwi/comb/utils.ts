/**
 * @author doubledream
 * @desc 文件处理方法
 */

import * as path from 'path';
import * as fs from 'fs';
import * as _ from 'lodash';
import { TConfig } from './config';
import { getProjectConfig, getLangData } from "../utils";

// 格式化 ignoreDirectory
function formatIgnoreDirectory(dir: string): string {
  if (!dir) return '';
  if (!/^\//.test(dir)) {
    dir = '/' + dir;
  }
  if (!/\/$/.test(dir)) {
    dir = dir + '/';
  }
  return dir;
}

function formatIgnoreFile(file: string): string {
  return !file ? '' : /^\//.test(file) ? file : '/' + file;
}

function isFileIgnore(
  file: string,
  ignoreDirectory?: string | string[],
  ignoreFile?: string | RegExp,
) {
  // 格式化为 string[]
  ignoreDirectory = !ignoreDirectory
    ? []
    : Array.isArray(ignoreDirectory)
    ? ignoreDirectory
    : [ignoreDirectory];
  const dirName = formatIgnoreDirectory(path.dirname(file));
  const isIgnoreDirectory = ignoreDirectory.some(
    (d) => dirName.indexOf(formatIgnoreDirectory(d)) > -1,
  );
  let isIgnoreFile = false;

  if (ignoreFile instanceof RegExp) {
    isIgnoreFile = ignoreFile.test(file);
  } else if (ignoreFile && typeof ignoreFile === 'string') {
    isIgnoreFile = formatIgnoreFile(file).endsWith(formatIgnoreFile(ignoreFile));
  }

  return isIgnoreDirectory || isIgnoreFile;
}

/**
 * 获取文件夹下符合要求的所有文件
 * @function getSpecifiedFiles
 * @param  {string} dir 路径
 * @param {ignoreDirectory} 忽略文件夹 {ignoreFile} 忽略的文件
 */
function getSpecifiedFiles(
  dir: string,
  ignoreDirectory?: string | string[],
  ignoreFile?: string | RegExp,
): string[] {
  return fs.readdirSync(dir).reduce((files: string[], file: string) => {
    const name = path.join(dir, file);
    const isDirectory = fs.statSync(name).isDirectory();
    const isFile = fs.statSync(name).isFile();

    if (isDirectory) {
      return files.concat(getSpecifiedFiles(name, ignoreDirectory, ignoreFile));
    }

    if (
      isFile &&
      !isFileIgnore(name, ignoreDirectory, ignoreFile) &&
      ['.js', '.jsx', '.json', '.ts', '.tsx'].includes(path.extname(name))
    ) {
      return files.concat(name);
    }
    return files;
  }, []);
}

/**
 *
 * 一个用来将 I18N value 与 key 倒置的方法，方便去重
 * */
type TInvertObject = { [key: string]: string | TInvertObject };

// invertObject 具有副作用
function generateValueMap(
  I18N: TInvertObject,
  invertObject?: { [key: string]: string[] },
  parentKey?: string,
) {
  let invertObj = invertObject || {};
  _.forEach(I18N, (value, key) => {
    if (_.isString(value)) {
      // 不能用 lodash _.get _.set 处理不好 key 字符串中有 '.' 的情况
      const existKeys = invertObj[value];
      const currentKey = `I18N${parentKey ? '.' + parentKey : ''}.${key}`;
      invertObj[value] = Array.isArray(existKeys) ? existKeys.concat([currentKey]) : [currentKey];
    } else {
      // 对象则递归
      generateValueMap(value, invertObj, key);
    }
  });
  return invertObj;
}

// 解析配置，获得可处理的模块目录
function getUsedCombDirs(option: any, ROOT_DIR: string): string[] {
  let { combDir, combBatchDir } = option;
  combDir = combDir ? path.join(ROOT_DIR, combDir) : combDir;
  combBatchDir = combBatchDir ? path.join(ROOT_DIR, combBatchDir) : combBatchDir;
  const usedCombDir = combDir ? [combDir] : [];
  if (combBatchDir) {
    const files = fs.readdirSync(combBatchDir);
    files.forEach((file) => {
      const name = path.join(combBatchDir, file);
      usedCombDir.push(name);
    });
  }

  // 输出 dir | file
  return usedCombDir;
}

// 获得已存在的中英文翻译对象
function getOriginIntlObject(config: TConfig, kiwiDir: string) {
  const allLangData = {};
  const I18NPaths = config.LANGS.map((lang) => {
    if (fs.existsSync(path.join(kiwiDir, lang))) {
      return getSpecifiedFiles(path.join(kiwiDir, lang));
    } else {
      return []
    }
  });
  _.forEach(I18NPaths, (langPaths, lIdx) => {
    const I18N = {};
    _.forEach(langPaths, (langPath) => {
      const fileName = path.basename(langPath).split(".")[0];
      if (fileName === "index") return;
      I18N[fileName] = getLangData(langPath);
    });
    allLangData[config.LANGS[lIdx]] = { I18N: I18N };
  });
  return allLangData;
}

// 预先将路径解析好
function initialConfig() {
  const config = getProjectConfig();
  const ROOT_DIR = path.resolve(process.cwd(), "./");
  const { kiwiDir } = config;
  const KIWI_DIR = path.join(ROOT_DIR, kiwiDir);
  const TARGET_DIR = path.join(ROOT_DIR, ".Intl");
  const LANGS = [...config.distLangs, config.srcLang];

  return { ...config, KIWI_DIR, TARGET_DIR, ROOT_DIR, LANGS };
}

export {
  getSpecifiedFiles,
  generateValueMap,
  isFileIgnore,
  getUsedCombDirs,
  getOriginIntlObject,
  initialConfig,
};
