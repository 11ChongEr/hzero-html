/**
 * 个性化配置-列表 编辑表单
 * @date: 2018-9-29
 * @author: WangYang yang.wang06@hand-china.com
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import { isFunction } from 'lodash';
import { Input, Modal, Form } from 'hzero-ui';

import Switch from 'components/Switch';

import intl from 'utils/intl';

const labelCol = { span: 6 };
const wrapperCol = { span: 16 };

@Form.create({ fieldNameProp: null })
export default class EditModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.handleSaveBtnClick = this.handleSaveBtnClick.bind(this);
    this.handleCleanForm = this.handleCleanForm.bind(this);
  }

  render() {
    const {
      form,
      editRecord,
      modalProps = {},
      onCancel,
      isCreate = false,
      ...otherModalProps
    } = this.props;
    const initialValues = editRecord || {};
    return (
      <Modal
        {...otherModalProps}
        {...modalProps}
        onOk={this.handleSaveBtnClick}
        onCancel={onCancel}
        destroyOnClose
        afterClose={this.handleCleanForm}
        width={520}
      >
        <Form>
          <Form.Item
            label={intl.get('hpfm.ui.model.page.pageCode').d('页面编码')}
            labelCol={labelCol}
            wrapperCol={wrapperCol}
          >
            {form.getFieldDecorator('pageCode', {
              initialValue: initialValues.pageCode,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hpfm.ui.model.page.pageCode').d('页面编码'),
                  }),
                },
              ],
            })(<Input disabled={!isCreate} typeCase="upper" />)}
          </Form.Item>
          <Form.Item
            label={intl.get('hpfm.ui.model.page.description').d('页面描述')}
            labelCol={labelCol}
            wrapperCol={wrapperCol}
          >
            {form.getFieldDecorator('description', {
              initialValue: initialValues.description,
            })(<Input />)}
          </Form.Item>
          <Form.Item
            label={intl.get('hzero.common.status.enable').d('启用')}
            labelCol={labelCol}
            wrapperCol={wrapperCol}
          >
            {form.getFieldDecorator('enabledFlag', {
              initialValue: initialValues.enabledFlag !== 0 ? 1 : 0,
            })(<Switch />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }

  handleSaveBtnClick() {
    const { isCreate = false, editRecord, onOk, form } = this.props;
    if (isFunction(onOk)) {
      form.validateFields((err, data) => {
        if (!err) {
          if (isCreate) {
            onOk(data);
          } else {
            onOk({ ...editRecord, ...data });
          }
        }
      });
    }
  }

  handleCleanForm() {
    const { form } = this.props;
    form.resetFields();
  }
}
