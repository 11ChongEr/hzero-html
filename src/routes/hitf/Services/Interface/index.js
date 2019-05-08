/*
 * index - 服务注册接口页面
 * @date: 2018-10-25
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Button, Drawer, Spin } from 'hzero-ui';
import { isEmpty, isNumber } from 'lodash';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import EditorForm from './Form';

import styles from '../Editor/index.less';

const viewMessagePrompt = 'hitf.services.view.message';
const commonPrompt = 'hzero.common';

export default class Editor extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: props.dataSource || {},
      tenantId: getCurrentOrganizationId(),
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { dataSource } = nextProps;
    const { dataSource: prevDataSource } = prevState;
    if (dataSource !== prevDataSource) {
      return {
        dataSource,
      };
    }
    return null;
  }

  cancel() {
    const { onCancel = e => e } = this.props;
    const { resetFields = e => e } = this.editorForm;
    resetFields();
    this.setState({
      dataSource: {},
    });
    onCancel();
  }

  handleOk() {
    const { save = e => e } = this.props;
    const { dataSource, tenantId } = this.state;
    const { validateFields = e => e } = this.editorForm;
    validateFields((err, values) => {
      const { interfaceId } = dataSource;
      const targetItem = interfaceId
        ? { ...dataSource, ...values, tenantId }
        : { ...dataSource, ...values, tenantId, isNew: true };
      if (isEmpty(err)) {
        save(targetItem, this.cancel.bind(this));
      }
    });
  }

  render() {
    const {
      visible,
      editorHeaderForm,
      processing = {},
      id,
      resetClientKey = e => e,
      type,
      serviceTypes,
      requestTypes,
      soapVersionTypes,
      interfaceStatus,
      contentTypes,
    } = this.props;
    const { dataSource = {} } = this.state;
    const editable = isNumber(id);
    const title = isNumber(id)
      ? intl.get(`${viewMessagePrompt}.title.interface.edit`).d('编辑接口')
      : intl.get(`${viewMessagePrompt}.title.interface.create`).d('创建接口');
    const drawerProps = {
      title,
      visible,
      mask: true,
      maskStyle: { backgroundColor: 'rgba(0,0,0,.85)' },
      placement: 'right',
      destroyOnClose: true,
      onClose: this.cancel.bind(this),
      width: 1000,
      style: {
        height: 'calc(100% - 55px)',
        overflow: 'auto',
        padding: 12,
      },
    };

    const formProps = {
      editorHeaderForm,
      dataSource,
      ref: node => {
        this.editorForm = node;
      },
      editable,
      resetClientKey,
      type,
      serviceTypes,
      requestTypes,
      soapVersionTypes,
      interfaceStatus,
      contentTypes,
    };

    return (
      <Drawer {...drawerProps}>
        <Spin spinning={processing.fetchInterface || false}>
          {/* 抽屉编辑表单 */}
          <EditorForm {...formProps} />
        </Spin>
        <div className={styles['hiam-interface-model-btns']}>
          {/* 新增服务的确定和取消 */}
          <Button
            onClick={this.cancel.bind(this)}
            disabled={processing.save || processing.create}
            style={{ marginRight: 8 }}
          >
            {intl.get(`${commonPrompt}.button.cancel`).d('取消')}
          </Button>

          <Button type="primary" loading={processing.ok} onClick={this.handleOk.bind(this)}>
            {intl.get(`${commonPrompt}.button.ok`).d('确定')}
          </Button>
        </div>
      </Drawer>
    );
  }
}
