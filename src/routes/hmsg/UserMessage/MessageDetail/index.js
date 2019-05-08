/**
 * userMessage 站内消息详情
 * @date: 2018-8-4
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
// import { Button } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';

import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

import styles from '../index.less';

@connect(({ userMessage }) => ({
  userMessage,
  organizationId: getCurrentOrganizationId(),
}))
export default class BadgeIcon extends PureComponent {
  componentDidMount() {
    this.getMessageDetail();
  }

  /**
   * 获取消息详情
   */
  @Bind()
  getMessageDetail() {
    const { dispatch, match, organizationId } = this.props;
    const {
      params: { messageId },
    } = match;
    dispatch({
      type: 'userMessage/queryDetail',
      payload: { messageId: messageId * 1, organizationId },
    });
  }

  @Bind()
  handleSaveMessageId() {
    const {
      dispatch,
      match: {
        params: { messageId },
      },
    } = this.props;
    dispatch({
      type: 'userMessage/updateState',
      payload: { messageId },
    });
  }

  render() {
    const {
      userMessage: { messageDetail = {} },
    } = this.props;
    return (
      <React.Fragment>
        <Header
          title={intl.get('hmsg.userMessage.view.message.title.detail').d('消息详情')}
          backPath="/hmsg/user-message/list"
        />
        <Content>
          <div style={{ borderBottom: 'solid 1px #e8e8e8' }}>
            <p style={{ margin: 0, fontWeight: 'bold', fontSize: 20 }}>{messageDetail.subject}</p>
            <p>{messageDetail.creationDate}</p>
          </div>
          <div
            className={styles.content}
            onClick={this.handleSaveMessageId}
            dangerouslySetInnerHTML={{ __html: messageDetail.content }}
          />
        </Content>
      </React.Fragment>
    );
  }
}
