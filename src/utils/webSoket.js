import { isFunction, isString } from 'lodash';
import { Bind } from 'lodash-decorators';

import { WEBSOCKET_URL } from 'utils/config';
import { getAccessToken } from 'utils/utils';

import EventEmitter from 'event-emitter';
import notification from './notification';
import intl from './intl';

class WebSocketManagener {
  eventManagener = new EventEmitter();

  /**
   * 当webSocket返回信息时执行
   * @param {Object} message 返回对象
   */
  @Bind()
  handleSocketMessage(message) {
    const res = JSON.parse(message.data || {});
    if (res) {
      this.eventManagener.emit(res.type, res);
    }
  }

  /**
   * 关闭webSocket连接
   */
  @Bind()
  destroyWebSocket() {
    this.socket.close();
  }

  /**
   * 增加监听事件
   */
  @Bind()
  addListener(type, handler) {
    if (isString(type) && isFunction(handler)) {
      this.eventManagener.on(type, handler);
    }
  }

  /**
   * 移除监听事件
   */
  @Bind()
  removeListener(type, handler) {
    if (isString(type) && isFunction(handler)) {
      this.eventManagener.off(type, handler);
    }
  }

  /**
   * 移除所有监听事件
   */
  @Bind()
  removeAllListeners(type) {
    if (isString(type)) {
      this.eventManagener.off(type);
    }
  }

  /**
   * 建立 webSocket 连接
   */
  initWebSocket() {
    const accessToken = getAccessToken();
    try {
      this.socket = new WebSocket(
        `${WEBSOCKET_URL}/ws/client?access_token=${accessToken}&key=hmsg:web&token=${accessToken}`
      );
      this.socket.onopen = this.handleSocketOpen;
      this.socket.onmessage = this.handleSocketMessage;
    } catch (err) {
      notification.error({
        message: intl.get('hzero.common.notification.error.webSocket').d('webSocket连接失败!'),
      });
      this.socket = {};
    }
  }
}

const webSocketManagener = new WebSocketManagener();

export default webSocketManagener;
