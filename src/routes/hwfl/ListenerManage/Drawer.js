import React, { PureComponent } from 'react';
import { Modal, Form, Input, Select, Table } from 'hzero-ui';
import { isEmpty, isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';

import Switch from 'components/Switch';
import Lov from 'components/Lov';

import intl from 'utils/intl';
import { valueMapMeaning } from 'utils/renderer';
import { tableScrollWidth } from 'utils/utils';

const FormItem = Form.Item;
const { Option } = Select;

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

/**
 * 新建或编辑模态框数据展示
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onAdd - 添加确定的回调函数
 * @reactProps {Function} onEdit - 编辑确定的回调函数
 * @reactProps {Object} tableRecord - 表格中信息的一条记录
 * @reactProps {Boolean} isCreate - 是否为新建账户
 * @reactProps {String} anchor - 模态框弹出方向
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class Drawer extends PureComponent {
  @Bind()
  onOk() {
    const { form, onAdd, isCreate, tableRecord, onEdit, parameter } = this.props;
    const { listenerId, objectVersionNumber } = tableRecord;
    form.validateFields((err, values) => {
      const newParameter = parameter.map(item => {
        return {
          parameterId: item.parameterId,
          name: isCreate ? item.parameterName : item.name,
          type: isCreate ? item.parameterType : item.type,
          value: form.getFieldValue(`value#${item.parameterId}`),
        };
      });
      if (isEmpty(err)) {
        if (isCreate) {
          onAdd({ ...values, serviceParams: JSON.stringify(newParameter) });
        } else {
          onEdit({
            listenerId,
            objectVersionNumber,
            ...values,
            serviceParams: JSON.stringify(newParameter),
          });
        }
      }
    });
  }

  /**
   * 检验编码唯一性
   * @param {*} rule
   * @param {*} value
   * @param {*} callback
   * @memberof Drawer
   */
  @Bind()
  checkUniqueCode(rule, value, callback) {
    const {
      onCheck,
      form: { getFieldValue },
    } = this.props;
    const codeValue = getFieldValue('code');
    onCheck(rule, value, callback, codeValue);
  }

  @Bind()
  handleTypeChange(value) {
    const { form, onSearchEvent } = this.props;
    if (onSearchEvent) {
      onSearchEvent(value);
    }
    form.setFieldsValue({
      event: undefined,
    });
  }

  /**
   * 流程分类改变
   *
   * @param {*} value
   * @memberof Drawer
   */
  @Bind()
  changeCategory(value) {
    const { onChangeCategory, form } = this.props;
    onChangeCategory(value);
    form.setFieldsValue({
      serviceCode: undefined,
    });
  }

  /**
   * 任务服务改变
   * @param {*} value
   * @memberof Drawer
   */
  @Bind()
  changeServiceTask(value) {
    const { onChangeServiceTask } = this.props;
    onChangeServiceTask(value);
  }

  render() {
    const {
      tenantId,
      visible,
      onCancel,
      saving,
      anchor,
      tableRecord,
      isCreate,
      eventList,
      TransactionState,
      category,
      // serviceTask,
      parameter,
      variableOptions,
      listenerTypeList,
      parameterType,
      isChangeServiceTask,
    } = this.props;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const columns = [
      {
        title: intl.get('hwfl.common.model.param.type').d('参数类型'),
        dataIndex: isChangeServiceTask ? 'parameterType' : 'type',
        width: 80,
        render: val => valueMapMeaning(parameterType, val),
      },
      {
        title: intl.get('hwfl.common.model.param.name').d('参数名称'),
        dataIndex: isChangeServiceTask ? 'description' : 'name',
        width: 80,
        render: val => <span>{val}</span>,
      },
      {
        title: intl.get('hwfl.common.model.param.value').d('参数值'),
        dataIndex: 'value',
        width: 100,
        render: (val, record) =>
          record.parameterType === 'variable' || record.type === 'variable' ? (
            <FormItem>
              {getFieldDecorator(`value#${record.parameterId}`, {
                initialValue: record.value,
              })(
                <Select allowClear style={{ width: '100%' }}>
                  {variableOptions &&
                    variableOptions.map(item => (
                      <Option value={item.code} key={item.code}>
                        {item.description}
                      </Option>
                    ))}
                </Select>
              )}
            </FormItem>
          ) : (
            <FormItem>
              {getFieldDecorator(`value#${record.parameterId}`, {
                initialValue: record.value,
              })(<Input style={{ width: '100%' }} />)}
            </FormItem>
          ),
      },
    ];
    return (
      <Modal
        destroyOnClose
        width={520}
        title={
          isCreate
            ? intl.get('hwfl.listenerManage.view.message.create').d('新建监听器')
            : intl.get('hwfl.listenerManage.view.message.edit').d('编辑监听器')
        }
        visible={visible}
        onCancel={onCancel}
        onOk={this.onOk}
        confirmLoading={saving}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
      >
        <Form>
          <FormItem
            label={intl.get('hwfl.listenerManage.model.listenerManage.type').d('监听器类型')}
            {...formLayout}
          >
            {getFieldDecorator('type', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfl.listenerManage.model.listenerManage.type').d('监听器类型'),
                  }),
                },
              ],
              initialValue: tableRecord.type,
            })(
              <Select disabled={!isCreate} onChange={this.handleTypeChange}>
                {listenerTypeList &&
                  listenerTypeList.map(item => (
                    <Option value={item.value} key={item.value}>
                      {item.meaning}
                    </Option>
                  ))}
              </Select>
            )}
          </FormItem>
          <FormItem
            label={intl.get('hwfl.listenerManage.model.listenerManage.code').d('监听器编码')}
            {...formLayout}
          >
            {getFieldDecorator('code', {
              validateTrigger: 'onBlur',
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfl.listenerManage.model.listenerManage.code').d('监听器编码'),
                  }),
                },
                {
                  validator: isCreate ? this.checkUniqueCode : '',
                },
              ],
              initialValue: tableRecord ? tableRecord.code : '',
            })(<Input typeCase="upper" trim inputChinese={false} disabled={!isCreate} />)}
          </FormItem>
          <FormItem
            label={intl.get('hwfl.listenerManage.model.listenerManage.name').d('监听器名称')}
            {...formLayout}
          >
            {getFieldDecorator('name', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfl.listenerManage.model.listenerManage.name').d('监听器名称'),
                  }),
                },
              ],
              initialValue: tableRecord.name ? tableRecord.name : '',
            })(<Input />)}
          </FormItem>
          <FormItem
            label={intl.get('hwfl.listenerManage.model.listenerManage.event').d('监听事件')}
            {...formLayout}
          >
            {getFieldDecorator('event', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfl.listenerManage.model.listenerManage.event').d('监听事件'),
                  }),
                },
              ],
              initialValue: tableRecord.event ? tableRecord.event : '',
            })(
              <Select>
                {eventList &&
                  eventList.map(item => (
                    <Option value={item.value} key={item.value}>
                      {item.meaning}
                    </Option>
                  ))}
              </Select>
            )}
          </FormItem>
          <FormItem
            label={intl.get('hwfl.common.model.process.class').d('流程分类')}
            {...formLayout}
          >
            {getFieldDecorator('category', {
              // rules: [
              //   {
              //     required: true,
              //     message: intl.get('hzero.common.validation.notNull', {
              //       name: intl.get('hwfl.common.model.process.class').d('流程分类'),
              //     }),
              //   },
              // ],
              initialValue: tableRecord.category,
            })(
              <Select allowClear onChange={this.changeCategory}>
                {category &&
                  category.map(item => (
                    <Option value={item.value} key={item.value}>
                      {item.meaning}
                    </Option>
                  ))}
              </Select>
            )}
          </FormItem>
          <FormItem
            label={intl.get('hwfl.listenerManage.model.listenerManage.serviceCode').d('服务任务')}
            {...formLayout}
          >
            {getFieldDecorator('serviceCode', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get('hwfl.listenerManage.model.listenerManage.serviceCode')
                      .d('服务任务'),
                  }),
                },
              ],
              initialValue: tableRecord.serviceCode ? tableRecord.serviceCode : '',
            })(
              <Lov
                code="HWFL.EXTERNAL_DEFINITION"
                textValue={tableRecord.serviceName}
                queryParams={{
                  tenantId,
                  type: 'serviceTask',
                  category: getFieldValue('category'),
                }}
                onChange={this.changeServiceTask}
              />
              // <Select allowClear onChange={this.changeServiceTask}>
              //   {serviceTask &&
              //     serviceTask.map(item => (
              //       <Option value={item.code} key={item.code}>
              //         {item.description}
              //       </Option>
              //     ))}
              // </Select>
            )}
          </FormItem>
          <FormItem
            label={intl
              .get('hwfl.listenerManage.model.listenerManage.transactionFlag')
              .d('依赖事务')}
            {...formLayout}
          >
            {getFieldDecorator('transactionFlag', {
              initialValue: isUndefined(tableRecord.transactionFlag)
                ? 0
                : tableRecord.transactionFlag,
            })(<Switch />)}
          </FormItem>
          {getFieldValue('transactionFlag') === 1 ? (
            <FormItem
              label={intl
                .get('hwfl.listenerManage.model.listenerManage.onTransaction')
                .d('事务状态')}
              {...formLayout}
            >
              {getFieldDecorator('onTransaction', {
                rules: [
                  {
                    required: false,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hwfl.listenerManage.model.listenerManage.onTransaction')
                        .d('事务状态'),
                    }),
                  },
                ],
                initialValue: tableRecord.onTransaction ? tableRecord.onTransaction : '',
              })(
                <Select allowClear>
                  {TransactionState &&
                    TransactionState.map(item => (
                      <Option value={item.value} key={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                </Select>
              )}
            </FormItem>
          ) : (
            ''
          )}
          {parameter.length > 0 ? (
            <Table
              bordered
              pagination={false}
              rowKey="parameterId"
              dataSource={parameter}
              columns={columns}
              scroll={{ x: tableScrollWidth(columns) }}
            />
          ) : (
            ''
          )}
        </Form>
      </Modal>
    );
  }
}
