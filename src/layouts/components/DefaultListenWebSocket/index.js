/**
 * 监听 websocket
 */

import React from 'react';
import { isEmpty } from 'lodash';
import { connect } from 'dva';

import webSocketManager from 'utils/webSoket';
import { getCurrentOrganizationId } from 'utils/utils';

class DefaultListenWebSocket extends React.Component {
  componentDidMount() {
    webSocketManager.initWebSocket();
    webSocketManager.addListener('client', messageData => {
      const { saveNotices, count } = this.props;
      const { message } = messageData;
      const messageJson = isEmpty(message) ? undefined : JSON.parse(message);
      if (!isEmpty(messageJson)) {
        const { tenantId, number } = messageJson;
        let newCount = count;
        if (tenantId === 0) {
          newCount = Number(count) + Number(number);
        } else if (tenantId === getCurrentOrganizationId()) {
          newCount = Number(count) + Number(number);
        }
        saveNotices({ count: newCount });
      }
    });
  }

  componentWillUnmount() {
    webSocketManager.destroyWebSocket();
  }

  render() {
    return null;
  }
}

export default connect(
  ({ global = {} }) => ({
    count: global.count,
  }),
  dispatch => ({
    saveNotices: payload => {
      return dispatch({
        type: 'global/saveNotices',
        payload,
      });
    },
  })
)(DefaultListenWebSocket);
