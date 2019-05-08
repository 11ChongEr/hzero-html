/**
 * Constants 常量
 * @date: 2018-9-20
 * @author: niujiaqing <njq.niu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

/* 默认前后端交互格式-日期 */
export const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD';

/* 默认前后端交互格式-日期时间 */
export const DEFAULT_DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

/* 默认前后端交互格式-时间 */
export const DEFAULT_TIME_FORMAT = 'HH:mm:ss';

/* 特定格式的日期处理格式，时分秒指定为00:00:00 */
export const DATETIME_MIN = 'YYYY-MM-DD 00:00:00';
/* 特定格式的日期处理格式，时分秒指定为23:59:59 */
export const DATETIME_MAX = 'YYYY-MM-DD 23:59:59';

/* 方法调用时，防反跳时间 */
export const DEBOUNCE_TIME = 200;

// private 私有的方法 仅仅只有 公用的方法用到
/* 分页大小 */
export const PAGE_SIZE_OPTIONS = ['10', '20', '50', '100'];
