import React from 'react';
import { Form, Input, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

const FormItem = Form.Item;

const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 15 },
};

@Form.create({ fieldNameProp: null })
export default class CreateCode extends React.Component {
  @Bind()
  handleSave() {
    const { form, onOk } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        onOk(fieldsValue, form);
      }
    });
  }

  @Bind()
  handleCancel() {
    const { onShowCreateModal, form } = this.props;
    form.resetFields();
    onShowCreateModal(false);
  }

  render() {
    const { form, modalVisible, loading } = this.props;
    return (
      <Modal
        title={intl.get('hpfm.codeRule.view.message.title.modal.list').d('新建编码规则')}
        visible={modalVisible}
        width={600}
        destroyOnClose
        confirmLoading={loading}
        onOk={this.handleSave}
        onCancel={this.handleCancel}
      >
        <React.Fragment>
          <FormItem
            {...formLayout}
            label={intl.get('hpfm.codeRule.model.codeRule.ruleCode').d('规则代码')}
          >
            {form.getFieldDecorator('ruleCode', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hpfm.codeRule.model.codeRule.ruleCode').d('规则代码'),
                  }),
                },
                {
                  max: 30,
                  message: intl.get('hzero.common.validation.max', {
                    max: 30,
                  }),
                },
              ],
            })(<Input typeCase="upper" trim inputChinese={false} />)}
          </FormItem>
          <FormItem
            {...formLayout}
            label={intl.get('hpfm.codeRule.model.codeRule.ruleName').d('规则名称')}
          >
            {form.getFieldDecorator('ruleName', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hpfm.codeRule.model.codeRule.ruleName').d('规则名称'),
                  }),
                },
                {
                  max: 20,
                  message: intl.get('hzero.common.validation.max', {
                    max: 20,
                  }),
                },
              ],
            })(<Input />)}
          </FormItem>
        </React.Fragment>
      </Modal>
    );
  }
}
