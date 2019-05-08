import React, { Component } from 'react';
import { Table } from 'hzero-ui';
import moment from 'moment';

import intl from 'utils/intl';
import { enableRender } from 'utils/renderer';

// hpfm 国际化前缀
const commonPrompt = 'hpfm.financialCode.view.message';

/**
 * List - 供应商绩效标准指标定义 - 列表组件
 * @extends {Component} - React.Component
 * @reactProps {boolean} [loading=false] - 表格处理状态
 * @reactProps {function} [onChange= (e => e)] - 表格onChange事件
 * @reactProps {object} [pagination={}] - 分页数据
 * @reactProps {Array<Object>} [dataSource=[]] - 表格数据源
 * @return React.element
 */
export default class List extends Component {
  render() {
    const { onChange, dataSource, onEdit, loading } = this.props;
    const typeFilters = [
      {
        text: '法人实体',
        value: 'LEGAL_ENTITY',
      },
      {
        text: '成本中心',
        value: 'COST_CENTER',
      },
      {
        text: '利润中心',
        value: 'PROFIT_CENTER',
      },
      {
        text: '	责任中心',
        value: 'RESP_CENTER',
      },
    ];
    const statusFilters = [
      {
        text: '启用',
        value: 1,
      },
      {
        text: '禁用',
        value: 0,
      },
    ];
    const columns = [
      {
        title: intl.get(`${commonPrompt}.financialCode`).d('代码'),
        dataIndex: 'code',
      },
      {
        title: intl.get(`${commonPrompt}.financialName`).d('名称'),
        dataIndex: 'name',
      },
      {
        title: intl.get(`${commonPrompt}.financialType`).d('类型'),
        dataIndex: 'typeMeaning',
        align: 'center',
        filters: typeFilters,
        onFilter: (value, record) => record.type === value,
      },
      {
        title: intl.get(`${commonPrompt}.financialStatus`).d('状态'),
        dataIndex: 'enabledFlag',
        align: 'center',
        filters: statusFilters,
        onFilter: (value, record) => Number(record.enabledFlag) === Number(value),
        render: enableRender,
      },
      {
        title: intl.get(`${commonPrompt}.financialDes`).d('描述'),
        dataIndex: 'remark',
        sorter: (a, b) => moment(a.financialDes).isBefore(b.financialDes),
        sortDirections: ['descend', 'ascend'],
      },
      {
        title: intl.get(`${commonPrompt}.operate`).d('操作'),
        dataIndex: 'operate',
        align: 'center',
        render: (val, record) => (
          <a onClick={() => onEdit(record)}>{intl.get(`${commonPrompt}.edit`).d('编辑')}</a>
        ),
      },
    ];
    return (
      <Table
        bordered
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        onChange={page => onChange(page)}
        rowKey="codeId"
      />
    );
  }
}
