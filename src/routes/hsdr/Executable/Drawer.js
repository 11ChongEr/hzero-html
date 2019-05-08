import React, { PureComponent } from 'react';
import { Form, Modal, Input, Select, InputNumber } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';

import Switch from 'components/Switch';
import intl from 'utils/intl';

const { Option } = Select;
const FormItem = Form.Item;
// const { TextArea } = Input;
@Form.create({ fieldNameProp: null })
export default class Drawer extends PureComponent {
  @Bind()
  onOk() {
    const { onOk, form } = this.props;
    form.validateFields((error, fieldsValue) => {
      if (!error) {
        const { retryNumber, ...others } = fieldsValue;
        onOk({ strategyParam: { retryNumber }, ...others });
      }
    });
  }

  render() {
    const {
      form,
      initData = {},
      executable,
      title,
      visible,
      onCancel,
      loading,
      onSearchGroup,
    } = this.props;
    const { getFieldDecorator } = form;
    const {
      groupsList = [],
      exeTypeList = [],
      executorStrategyList = [],
      failStrategyList = [],
    } = executable;
    const {
      executableId,
      executorId,
      executableCode,
      exeTypeCode,
      jobHandler,
      enabledFlag,
      executableName,
      executableDesc,
      failStrategy,
      strategyParam,
      executorStrategy,
      // glueSource,
    } = initData;
    const formLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    return (
      <Modal
        width={520}
        title={title}
        visible={visible}
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        onOk={this.onOk}
        onCancel={onCancel}
        confirmLoading={loading}
        destroyOnClose
      >
        <FormItem
          {...formLayout}
          label={intl.get('hsdr.executable.model.executable.executableCode').d('可执行编码')}
        >
          {getFieldDecorator('executableCode', {
            initialValue: executableCode,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hsdr.executable.model.executable.executableCode').d('可执行编码'),
                }),
              },
            ],
          })(
            <Input
              disabled={!isUndefined(executableId)}
              typeCase="upper"
              trim
              inputChinese={false}
            />
          )}
        </FormItem>
        <FormItem
          {...formLayout}
          label={intl.get('hsdr.executable.model.executable.executableName').d('可执行名称')}
        >
          {getFieldDecorator('executableName', {
            initialValue: executableName,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hsdr.executable.model.executable.executableName').d('可执行名称'),
                }),
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem
          {...formLayout}
          label={intl.get('hsdr.executable.model.executable.exeType').d('可执行类型')}
        >
          {getFieldDecorator('exeTypeCode', {
            initialValue: exeTypeCode,
            rules: [
              {
                type: 'string',
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hsdr.executable.model.executable.exeType').d('可执行类型'),
                }),
              },
            ],
          })(
            <Select style={{ width: '100%' }}>
              {exeTypeList.map(item => {
                return (
                  <Option label={item.meaning} value={item.value} key={item.value}>
                    {item.meaning}
                  </Option>
                );
              })}
            </Select>
          )}
        </FormItem>
        <FormItem {...formLayout} label="JobHandler">
          {getFieldDecorator('jobHandler', {
            initialValue: jobHandler,
            rules: [
              {
                required: form.getFieldValue('exeTypeCode') === 'SIMPLE',
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hsdr.executable.model.executable.exeHandler').d('JobHandler'),
                }),
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem
          {...formLayout}
          label={intl.get('hsdr.executable.model.executable.executableDesc').d('可执行描述')}
        >
          {getFieldDecorator('executableDesc', {
            initialValue: executableDesc,
          })(<Input />)}
        </FormItem>
        <FormItem
          {...formLayout}
          label={intl.get('hsdr.executable.model.executable.groupId').d('执行器')}
        >
          {getFieldDecorator('executorId', {
            initialValue: executorId,
            rules: [
              {
                type: 'number',
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hsdr.executable.model.executable.groupId').d('执行器'),
                }),
              },
            ],
          })(
            <Select style={{ width: '100%' }} onFocus={onSearchGroup}>
              {groupsList.map(item => {
                return (
                  <Option label={item.executorName} value={item.executorId} key={item.executorId}>
                    {item.executorName}
                  </Option>
                );
              })}
            </Select>
          )}
        </FormItem>
        <FormItem
          {...formLayout}
          label={intl.get('hsdr.executable.model.executable.executorStrategy').d('执行器策略')}
        >
          {getFieldDecorator('executorStrategy', {
            initialValue: executorStrategy,
            rules: [
              {
                type: 'string',
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl
                    .get('hsdr.executable.model.executable.executorStrategy')
                    .d('执行器策略'),
                }),
              },
            ],
          })(
            <Select style={{ width: '100%' }}>
              {executorStrategyList.map(item => {
                return (
                  <Option label={item.meaning} value={item.value} key={item.value}>
                    {item.meaning}
                  </Option>
                );
              })}
            </Select>
          )}
        </FormItem>
        <FormItem
          {...formLayout}
          label={intl.get('hsdr.executable.model.executable.failStrategy').d('失败处理策略')}
        >
          {getFieldDecorator('failStrategy', {
            initialValue: failStrategy,
            rules: [
              {
                type: 'string',
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hsdr.executable.model.executable.failStrategy').d('失败处理策略'),
                }),
              },
            ],
          })(
            <Select style={{ width: '100%' }}>
              {failStrategyList.map(item => {
                return (
                  <Option label={item.meaning} value={item.value} key={item.value}>
                    {item.meaning}
                  </Option>
                );
              })}
            </Select>
          )}
        </FormItem>
        {form.getFieldValue('failStrategy') === 'RETRY' && (
          <FormItem
            label={intl.get('hsdr.executable.model.executable.retryNumber').d('重试次数')}
            {...formLayout}
          >
            {getFieldDecorator('retryNumber', {
              initialValue: strategyParam && JSON.parse(strategyParam).retryNumber,
            })(<InputNumber min={0} step={1} style={{ width: '100%' }} />)}
          </FormItem>
        )}
        <FormItem label={intl.get('hzero.common.status').d('状态')} {...formLayout}>
          {getFieldDecorator('enabledFlag', {
            initialValue: enabledFlag === undefined ? 1 : enabledFlag,
            // initialValue: !!enabledFlag,
          })(<Switch />)}
        </FormItem>
        {/* <Col span={24}>
          <FormItem label="GULE" labelCol={{ span: 3 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('glueSource', {
              initialValue: glueSource,
              rules: [
                {
                  required:
                    form.getFieldValue('exeTypeCode') &&
                    form.getFieldValue('exeTypeCode') !== 'BEAN',
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hsdr.executable.model.executable.GULE').d('GULE'),
                  }),
                },
              ],
            })(<TextArea autosize={{ minRows: 10, maxRows: 16 }} />)}
          </FormItem>
        </Col> */}
      </Modal>
    );
  }
}
