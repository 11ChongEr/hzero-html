/**
 * tenants - 租户维护Modal
 * @date: 2018-8-4
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Form, Input } from 'hzero-ui';
import Switch from 'components/Switch';
import ModalForm from 'components/Modal/ModalForm';
import intl from 'utils/intl';

/**
 * 组织信息模态框表单
 * @extends {ModalForm} - React.ModalForm
 * @reactProps {Function} handleAdd - 表单提交
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class TenantForm extends ModalForm {
  renderForm() {
    const { data = {}, form = {} } = this.props;
    const { getFieldDecorator = e => e } = form;
    const formLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 14 },
    };
    return (
      <React.Fragment>
        <Form.Item label={intl.get('entity.tenant.code').d('租户编码')} {...formLayout}>
          {getFieldDecorator('tenantNum', {
            initialValue: data.tenantNum,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('entity.tenant.code').d('租户编码'),
                }),
              },
              {
                max: 30,
                message: intl.get('hzero.common.validation.max', {
                  max: 30,
                }),
              },
            ],
          })(
            <Input
              trim
              typeCase="upper"
              inputChinese={false}
              disabled={data.tenantId !== undefined}
            />
          )}
        </Form.Item>
        <Form.Item label={intl.get('entity.tenant.name').d('租户名称')} {...formLayout}>
          {getFieldDecorator('tenantName', {
            initialValue: data.tenantName,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('entity.tenant.name').d('租户名称'),
                }),
              },
              {
                max: 30,
                message: intl.get('hzero.common.validation.max', {
                  max: 30,
                }),
              },
            ],
          })(<Input />)}
        </Form.Item>
        <Form.Item label={intl.get('hzero.common.status.enable').d('启用')} {...formLayout}>
          {getFieldDecorator('enabledFlag', {
            initialValue: data.enabledFlag,
          })(<Switch />)}
        </Form.Item>
      </React.Fragment>
    );
  }
}
