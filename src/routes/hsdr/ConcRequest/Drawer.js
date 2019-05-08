import React from 'react';
import { Form, Row, Col, Select, InputNumber, DatePicker, Input, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';

import Switch from 'components/Switch';
import Checkbox from 'components/Checkbox';
import Lov from 'components/Lov';
import ValueList from 'components/ValueList';

import intl from 'utils/intl';
import moment from 'moment';
import { getDateFormat } from 'utils/utils';

const { Option } = Select;
const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
const dateFormat = getDateFormat();
@Form.create({ fieldNameProp: null })
export default class Drawer extends React.PureComponent {
  constructor(props) {
    super(props);
    this.requestParamNameMap = new Map();
  }

  componentWillUnmount() {
    this.requestParamNameMap = null;
  }

  getCurrentComponent(item) {
    let component;
    switch (item.paramEditTypeCode) {
      case 'LOV': // Lov
        component = <Lov code={item.businessModel} />;
        break;
      case 'INPUT': // 文本
        component = <Input />;
        break;
      case 'CHECKBOX': // 勾选框
        component = <Checkbox />;
        break;
      case 'COMBOBOX': // 下拉框
        component = <ValueList style={{ width: '100%' }} lovCode={item.businessModel} />;
        break;
      case 'DATAPICKER': // 日期选择框
        component = (
          <DatePicker style={{ width: '100%' }} placeholder="" format={`${dateFormat} HH:mm:ss`} />
        );
        break;
      case 'INPUTNUMBER': // 数字框
        component = (
          <InputNumber
            style={{ width: '100%' }}
            min={item.ValueFieldFrom}
            max={item.valueFieldTo}
          />
        );
        break;
      default:
        component = <Input />;
        break;
    }
    return component;
  }

  // 渲染参数组件
  @Bind()
  renderParamGroup(paramList) {
    const { getFieldDecorator } = this.props.form;
    this.requestParamNameMap = new Map();
    return (
      paramList &&
      paramList.map(item => {
        const itemStyle = {};
        this.requestParamNameMap.set(item.paramCode, true);
        if (item.showFlag === 0) {
          itemStyle.display = 'none';
        }
        return (
          <Col span={12} key={item.paramCode} style={itemStyle}>
            <FormItem label={item.paramName} {...formLayout}>
              {getFieldDecorator(`${item.paramCode}`, {
                initialValue: item.paramEditTypeCode === 'CHECKBOX' ? 0 : undefined,
                rules: [
                  {
                    required:
                      item.paramEditTypeCode === 'CHECKBOX' ? false : item.notnullFlag !== 0,
                    message: intl
                      .get('hzero.common.validation.notNull', {
                        name: item.paramName,
                      })
                      .d(`${item.paramName}不能为空`),
                  },
                ],
              })(this.getCurrentComponent(item))}
            </FormItem>
          </Col>
        );
      })
    );
  }

  @Bind()
  handleOk() {
    const { form, onOk } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        onOk(fieldsValue, { requestParamNameMap: this.requestParamNameMap });
      }
    });
  }

  render() {
    const {
      form,
      initData = {},
      intervalTypeList = [],
      changeConcurrent,
      paramList = [],
      tenantId,
      title,
      modalVisible,
      loading,
      onCancel,
      roleId,
      tenantRoleLevel,
    } = this.props;
    const { getFieldDecorator, getFieldValue, setFieldsValue } = form;

    return (
      <Modal
        destroyOnClose
        title={title}
        width={1000}
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        visible={modalVisible}
        confirmLoading={loading}
        onCancel={onCancel}
        onOk={this.handleOk}
      >
        <Row gutter={24}>
          <Row gutter={24}>
            {!tenantRoleLevel && (
              <Col span={12}>
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
                    initialValue: initData.tenantId,
                  })(
                    <Lov
                      textValue={initData.tenantName}
                      code="HPFM.TENANT"
                      allowClear={false}
                      onChange={() => setFieldsValue({ concurrentId: undefined })}
                    />
                  )}
                </Form.Item>
              </Col>
            )}
            <Col span={12}>
              <FormItem
                label={intl.get('hsdr.concRequest.model.concRequest.concName').d('请求名称')}
                {...formLayout}
              >
                {getFieldDecorator('concurrentId', {
                  initialValue: initData.concurrentId,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hsdr.concRequest.model.concRequest.concName').d('请求名称'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    textValue={initData.concName}
                    queryParams={{
                      organizationId: !tenantRoleLevel ? getFieldValue('tenantId') : tenantId,
                      roleId,
                    }}
                    code="HSDR.CONC_REQUEST.CONCURRENT"
                    onChange={changeConcurrent}
                    disabled={!tenantRoleLevel ? isUndefined(getFieldValue('tenantId')) : false}
                    allowClear={false}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Col span={24}>
            <FormItem
              label={intl.get('hsdr.concRequest.model.concRequest.cycleFlag').d('周期性')}
              labelCol={{ span: 3 }}
              wrapperCol={{ span: 20 }}
            >
              {getFieldDecorator('cycleFlag', {
                initialValue: initData.cycleFlag === undefined ? 0 : initData.cycleFlag,
              })(<Switch />)}
            </FormItem>
          </Col>
          {getFieldValue('cycleFlag') && (
            <Col span={12}>
              <Form.Item
                label={intl.get('hsdr.concRequest.model.concRequest.startDate').d('开始时间')}
                {...formLayout}
              >
                {getFieldDecorator('startDate', {
                  initialValue:
                    initData.startDate && moment(initData.startDate, `${dateFormat} HH:mm:ss`),
                })(
                  <DatePicker
                    style={{ width: '100%' }}
                    showTime
                    placeholder=""
                    format={`${dateFormat} HH:mm:ss`}
                    disabledDate={currentDate =>
                      getFieldValue('endDate') &&
                      moment(getFieldValue('endDate')).isBefore(currentDate, 'day')
                    }
                  />
                )}
              </Form.Item>
              <Form.Item
                label={intl.get('hsdr.concRequest.model.concRequest.intervalType').d('间隔类型')}
                {...formLayout}
              >
                {getFieldDecorator('intervalType', {
                  initialValue: initData.intervalType,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('hsdr.concRequest.model.concRequest.intervalType')
                          .d('间隔类型'),
                      }),
                    },
                  ],
                })(
                  <Select style={{ width: '100%' }}>
                    {intervalTypeList.map(item => (
                      <Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
              <Form.Item
                {...formLayout}
                label={intl.get('hsdr.concRequest.model.concRequest.intervalHour').d('固定间隔-时')}
              >
                {getFieldDecorator('intervalHour', {
                  initialValue: initData.intervalHour,
                  rules: [
                    {
                      required:
                        getFieldValue('intervalType') && getFieldValue('intervalType') === 'DAY',
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('hsdr.concRequest.model.concRequest.intervalHour')
                          .d('固定间隔-时'),
                      }),
                    },
                  ],
                })(
                  <InputNumber
                    min={0}
                    step={1}
                    style={{ width: '100%' }}
                    disabled={
                      getFieldValue('intervalType') && getFieldValue('intervalType') !== 'DAY'
                    }
                  />
                )}
              </Form.Item>
              <Form.Item
                {...formLayout}
                label={intl
                  .get('hsdr.concRequest.model.concRequest.intervalSecond')
                  .d('固定间隔-秒')}
              >
                {getFieldDecorator('intervalSecond', {
                  initialValue: initData.intervalSecond,
                  rules: [
                    {
                      required:
                        getFieldValue('intervalType') && getFieldValue('intervalType') !== 'SECOND',
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('hsdr.concRequest.model.concRequest.intervalSecond')
                          .d('固定间隔-秒'),
                      }),
                    },
                  ],
                })(
                  <InputNumber
                    min={0}
                    step={1}
                    max={60}
                    style={{ width: '100%' }}
                    disabled={getFieldValue('intervalType') === 'SECOND'}
                  />
                )}
              </Form.Item>
            </Col>
          )}
          {getFieldValue('cycleFlag') && (
            <Col span={12}>
              <Form.Item
                label={intl.get('hsdr.concRequest.model.concRequest.endDate').d('结束时间')}
                {...formLayout}
              >
                {getFieldDecorator('endDate', {
                  initialValue:
                    initData.endDate && moment(initData.endDate, `${dateFormat} HH:mm:ss`),
                })(
                  <DatePicker
                    style={{ width: '100%' }}
                    showTime
                    placeholder=""
                    format={`${dateFormat} HH:mm:ss`}
                    disabledDate={currentDate =>
                      getFieldValue('startDate') &&
                      moment(getFieldValue('startDate')).isAfter(currentDate, 'day')
                    }
                  />
                )}
              </Form.Item>
              <Form.Item
                {...formLayout}
                label={intl.get('hsdr.concRequest.model.concRequest.intervalNumber').d('间隔大小')}
              >
                {getFieldDecorator('intervalNumber', {
                  initialValue: initData.intervalHour,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('hsdr.concRequest.model.concRequest.intervalNumber')
                          .d('间隔大小'),
                      }),
                    },
                  ],
                })(<InputNumber min={0} step={1} style={{ width: '100%' }} />)}
              </Form.Item>
              <Form.Item
                {...formLayout}
                label={intl
                  .get('hsdr.concRequest.model.concRequest.intervalMinute')
                  .d('固定间隔-分')}
              >
                {getFieldDecorator('intervalMinute', {
                  initialValue: initData.intervalMinute,
                  rules: [
                    {
                      required:
                        getFieldValue('intervalType') === 'DAY' ||
                        getFieldValue('intervalType') === 'HOUR',
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('hsdr.concRequest.model.concRequest.intervalMinute')
                          .d('固定间隔-分'),
                      }),
                    },
                  ],
                })(
                  <InputNumber
                    min={0}
                    step={1}
                    max={60}
                    style={{ width: '100%' }}
                    disabled={
                      getFieldValue('intervalType') === 'MINUTE' ||
                      getFieldValue('intervalType') === 'SECOND'
                    }
                  />
                )}
              </Form.Item>
            </Col>
          )}
          <Col span={24}>
            {paramList.length > 0 && (
              <div>
                <div style={{ fontSize: 13, color: '#898b96', margin: '20px 24px' }}>
                  {intl.get('hsdr.concRequest.view.message.description').d('请求参数')}
                </div>
                {this.renderParamGroup(paramList)}
              </div>
            )}
          </Col>
        </Row>
      </Modal>
    );
  }
}
