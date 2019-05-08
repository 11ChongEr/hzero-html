import React, { PureComponent } from 'react';
import { Form, Input, Button, Select } from 'hzero-ui';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import { VERSION_IS_OP } from 'utils/config';
import { isTenantRoleLevel } from 'utils/utils';

const FormItem = Form.Item;
const { Option } = Select;

const modelPrompt = 'hiam.roleManagement.model.roleManagement';
const commonPrompt = 'hzero.common';
const tenantRoleLevel = isTenantRoleLevel();

@Form.create({ fieldNameProp: null })
export default class Search extends PureComponent {
  onClick() {
    const {
      handleQueryList = e => e,
      form: { getFieldsValue = e => e },
    } = this.props;
    const data = getFieldsValue() || {};
    handleQueryList({
      ...data,
    });
  }

  onReset() {
    const {
      form: { resetFields = e => e },
    } = this.props;
    resetFields();
  }

  render() {
    const {
      code = [],
      form: { getFieldDecorator = e => e },
      organizationId,
    } = this.props;
    return (
      <Form layout="inline">
        <FormItem label={intl.get(`${modelPrompt}.name`).d('角色名称')}>
          {getFieldDecorator('name')(<Input />)}
        </FormItem>
        <FormItem label={intl.get(`${modelPrompt}.parentRole`).d('父级角色')}>
          {getFieldDecorator('parentRoleName')(<Input />)}
        </FormItem>
        {!VERSION_IS_OP && organizationId === 0 && (
          <FormItem label={intl.get(`${modelPrompt}.tenant`).d('所属租户')}>
            {getFieldDecorator('tenantId')(
              <Lov
                style={{ width: 150 }}
                code={tenantRoleLevel ? 'HPFM.TENANT.ORG' : 'HPFM.TENANT'}
              />
            )}
          </FormItem>
        )}
        {organizationId === 0 && (
          <FormItem label={intl.get(`${modelPrompt}.roleSource`).d('角色来源')}>
            {getFieldDecorator('roleSource')(
              <Select allowClear style={{ width: 150 }}>
                {code.map(n => (
                  <Option key={n.value} value={n.value}>
                    {n.meaning}
                  </Option>
                ))}
              </Select>
            )}
          </FormItem>
        )}
        <FormItem>
          <Button type="primary" htmlType="submit" onClick={this.onClick.bind(this)}>
            {intl.get(`${commonPrompt}.button.search`).d('查询')}
          </Button>
        </FormItem>
        <FormItem>
          <Button onClick={this.onReset.bind(this)}>
            {intl.get(`${commonPrompt}.button.reset`).d('重置')}
          </Button>
        </FormItem>
      </Form>
    );
  }
}
