import React from 'react';
import { Form, Input } from 'hzero-ui';

import Lov from 'components/Lov';
import ModalForm from 'components/Modal/ModalForm';
import Switch from 'components/Switch';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 15 },
};

@Form.create({ fieldNameProp: null })
export default class PortalAssignForm extends ModalForm {
  constructor(props) {
    super(props);
    this.state = {
      companyQuery: {},
    };
  }

  renderForm() {
    const { form, initData } = this.props;
    const { getFieldDecorator } = form;
    const { groupId, companyId, webUrl, groupName, companyName, groupNum, companyNum } = initData;
    return (
      <React.Fragment>
        <FormItem {...formItemLayout} label={intl.get('entity.group.name').d('集团名称')}>
          {getFieldDecorator('groupId', {
            initialValue: groupId,
            rules: [
              {
                type: 'number',
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('entity.group.name').d('集团名称'),
                }),
              },
            ],
          })(
            <Lov
              textValue={groupName}
              code="HPFM.GROUP"
              onChange={(text, record) => {
                this.setState({
                  companyQuery: { tenantId: getCurrentOrganizationId(), groupId: record.groupId },
                });
                form.setFieldsValue({ companyId: '', groupNum: record.groupNum });
              }}
            />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label={intl.get('entity.group.code').d('集团编码')}>
          {getFieldDecorator('groupNum', {
            initialValue: groupNum,
          })(<Input disabled />)}
        </FormItem>
        <FormItem {...formItemLayout} label={intl.get('entity.company.name').d('公司名称')}>
          {getFieldDecorator('companyId', {
            initialValue: companyId,
          })(
            <Lov
              textValue={companyName}
              disabled={form.getFieldValue('groupId') === undefined}
              code="HPFM.COMPANY"
              queryParams={{
                tenantId: initData.tenantId,
                groupId: initData.groupId,
                ...this.state.companyQuery,
              }}
              onChange={(text, record) => {
                form.setFieldsValue({
                  companyNum: record.companyNum,
                });
              }}
            />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label={intl.get('entity.company.code').d('公司编码')}>
          {getFieldDecorator('companyNum', {
            initialValue: companyNum,
          })(<Input disabled />)}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={intl.get('hptl.portalAssign.model.portalAssign.webUrl').d('二级页面域名')}
        >
          {getFieldDecorator('webUrl', {
            initialValue: webUrl,
            rules: [
              {
                type: 'string',
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hptl.portalAssign.model.portalAssign.webUrl').d('二级页面域名'),
                }),
              },
              {
                max: 20,
                message: intl.get('hzero.common.validation.max', {
                  max: 20,
                }),
              },
            ],
          })(
            <Input
              onChange={e => form.setFieldsValue({ webUrl2: `${e.target.value}.going-link.com` })}
            />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={intl.get('hptl.portalAssign.model.portalAssign.webUrlLink').d('二级域名地址')}
        >
          {getFieldDecorator('webUrl2', {
            initialValue: (webUrl && `${webUrl}.going-link.com`) || '',
          })(<Input disabled />)}
        </FormItem>
        <FormItem {...formItemLayout} label={intl.get('hzero.common.status.enable').d('启用')}>
          {getFieldDecorator('enabledFlag', {
            initialValue: initData.enabledFlag === undefined ? 1 : initData.enabledFlag,
          })(<Switch />)}
        </FormItem>
      </React.Fragment>
    );
  }
}
