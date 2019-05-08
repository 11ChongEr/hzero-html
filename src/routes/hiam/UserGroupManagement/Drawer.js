/**
 * UserGroupManagement 用户组管理
 * @date: 2019-1-14
 * @author: guochaochao <chaochao.guo@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Form, Input, Modal, Spin } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import Switch from 'components/Switch';
import Lov from 'components/Lov';

import intl from 'utils/intl';
import { isTenantRoleLevel } from 'utils/utils';

const FormItem = Form.Item;

const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 17 },
};

@Form.create({ fieldNameProp: null })
export default class MessageForm extends React.PureComponent {
  @Bind()
  handleOK() {
    const { form, onOk = e => e } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        onOk(fieldsValue);
      }
    });
  }

  render() {
    const { form, initData, title, modalVisible, loading, onCancel, initLoading } = this.props;
    const {
      userGroupId,
      groupCode,
      groupName,
      remark,
      enabledFlag,
      tenantName,
      tenantId,
    } = initData;
    const { getFieldDecorator } = form;
    return (
      <Modal
        destroyOnClose
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        title={title}
        visible={modalVisible}
        confirmLoading={loading}
        onCancel={onCancel}
        onOk={this.handleOK}
      >
        <Spin spinning={initLoading}>
          <Form>
            {!isTenantRoleLevel() && (
              <FormItem
                {...formLayout}
                label={intl.get('hpfm.database.model.database.tenantName').d('租户名称')}
              >
                {getFieldDecorator('tenantId', {
                  initialValue: tenantId,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hpfm.database.model.database.tenantName').d('租户名称'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    style={{ width: '100%' }}
                    allowClear={false}
                    textValue={tenantName}
                    disabled={userGroupId !== undefined}
                    code="HPFM.TENANT"
                  />
                )}
              </FormItem>
            )}
            <FormItem
              {...formLayout}
              label={intl
                .get('hiam.userGroupManagement.model.userGroupManagement.groupCode')
                .d('用户组编码')}
            >
              {getFieldDecorator('groupCode', {
                initialValue: groupCode,
                rules: [
                  {
                    type: 'string',
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hiam.userGroupManagement.model.userGroupManagement.groupCode')
                        .d('用户组编码'),
                    }),
                  },
                ],
              })(<Input disabled={userGroupId !== undefined} inputChinese={false} />)}
            </FormItem>
            <FormItem
              {...formLayout}
              label={intl
                .get('hiam.userGroupManagement.model.userGroupManagement.groupName')
                .d('用户组名称')}
            >
              {getFieldDecorator('groupName', {
                initialValue: groupName,
                rules: [
                  {
                    type: 'string',
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hiam.userGroupManagement.model.userGroupManagement.groupName')
                        .d('用户组名称'),
                    }),
                  },
                ],
              })(<Input dbc2sbc={false} />)}
            </FormItem>
            <FormItem
              {...formLayout}
              label={intl
                .get('hiam.userGroupManagement.model.userGroupManagement.remark')
                .d('备注说明')}
            >
              {getFieldDecorator('remark', {
                initialValue: remark,
              })(<Input dbc2sbc={false} />)}
            </FormItem>
            <FormItem {...formLayout} label={intl.get('hzero.common.status.enable').d('启用')}>
              {getFieldDecorator('enabledFlag', {
                initialValue: enabledFlag === undefined ? 1 : enabledFlag,
              })(<Switch />)}
            </FormItem>
          </Form>
        </Spin>
      </Modal>
    );
  }
}
