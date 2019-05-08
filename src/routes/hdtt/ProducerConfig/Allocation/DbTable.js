/**
 * DbTable - 分发DB表
 * @date: 2018-8-4
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { withRouter } from 'dva/router';
import { Form, InputNumber } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import Checkbox from 'components/Checkbox';
import EditTable from 'components/EditTable';

import { enableRender } from 'utils/renderer';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';

const FormItem = Form.Item;
const promptCode = 'hdtt.producerConfig';
/**
 * 分发DB表
 * @extends {Component} - PureComponent
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} producerConfig - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
// @Form.create({ fieldNameProp: null })
@withRouter
export default class DbTable extends PureComponent {
  /**
   * 编辑
   * @param {*} record 表格行数据
   */
  @Bind()
  editRow(record) {
    this.props.editRow(record);
  }

  /**
   * 取消编辑
   * @param {*} record 表格行数据
   */
  @Bind()
  handleCancel(record) {
    this.props.handleCancel(record);
  }

  render() {
    const { loading, dataSource, onChange, pagination } = this.props;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.producerConfig.consServiceName`).d('分发服务'),
        dataIndex: 'consServiceName',
        width: 200,
      },
      {
        title: intl.get(`${promptCode}.model.producerConfig.consDbCode`).d('分发DB'),
        dataIndex: 'consDbCode',
      },
      {
        title: intl.get(`${promptCode}.model.producerConfig.consTableName`).d('分发表名'),
        dataIndex: 'consTableName',
      },
      {
        title: intl.get(`${promptCode}.model.producerConfig.consumerOffset`).d('初始偏移数'),
        dataIndex: 'consumerOffset',
        render: (text, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('consumerOffset', {
                  initialValue: record.consumerOffset,
                })(<InputNumber precision={0} />)}
              </FormItem>
            );
          } else {
            return text;
          }
        },
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 100,
        dataIndex: 'enabledFlag',
        render: (text, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('enabledFlag', {
                  initialValue: record.enabledFlag,
                })(<Checkbox />)}
              </FormItem>
            );
          } else {
            return enableRender(text);
          }
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 85,
        key: 'edit',
        render: (text, record) => (
          <span className="action-link">
            {record._status === 'update' ? (
              <a onClick={() => this.handleCancel(record)}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            ) : (
              <a onClick={() => this.editRow(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            )}
          </span>
        ),
      },
    ];
    return (
      <React.Fragment>
        <EditTable
          bordered
          rowKey="consDbConfigId"
          // className={classnames(styles.table)}
          loading={loading}
          dataSource={dataSource}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          pagination={pagination}
          onChange={onChange}
        />
      </React.Fragment>
    );
  }
}
