import { notification } from 'hzero-ui';
import intl from './intl';

/**
 * 操作成功通知提示
 * @function success
 * @param {object} params - 默认属性
 * @param {?string} [params.message=操作成功] - 提示信息
 * @param {?string} [params.description] - 详细描述
 */
function success({ message, description, ...others } = {}) {
  notification.success({
    message: message || intl.get('hzero.common.notification.success'),
    description,
    duration: 2,
    ...others,
  });
}

/**
 * 操作失败通知提示
 * @function error
 * @param {object} params - 默认属性
 * @param {?string} [params.message=操作失败] - 提示信息
 * @param {?string} [params.description] - 详细描述
 */
function error({ message, description, ...others } = {}) {
  notification.error({
    message: message || intl.get('hzero.common.notification.error'),
    description,
    duration: 2,
    ...others,
  });
}

/**
 * 操作异常通知提示
 * @function warning
 * @param {object} params - 默认属性
 * @param {?string} [params.message=操作异常] - 提示信息
 * @param {?string} [params.description] - 详细描述
 */
function warning({ message, description, ...others } = {}) {
  notification.warning({
    message: message || intl.get('hzero.common.notification.warn'),
    description,
    duration: 2,
    ...others,
  });
}

/**
 * 操作信息通知提示
 * @function info
 * @param {object} config - 默认属性
 * @param {?string} [params.message] - 提示信息
 * @param {?string} [params.description] - 详细描述
 */
function info({ message, description, ...others } = {}) {
  notification.info({
    message,
    description,
    duration: 2,
    ...others,
  });
}

export default {
  success,
  error,
  warning,
  info,
};
