import React, { PureComponent, Fragment } from 'react';
import { Table, Form, Input } from 'hzero-ui';
import classNames from 'classnames';

import Lov from 'components/Lov';

import { statusRender } from 'utils/renderer';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';

import style from './index.less';

/**
 * 数据初始化-租户处理-数据列表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onChange - 分页查询
 * @reactProps {Boolean} loading - 数据加载完成标记
 * @reactProps {Array} dataSource - Table数据源
 * @reactProps {Object} pagination - 分页器
 * @reactProps {Number} pagination.current - 当前页码
 * @reactProps {Number} pagination.pageSize - 分页大小
 * @reactProps {Number} pagination.total - 数据总量
 * @return React.element
 */
export default class TenantTable extends PureComponent {
  /**
   * 清除新增行
   * @param {object} record - 行数据对象
   */
  cleanLine(record) {
    this.props.onClean(record);
  }

  /**
   * 变更行数据分发服务
   * @param {object} values - 请求获取的信息
   * @param {object} record - 行数据
   */
  changeConsumerService(values, record) {
    const { form } = this.props;
    form.setFieldsValue({
      [`consumerService#${record.tenantProcessId}`]: values.name,
      [`tenantId#${record.tenantProcessId}`]: undefined,
    });
    form.resetFields([`dbCode#${record.tenantProcessId}`]);
  }

  /**
   * 变更行数据分发租户
   * @param {object} values - 请求获取的信息
   * @param {object} record - 行数据
   */
  changeTenantName(values, record) {
    const { form } = this.props;

    form.setFieldsValue({
      [`tenantName#${record.tenantProcessId}`]: values.name,
      [`dbCode#${record.tenantProcessId}`]: values.dbCode,
      [`tenantId#${record.tenantProcessId}`]: values.tenantId,
    });
  }

  /**
   * 变更行数据编辑状态
   * @param {object} record - 行数据
   * @param {boolean} flag - 编辑标记
   */
  changeOption(record, flag) {
    this.props.onEdit({ ...record, editable: flag });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      loading,
      dataSource,
      pagination,
      onChange,
      rowSelection,
      form,
      processStatus,
    } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const columns = [
      {
        title: intl.get('hdtt.initProcess.model.initProcess.consumerService').d('分发服务'),
        dataIndex: 'consumerService',
        width: 250,
        render: (val, record) =>
          record.editable ? (
            <Form.Item>
              {getFieldDecorator(`consumerService#${record.tenantProcessId}`, {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hdtt.initProcess.model.initProcess.consumerService')
                        .d('分发服务'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="HDTT.SERVICE"
                  textValue={getFieldValue(`consumerService#${record.tenantProcessId}`)}
                  onChange={(value, item) => {
                    this.changeConsumerService(item, record);
                  }}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hdtt.initProcess.model.initProcess.tenantName').d('分发租户'),
        dataIndex: 'tenantId',
        width: 250,
        render: (val, record) =>
          record.editable ? (
            <Form.Item>
              {getFieldDecorator(`tenantId#${record.tenantProcessId}`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hdtt.initProcess.model.initProcess.tenantName').d('分发租户'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="HDTT.INIT_TENANT_TENANT"
                  textValue={record.tenantName}
                  queryParams={{
                    serviceName: getFieldValue(`consumerService#${record.tenantProcessId}`),
                  }}
                  disabled={getFieldValue(`consumerService#${record.tenantProcessId}`) === ''}
                  // onChange={(value, item) => {
                  //   this.changeTenantName(item, record);
                  // }}
                />
              )}
            </Form.Item>
          ) : (
            <span>{record.tenantName}</span>
          ),
      },
      {
        title: intl.get('hdtt.initProcess.model.initProcess.cousumerDb').d('分发DB'),
        dataIndex: 'dbCode',
        width: 150,
        render: (val, record) =>
          record.editable ? (
            <div>
              <Form.Item>
                {getFieldDecorator(`dbCode#${record.tenantProcessId}`, {
                  initialValue: val,
                })(<Input disabled />)}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {getFieldDecorator(`tenantId#${record.tenantProcessId}`, {
                  initialValue: record.tenantId,
                })(<Input disabled />)}
              </Form.Item>
            </div>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hdtt.initProcess.model.initProcess.processDate').d('处理日期'),
        dataIndex: 'processDate',
        width: 150,
      },
      {
        title: intl.get('hdtt.initProcess.model.initProcess.processStatus').d('处理状态'),
        dataIndex: 'processStatus',
        width: 150,
        render: (val, record) => <span>{statusRender(val, record.processStatusMeaning)}</span>,
      },
      {
        title: intl.get('hdtt.initProcess.model.initProcess.processMsg').d('处理消息'),
        dataIndex: 'processMsg',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        key: 'operator',
        width: 100,
        render: (val, record) => (
          <span className="action-link">
            {processStatus === 'PENDING' &&
              (record.isNew ? (
                <a onClick={() => this.cleanLine(record)}>
                  {intl.get('hzero.common.button.clean').d('清除')}
                </a>
              ) : record.editable ? (
                <a onClick={() => this.changeOption(record, false)}>
                  {intl.get('hzero.common.button.cancel').d('取消')}
                </a>
              ) : (
                <a onClick={() => this.changeOption(record, true)}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              ))}
          </span>
        ),
      },
    ];
    return (
      <Fragment>
        <Table
          bordered
          rowKey="tenantProcessId"
          className={classNames(style['hdtt-tenant-list'])}
          loading={loading}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          dataSource={dataSource}
          pagination={pagination}
          onChange={onChange}
          rowSelection={rowSelection}
        />
      </Fragment>
    );
  }
}
