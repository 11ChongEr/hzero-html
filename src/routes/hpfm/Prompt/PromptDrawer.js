import React from 'react';
import { Form, Input, Select, Modal, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

import { getCurrentOrganizationId } from 'utils/utils';

const { Option } = Select;
const FormItem = Form.Item;

const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 17 },
};

@Form.create({ fieldNameProp: null })
export default class PromptForm extends React.Component {
  state = {
    currentTenantId: getCurrentOrganizationId(),
  };

  @Bind()
  handleOk() {
    const { form, onOk } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        onOk(fieldsValue);
      }
    });
  }

  render() {
    const { form, initData, languageList, title, modalVisible, loading, onCancel } = this.props;
    const { currentTenantId } = this.state;
    const { getFieldDecorator } = form;
    const { promptKey, promptCode, lang, description, tenantId } = initData;
    // 当前租户是否和数据中的租户对应
    const isCurrentTenant = tenantId !== undefined ? tenantId !== currentTenantId : false;
    return (
      <Modal
        destroyOnClose
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        title={title}
        visible={modalVisible}
        confirmLoading={loading}
        onCancel={onCancel}
        footer={
          isCurrentTenant
            ? null
            : [
                <Button key="cancel" onClick={onCancel}>
                  {intl.get('hzero.common.button.cancel').d('取消')}
                </Button>,
                <Button key="on" type="primary" loading={loading} onClick={this.handleOk}>
                  {intl.get('hzero.common.button.ok').d('确定')}
                </Button>,
              ]
        }
      >
        <Form>
          <FormItem
            {...formLayout}
            label={intl.get('hpfm.prompt.model.prompt.promptKey').d('模板代码')}
          >
            {getFieldDecorator('promptKey', {
              initialValue: promptKey,
              rules: [
                {
                  type: 'string',
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hpfm.prompt.model.prompt.promptKey').d('模板代码'),
                  }),
                },
              ],
            })(<Input disabled={isCurrentTenant} inputChinese={false} />)}
          </FormItem>
          <FormItem
            {...formLayout}
            label={intl.get('hpfm.prompt.model.prompt.promptCode').d('代码')}
          >
            {getFieldDecorator('promptCode', {
              initialValue: promptCode,
              rules: [
                {
                  type: 'string',
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hpfm.prompt.model.prompt.promptCode').d('代码'),
                  }),
                },
              ],
            })(<Input disabled={isCurrentTenant} inputChinese={false} />)}
          </FormItem>
          <FormItem {...formLayout} label={intl.get('hpfm.prompt.model.prompt.lang').d('语言')}>
            {getFieldDecorator('lang', {
              initialValue: lang,
              rules: [
                {
                  type: 'string',
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hpfm.prompt.model.prompt.lang').d('语言'),
                  }),
                },
              ],
            })(
              <Select disabled={isCurrentTenant}>
                {languageList.map(item => (
                  <Option key={item.value} value={item.value}>
                    {item.meaning}
                  </Option>
                ))}
              </Select>
            )}
          </FormItem>
          <FormItem
            {...formLayout}
            label={intl.get('hpfm.prompt.model.prompt.description').d('描述')}
          >
            {getFieldDecorator('description', {
              initialValue: description,
              rules: [
                {
                  type: 'string',
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hpfm.prompt.model.prompt.description').d('描述'),
                  }),
                },
              ],
            })(<Input disabled={isCurrentTenant} dbc2sbc={false} />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
