import React from 'react';
import { Modal, Button } from 'hzero-ui';

import intl from 'utils/intl';

import styles from './index.less';

/**
 * 接收人数据展示列表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onOk - 确认之后的回调函数
 * @reactProps {Boolean} contentVisible - 收件人模态框是否可见
 * @reactProps {Object} content - 内容信息
 * @reactProps {Object} error - 错误信息
 * @return React.element
 */

export default class ContentView extends React.PureComponent {
  render() {
    const { contentVisible, onOk, content, isContent, error } = this.props;
    return (
      <Modal
        title={
          isContent
            ? intl.get('hmsg.messageQuery.model.messageQuery.content').d('内容')
            : intl.get('hmsg.messageQuery.model.messageQuery.error').d('错误')
        }
        width={520}
        destroyOnClose
        visible={contentVisible}
        closable={false}
        footer={
          <Button type="primary" onClick={onOk}>
            {intl.get('hmsg.messageQuery.view.button.save').d('确定')}
          </Button>
        }
      >
        {isContent ? (
          <div>
            <p>{content.subject}</p>
            <div className={styles.content} dangerouslySetInnerHTML={{ __html: content.content }} />
          </div>
        ) : (
          <div style={{ height: '300px', overflowY: 'scroll' }}>{error.transactionMessage}</div>
        )}
      </Modal>
    );
  }
}
