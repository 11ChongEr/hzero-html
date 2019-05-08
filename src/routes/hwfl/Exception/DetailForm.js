/**
 * exception - 报错详情Modal
 * @date: 2018-8-21
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Form, Modal } from 'hzero-ui';

@Form.create({ fieldNameProp: null })
export default class DetailForm extends React.PureComponent {
  render() {
    const { data = {}, title, modalVisible, loading, onCancel, ...other } = this.props;
    return (
      <Modal
        destroyOnClose
        title={title}
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        visible={modalVisible}
        // confirmLoading={loading}
        onCancel={onCancel}
        {...other}
      >
        <div>{data.messStr}</div>
      </Modal>
    );
  }
}
