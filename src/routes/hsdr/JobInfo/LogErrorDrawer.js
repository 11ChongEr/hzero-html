import React from 'react';
import { Modal, Spin, Form, Button } from 'hzero-ui';
import intl from 'utils/intl';

@Form.create({ fieldNameProp: null })
export default class JobErrorModal extends React.Component {
  render() {
    const { onOk, onCancel, jobErrorDetail, modalVisible, initLoading = false } = this.props;

    return (
      <Modal
        title={intl.get('hsdr.jobLog.model.jobLog.errorDetail').d('错误详情')}
        visible={modalVisible}
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        width={620}
        destroyOnClose
        closable={false}
        onCancel={onCancel}
        footer={
          <Button type="primary" onClick={onOk}>
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>
        }
      >
        <Spin spinning={initLoading}>
          <p dangerouslySetInnerHTML={{ __html: jobErrorDetail }} />
        </Spin>
      </Modal>
    );
  }
}
