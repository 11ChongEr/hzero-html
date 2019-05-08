import React from 'react';
import { Form, Input, Select } from 'hzero-ui';
import { isTenantRoleLevel } from 'utils/utils';
import ModalForm from 'components/Modal/ModalForm';
import Lov from 'components/Lov';
import TLEditor from 'components/TLEditor';
import intl from 'utils/intl';

const { Option } = Select;
const { TextArea } = Input;

@Form.create({ fieldNameProp: null })
export default class CreateForm extends ModalForm {
  renderForm() {
    const { form, lovType = [], onParentLovChange = e => e } = this.props;
    return (
      <Form>
        <Form.Item
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          label={intl.get('hpfm.valueList.model.header.lovCode').d('值集编码')}
        >
          {form.getFieldDecorator('lovCode', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hpfm.valueList.model.header.lovCode').d('值集编码'),
                }),
              },
            ],
          })(<Input trim typeCase="upper" inputChinese={false} />)}
        </Form.Item>
        <Form.Item
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          label={intl.get('hpfm.valueList.model.header.lovName').d('值集名称')}
        >
          {form.getFieldDecorator('lovName', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hpfm.valueList.model.header.lovName').d('值集名称'),
                }),
              },
            ],
          })(
            <TLEditor
              label={intl.get('hpfm.valueList.model.header.lovName').d('值集名称')}
              field="lovName"
            />
          )}
        </Form.Item>
        {!isTenantRoleLevel() && (
          <Form.Item
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 8 }}
            label={intl.get('hpfm.valueList.model.header.tenantId').d('所属租户')}
          >
            {form.getFieldDecorator('tenantId')(<Lov style={{ width: 200 }} code="HPFM.TENANT" />)}
          </Form.Item>
        )}
        <Form.Item
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 8 }}
          label={intl.get('hpfm.valueList.model.header.lovTypeCode').d('值集类型')}
        >
          {form.getFieldDecorator('lovTypeCode', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hpfm.valueList.model.header.lovTypeCode').d('值集类型'),
                }),
              },
            ],
          })(
            <Select style={{ width: 200 }}>
              {lovType.map(item => (
                <Option value={item.value} key={item.value}>
                  {item.meaning}
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>
        {form.getFieldsValue().lovTypeCode === 'URL' ||
        form.getFieldsValue().lovTypeCode === 'SQL' ? (
          <Form.Item
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
            label={intl.get('hpfm.valueList.model.header.routeName').d('目标路由名')}
          >
            {form.getFieldDecorator('routeName', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hpfm.valueList.model.header.routeName').d('目标路由名'),
                  }),
                },
              ],
            })(
              <Lov
                style={{ width: 200 }}
                code={
                  isTenantRoleLevel() ? 'HCNF.ROUTE.SERVICE_PATH.ORG' : 'HCNF.ROUTE.SERVICE_PATH'
                }
              />
            )}
          </Form.Item>
        ) : null}
        {form.getFieldsValue().lovTypeCode === 'URL' ? (
          <Form.Item
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
            label={intl.get('hpfm.valueList.model.header.customUrl').d('查询 URL')}
          >
            {form.getFieldDecorator('customUrl', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hpfm.valueList.model.header.customUrl').d('查询 URL'),
                  }),
                },
              ],
            })(<Input />)}
          </Form.Item>
        ) : null}
        {form.getFieldsValue().lovTypeCode === 'SQL' ? (
          <Form.Item
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
            label={intl.get('hpfm.valueList.model.header.customSql').d('查询 SQL')}
          >
            {form.getFieldDecorator('customSql', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hpfm.valueList.model.header.customSql').d('查询 SQL'),
                  }),
                },
              ],
            })(<TextArea rows={12} />)}
          </Form.Item>
        ) : null}
        {form.getFieldsValue().lovTypeCode === 'IDP' ? (
          <Form.Item
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
            label={intl.get('hpfm.valueList.model.header.parentLovCode').d('父级值集')}
          >
            {form.getFieldDecorator('parentLovCode')(
              <Lov
                style={{ width: 200 }}
                code={
                  isTenantRoleLevel() ? 'HPFM.LOV.LOV_DETAIL_CODE.ORG' : 'HPFM.LOV.LOV_DETAIL_CODE'
                }
                queryParams={{
                  lovTypeCode: 'IDP',
                }}
                onOk={onParentLovChange}
              />
            )}
          </Form.Item>
        ) : null}
        <Form.Item
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          label={intl.get('hpfm.valueList.model.header.description').d('描述')}
        >
          {form.getFieldDecorator('description')(
            <TLEditor
              label={intl.get('hpfm.valueList.model.header.description').d('描述')}
              field="description"
            />
          )}
        </Form.Item>
      </Form>
    );
  }
}
