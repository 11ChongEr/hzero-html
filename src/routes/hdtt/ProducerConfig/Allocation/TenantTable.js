/**
 * TenantTable - 分发租户表
 * @date: 2018-8-4
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table, Form, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';

import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';

// const FormItem = Form.Item;
const promptCode = 'hdtt.producerConfig';
/**
 * 分发租户表
 * @extends {Component} - PureComponent
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} producerConfig - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @return React.element
 */
export default class TenantTable extends PureComponent {
  /**
   * 清除新增行
   * @param {object} record - 行数据对象
   */
  @Bind()
  cleanLine(record) {
    this.props.clean(record);
  }

  /**
   * 变更行数据编辑状态
   * @param {object} record - 行数据
   * @param {boolean} flag - 编辑标记
   */
  @Bind()
  changeOption(record, flag) {
    this.props.edit({ ...record, editable: flag });
  }

  /**
   * 变更行数据分发租户
   * @param {object} values - 请求获取的信息
   * @param {object} record - 行数据
   */
  @Bind()
  changeTenantName(values, record) {
    const { form } = this.props;
    form.setFieldsValue({
      [`consDbCode#${record.consTenantConfigId}`]: values.dbCode,
      // [`tenantName#${record.consTenantConfigId}`]: values.name,
      // [`tenantId#${record.consTenantConfigId}`]: values.tenantId,
    });
  }

  render() {
    const { loading, dataSource, rowSelection, onChange, pagination, form, tableName } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.producerConfig.consServiceName`).d('分发服务'),
        dataIndex: 'consServiceName',
        width: 200,
        render: (val, record) =>
          record.editable ? (
            <Form.Item>
              {getFieldDecorator(`consServiceName#${record.consTenantConfigId}`, {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hdtt.initProcess.model.initProcess.consServiceName')
                        .d('分发服务'),
                    }),
                  },
                ],
              })(<Lov code="HDTT.SERVICE" textValue={val} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.producerConfig.consTenantName`).d('分发租户'),
        dataIndex: 'consTenantName',
        render: (val, record) =>
          record.editable ? (
            <Form.Item>
              {getFieldDecorator(`tenantId#${record.consTenantConfigId}`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${promptCode}.model.producerConfig.consTenantName`)
                        .d('分发租户'),
                    }),
                  },
                ],
                initialValue: record.tenantId,
              })(
                <Lov
                  code="HDTT.INIT_TENANT_TENANT"
                  textValue={val}
                  queryParams={{
                    serviceName: getFieldValue(`consServiceName#${record.consTenantConfigId}`),
                  }}
                  disabled={!getFieldValue(`consServiceName#${record.consTenantConfigId}`)}
                  onChange={(value, item) => {
                    this.changeTenantName(item, record);
                  }}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.producerConfig.consDbCode`).d('分发DB'),
        dataIndex: 'consDbCode',
        render: (val, record) =>
          record.editable ? (
            <Form.Item>
              {getFieldDecorator(`consDbCode#${record.consTenantConfigId}`, {
                initialValue: val,
              })(<Input disabled />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.producerConfig.consTableName`).d('分发表名'),
        dataIndex: 'consTableName',
        render: (val, record) =>
          record.editable ? (
            <Form.Item>
              {getFieldDecorator(`consTableName#${record.consTenantConfigId}`, {
                initialValue: tableName,
              })(<Input disabled />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        key: 'operator',
        width: 100,
        render: (val, record) =>
          record.isNew ? (
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
          ),
      },
    ];
    return (
      <React.Fragment>
        <Table
          bordered
          rowKey="consTenantConfigId"
          loading={loading}
          dataSource={dataSource}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          rowSelection={rowSelection}
          pagination={pagination}
          onChange={onChange}
        />
      </React.Fragment>
    );
  }
}
