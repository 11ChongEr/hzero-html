import React from 'react';
import { Form, Input, InputNumber, Modal, Tooltip, Icon, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';

import intl from 'utils/intl';
import Lov from 'components/Lov';

const FormItem = Form.Item;
const { TextArea } = Input;
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
@Form.create({ fieldNameProp: null })
export default class JobGroupForm extends React.PureComponent {
  @Bind()
  onOk() {
    const { onOk, form } = this.props;
    // if (initData.executorType !== 0) {
    form.validateFields((error, fieldsValue) => {
      if (!error) {
        onOk(fieldsValue);
      }
    });
    // } else {
    //   onOk();
    // }
  }

  render() {
    const {
      form,
      initData,
      modalVisible,
      modalTitle,
      saving,
      creating,
      onCancel,
      statusList = [],
      tenantRoleLevel,
      scopeList = [],
    } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const {
      executorCode,
      orderSeq,
      addressList,
      executorId,
      executorName,
      executorType,
      status,
      tenantId,
      tenantName,
      scope,
    } = initData;
    return (
      <Modal
        destroyOnClose
        title={modalTitle}
        visible={modalVisible}
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        confirmLoading={executorId ? saving : creating}
        onCancel={onCancel}
        onOk={this.onOk}
      >
        <FormItem {...formLayout} label={intl.get('hsdr.jobGroup.view.message.orderSeq').d('排序')}>
          {getFieldDecorator('orderSeq', {
            initialValue: orderSeq,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hsdr.jobGroup.view.message.orderSeq').d('排序'),
                }),
              },
              {
                pattern: /^(-(100|[1-9][0-9]?)|([1-9][0-9]{0,1}|100)|0)$/,
                message: intl.get('hsdr.jobGroup.view.message.seqRule').d('取值范围为-100~100'),
              },
            ],
          })(<InputNumber min={-100} max={100} step={1} style={{ width: '100%' }} />)}
        </FormItem>
        <FormItem
          {...formLayout}
          label={intl.get('hsdr.jobGroup.view.message.executorCode ').d('执行器编码')}
        >
          {getFieldDecorator('executorCode', {
            initialValue: executorCode,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hsdr.jobGroup.view.message.executorCode').d('执行器编码'),
                }),
              },
              {
                pattern: /^[A-Z0-9][A-Z0-9-_.]*$/,
                message: intl
                  .get('hsdr.jobGroup.view.message.appNameRule')
                  .d('只能输入大写字母、数字、中划线、下划线、点'),
              },
              // {
              //   pattern: /^[a-z][a-z0-9-]{3,63}$/,
              //   message: intl
              //     .get('hsdr.jobGroup.view.message.appNameRule')
              //     .d('以小写字母开头，由小写字母、数字和中划线组成，长度4~64'),
              // },
            ],
          })(<Input disabled={!isUndefined(executorId)} typeCase="upper" inputChinese={false} />)}
        </FormItem>
        <FormItem
          {...formLayout}
          label={intl.get('hsdr.jobGroup.view.message.executorName').d('执行器名称')}
        >
          {getFieldDecorator('executorName', {
            initialValue: executorName,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hsdr.jobGroup.view.message.executorName').d('执行器名称'),
                }),
              },
            ],
          })(<Input />)}
        </FormItem>
        {/* <FormItem
          {...formLayout}
          label={intl.get('hsdr.jobGroup.view.message.addressType').d('注册方式')}
        >
          {getFieldDecorator('executorType', {
            initialValue: executorType === 1 ? 1 : 0,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hsdr.jobGroup.view.message.addressType').d('注册方式'),
                }),
              },
            ],
          })(
            <RadioGroup onChange={this.handleAddressType}>
              <Radio value={0}>{intl.get('hsdr.jobGroup.view.message.auto').d('自动注册')}</Radio>
              <Radio value={1}>{intl.get('hsdr.jobGroup.view.message.byHand').d('手动录入')}</Radio>
            </RadioGroup>
          )}
        </FormItem> */}
        <FormItem
          // label={intl.get('hsdr.jobGroup.view.message.addressList').d('机器地址')}
          label={
            <span>
              {intl.get('hsdr.jobGroup.view.message.addressList').d('机器地址')}&nbsp;
              <Tooltip
                title={intl
                  .get('hsdr.jobGroup.view.message.addressList.help.msg')
                  .d('多个机器地址用逗号隔开')}
              >
                <Icon type="question-circle-o" />
              </Tooltip>
            </span>
          }
          {...formLayout}
        >
          {getFieldDecorator('addressList', {
            initialValue: addressList,
            rules: [
              {
                required: !(executorType === 0),
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hsdr.jobGroup.view.message.addressList').d('机器地址'),
                }),
              },
            ],
          })(<TextArea rows={3} disabled={executorType === 0} />)}
        </FormItem>
        <FormItem {...formLayout} label={intl.get('hsdr.jobGroup.model.jobGroup.status').d('状态')}>
          {getFieldDecorator('status', {
            initialValue: status,
            rules: [
              {
                type: 'string',
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hsdr.jobGroup.model.jobGroup.status').d('状态'),
                }),
              },
            ],
          })(
            <Select style={{ width: '100%' }} disabled={executorType === 0}>
              {statusList.map(item => {
                return (
                  <Select.Option label={item.meaning} value={item.value} key={item.value}>
                    {item.meaning}
                  </Select.Option>
                );
              })}
            </Select>
          )}
        </FormItem>
        {!tenantRoleLevel && (
          <FormItem
            {...formLayout}
            label={intl.get('hsdr.jobGroup.model.jobGroup.scope').d('层级')}
          >
            {getFieldDecorator('scope', {
              //  eslint-disable-next-line
              initialValue: !isUndefined(scope) ? '' + scope : '',
              rules: [
                {
                  type: 'string',
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hsdr.jobGroup.model.jobGroup.scope').d('层级'),
                  }),
                },
              ],
            })(
              <Select style={{ width: '100%' }}>
                {scopeList.map(item => {
                  return (
                    <Select.Option label={item.meaning} value={item.value} key={item.value}>
                      {item.meaning}
                    </Select.Option>
                  );
                })}
              </Select>
            )}
          </FormItem>
        )}
        {!tenantRoleLevel && getFieldValue('scope') === '0' && (
          <Form.Item label={intl.get('entity.tenant.tag').d('租户')} {...formLayout}>
            {getFieldDecorator('tenantId', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('entity.tenant.tag').d('租户'),
                  }),
                },
              ],
              initialValue: tenantId,
            })(
              <Lov
                textValue={tenantName}
                code="HPFM.TENANT"
                // onChange={() => {
                //   setFieldsValue({ scope: '' });
                // }}
              />
            )}
          </Form.Item>
        )}
      </Modal>
    );
  }
}
