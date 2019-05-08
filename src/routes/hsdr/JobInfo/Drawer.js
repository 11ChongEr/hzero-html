import React from 'react';
import { Form, Input, Row, Col, Select, Modal, DatePicker, InputNumber, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import Lov from 'components/Lov';

import { getDateFormat } from 'utils/utils';
import intl from 'utils/intl';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { EMAIL } from 'utils/regExp';

const dateFormat = getDateFormat();
const { Option } = Select;
const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 15 },
};
@Form.create({ fieldNameProp: null })
export default class Drawer extends React.PureComponent {
  @Bind()
  handleOk() {
    const { form, onOk } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        const { startDate, endDate, retryNumber, ...others } = fieldsValue;
        const params = {
          strategyParam: { retryNumber },
          startDate: startDate ? moment(startDate).format(DEFAULT_DATETIME_FORMAT) : null,
          endDate: endDate ? moment(endDate).format(DEFAULT_DATETIME_FORMAT) : null,
          ...others,
        };
        onOk(params);
      }
    });
  }

  @Bind()
  handleCheck() {
    const { onCheck = e => e, form } = this.props;
    const executorId = form.getFieldValue('executorId');
    onCheck(executorId);
  }

  @Bind()
  isJson(string) {
    try {
      if (typeof JSON.parse(string) === 'object') {
        return true;
      }
    } catch (e) {
      return false;
    }
  }

  render() {
    const {
      form,
      initData = {},
      jobInfo,
      groupsList = [],
      title,
      modalVisible,
      loading,
      onCancel,
      tenantRoleLevel,
      onSearchGroup,
      checkLoading = false,
    } = this.props;
    const { getFieldDecorator } = form;
    const { executorRouteList = [], glueTypeList = [], executorFailList = [] } = jobInfo;
    const {
      executorId,
      executorStrategy,
      strategyParam,
      jobParam,
      jobHandler,
      glueType,
      description,
      jobCron,
      jobCode,
      failStrategy,
      alarmEmail,
      tenantId,
      tenantName,
      jobId,
    } = initData;
    return (
      <Modal
        destroyOnClose
        title={title}
        width="1000px"
        visible={modalVisible}
        confirmLoading={loading}
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        onCancel={onCancel}
        footer={[
          <Button key="cancel" onClick={onCancel}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>,
          <Button
            disabled={!form.getFieldValue('executorId')}
            key="check"
            onClick={this.handleCheck}
            loading={checkLoading}
          >
            {intl.get('hzero.common.button.check').d('检查')}
          </Button>,
          <Button type="primary" key="save" onClick={this.handleOk}>
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>,
        ]}
      >
        <Form>
          <Row>
            <Col span={12}>
              <FormItem
                {...formLayout}
                label={intl.get('hsdr.jobInfo.model.jobInfo.jobCode').d('任务编码')}
              >
                {getFieldDecorator('jobCode', {
                  initialValue: jobCode,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hsdr.jobInfo.model.jobInfo.jobCode').d('任务编码'),
                      }),
                    },
                  ],
                })(
                  <Input
                    trim
                    inputChinese={false}
                    typeCase="upper"
                    disabled={jobId !== undefined}
                  />
                )}
              </FormItem>
              {!tenantRoleLevel && (
                <Form.Item
                  {...formLayout}
                  label={intl.get('hsdr.jobInfo.model.jobInfo.tenantName').d('租户')}
                >
                  {getFieldDecorator('tenantId', {
                    initialValue: tenantId,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hsdr.jobInfo.model.jobInfo.tenantName').d('租户'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      code="HPFM.TENANT"
                      textValue={tenantName}
                      textField="tenantName"
                      allowClear={false}
                      disabled={jobId !== undefined}
                    />
                  )}
                </Form.Item>
              )}
              <FormItem
                {...formLayout}
                label={intl
                  .get('hsdr.jobInfo.model.jobInfo.executorFailStrategy')
                  .d('失败处理策略')}
              >
                {getFieldDecorator('failStrategy', {
                  initialValue: failStrategy,
                  rules: [
                    {
                      type: 'string',
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('hsdr.jobInfo.model.jobInfo.executorFailStrategy')
                          .d('失败处理策略'),
                      }),
                    },
                  ],
                })(
                  <Select style={{ width: '100%' }}>
                    {executorFailList.map(item => {
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
                label={intl.get('hsdr.jobInfo.model.jobInfo.groupId').d('执行器')}
              >
                {getFieldDecorator('executorId', {
                  initialValue: executorId,
                  rules: [
                    {
                      type: 'number',
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hsdr.jobInfo.model.jobInfo.groupId').d('执行器'),
                      }),
                    },
                  ],
                })(
                  <Select style={{ width: '100%' }} onFocus={onSearchGroup}>
                    {groupsList.map(item => {
                      return (
                        <Option
                          label={item.executorName}
                          value={item.executorId}
                          key={item.executorId}
                        >
                          {item.executorName}
                        </Option>
                      );
                    })}
                  </Select>
                )}
              </FormItem>
              <FormItem
                {...formLayout}
                label={intl.get('hsdr.jobInfo.model.jobInfo.glueType').d('任务类型')}
              >
                {getFieldDecorator('glueType', {
                  initialValue: glueType,
                  rules: [
                    {
                      type: 'string',
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hsdr.jobInfo.model.jobInfo.glueType').d('任务类型'),
                      }),
                    },
                  ],
                })(
                  <Select style={{ width: '100%' }}>
                    {glueTypeList.map(item => {
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
                  rules: [
                    {
                      required: form.getFieldValue('glueType') === 'SIMPLE',
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('hsdr.jobInfo.model.jobInfo.executorHandler')
                          .d('JobHandler'),
                      }),
                    },
                  ],
                  initialValue: jobHandler,
                })(<Input />)}
              </FormItem>
              <FormItem
                {...formLayout}
                label={intl.get('hsdr.jobInfo.model.jobInfo.executorParam').d('任务参数')}
              >
                {getFieldDecorator('jobParam', {
                  initialValue: jobParam,
                  rules: [
                    {
                      validator: (rule, value, callback) => {
                        if (!value || this.isJson(value)) {
                          callback();
                        } else {
                          callback(
                            intl
                              .get('hsdr.jobInfo.view.validate.additionalInformation')
                              .d('请输入正确的json字符串')
                          );
                        }
                      },
                    },
                  ],
                })(<Input inputChinese={false} />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...formLayout}
                label={intl.get('hsdr.jobInfo.model.jobInfo.jobDesc').d('任务描述')}
              >
                {getFieldDecorator('description', {
                  initialValue: description,
                  // rules: [
                  //   {
                  //     type: 'string',
                  //     required: true,
                  //     message: intl.get('hzero.common.validation.notNull', {
                  //       name: intl.get('hsdr.jobInfo.model.jobInfo.jobDesc').d('任务描述'),
                  //     }),
                  //   },
                  // ],
                })(<Input />)}
              </FormItem>
              <FormItem
                {...formLayout}
                label={intl.get('hsdr.jobInfo.model.jobInfo.executorStrategy').d('执行器策略')}
              >
                {getFieldDecorator('executorStrategy', {
                  initialValue: executorStrategy,
                  rules: [
                    {
                      type: 'string',
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('hsdr.jobInfo.model.jobInfo.executorStrategy')
                          .d('执行器策略'),
                      }),
                    },
                  ],
                })(
                  <Select style={{ width: '100%' }}>
                    {executorRouteList.map(item => {
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
                  label={intl.get('hsdr.jobInfo.model.jobInfo.retryNumber').d('重试次数')}
                  {...formLayout}
                >
                  {getFieldDecorator('retryNumber', {
                    initialValue: strategyParam && JSON.parse(strategyParam).retryNumber,
                  })(<InputNumber min={0} step={1} style={{ width: '100%' }} />)}
                </FormItem>
              )}
              <FormItem
                {...formLayout}
                label={intl.get('hsdr.jobInfo.model.jobInfo.jobCron').d('Cron')}
              >
                {getFieldDecorator('jobCron', {
                  initialValue: jobCron,
                  // rules: [
                  //   {
                  //     type: 'string',
                  //     required: true,
                  //     message: intl.get('hzero.common.validation.notNull', {
                  //       name: intl.get('hsdr.jobInfo.model.jobInfo.jobCron').d('Cron'),
                  //     }),
                  //   },
                  // ],
                })(<Input inputChinese={false} />)}
              </FormItem>
              <FormItem
                {...formLayout}
                label={intl.get('hsdr.jobInfo.model.jobInfo.alarmEmail').d('报警邮件')}
              >
                {getFieldDecorator('alarmEmail', {
                  initialValue: alarmEmail,
                  rules: [
                    // {
                    //   type: 'string',
                    //   required: true,
                    //   message: intl.get('hzero.common.validation.notNull', {
                    //     name: intl.get('hsdr.jobInfo.model.jobInfo.alarmEmail').d('报警邮件'),
                    //   }),
                    // },
                    {
                      pattern: EMAIL,
                      message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                    },
                  ],
                })(<Input />)}
              </FormItem>
              <FormItem
                label={intl.get('hsdr.jobInfo.model.jobInfo.startDate').d('有效时间从')}
                {...formLayout}
              >
                {getFieldDecorator('startDate', {
                  initialValue:
                    initData.startDate && moment(initData.startDate, `${dateFormat} HH:mm:ss`),
                })(
                  <DatePicker
                    style={{ width: '100%' }}
                    showTime
                    format={`${dateFormat} HH:mm:ss`}
                    placeholder=""
                    disabledDate={currentDate =>
                      form.getFieldValue('endDate') &&
                      moment(form.getFieldValue('endDate')).isBefore(currentDate, 'day')
                    }
                  />
                )}
              </FormItem>
              <FormItem
                label={intl.get('hsdr.jobInfo.model.jobInfo.endDate').d('有效时间至')}
                {...formLayout}
              >
                {getFieldDecorator('endDate', {
                  initialValue:
                    initData.endDate && moment(initData.endDate, `${dateFormat} HH:mm:ss`),
                })(
                  <DatePicker
                    style={{ width: '100%' }}
                    showTime
                    format={`${dateFormat} HH:mm:ss`}
                    placeholder=""
                    disabledDate={currentDate =>
                      form.getFieldValue('startDate') &&
                      moment(form.getFieldValue('startDate')).isAfter(currentDate, 'day')
                    }
                  />
                )}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}
