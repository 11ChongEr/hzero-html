import React from 'react';
import { Form, Modal, Button, Divider } from 'hzero-ui';
import { connect } from 'dva';
// import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import styles from './index.less';

@connect(({ loading, productService }) => ({
  productService,
  fetchProductLovLoading: loading.effects['productService/queryProductServiceLov'],
}))
@Form.create({ fieldNameProp: null })
export default class productServiceForm extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { title, modalVisible, onCancel, nodeDetailData } = this.props;
    const { data = {} } = nodeDetailData;
    const { serviceCode, serviceName } = data;
    return (
      <Modal
        destroyOnClose
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        title={title}
        visible={modalVisible}
        onCancel={onCancel}
        footer={
          <Button type="primary" onClick={onCancel}>
            确定
          </Button>
        }
      >
        <div className={styles['topology-detail-wrapper']}>
          <Divider orientation="left">
            {intl.get('hsgp.common.view.message.editor.basicInfo').d('基本信息')}
          </Divider>
          <div>
            <span>{intl.get('hsgp.common.model.common.serviceCode').d('服务编码')}: </span>
            {serviceCode}
          </div>
          <div>
            <span>{intl.get('hsgp.common.model.common.serviceName').d('服务名称')}: </span>
            {serviceName}
          </div>
        </div>
      </Modal>
    );
  }
}
