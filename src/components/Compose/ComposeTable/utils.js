/**
 * utils
 * @date 2018/9/28
 * @author WY yang.wang06@hand-china.com
 * @copyright Copyright (c) 2018, Hand
 */

import { isString, min, max } from 'lodash';
/**
 * getWidthFromWord - 通过字符串确定宽度
 * @param {String} word - 字符串
 * @param {Number} minWidth - 最小宽度
 * @param {Number} maxWidth - 最大宽度
 * @param {Number} [defaultWidth=100] - 默认宽度
 * @param {Number} [fontWidth=14] - 每个字符的宽度
 * @param {Number} [paddingWidth=20] - 补偿额外宽度
 */
export function getWidthFromWord({
  word,
  minWidth,
  maxWidth,
  defaultWidth = 100,
  fontWidth = 14,
  paddingWidth = 20,
}) {
  if (isString(word)) {
    return min([max([word.length * fontWidth, minWidth]), maxWidth]) + paddingWidth;
  }
  return defaultWidth;
}
