import React from 'react';
import { Table, Icon } from 'hzero-ui';
import moment from 'moment';
import { Bind } from 'lodash-decorators';

import { getDateFormat, tableScrollWidth } from 'utils/utils';

import ExpandRow from './ExpandRow';

export default class SagaTable extends React.Component {
  @Bind()
  handleShowDetail(record) {
    const { showDetail = e => e } = this.props;
    showDetail(record);
  }

  render() {
    const { loading, dataSource, onChange, pagination } = this.props;
    const columns = [
      {
        title: '状态',
        dataIndex: 'status',
        width: 150,
        render: val => {
          let statusText = '';
          let iconType = {};
          switch (val) {
            case 'FAILED':
              statusText = '失败';
              iconType = {
                type: 'close-circle-o',
                style: { color: '#f44336', marginRight: 4 },
              };
              break;
            case 'COMPLETED':
              statusText = '完成';
              iconType = {
                type: 'check-circle-o',
                style: { color: '#00bfa5', marginRight: 4 },
              };
              break;
            case 'RUNNING':
              statusText = '运行中';
              iconType = {
                type: 'dashboard',
                style: { color: '#4d90fe', marginRight: 4 },
              };
              break;
            case 'NON_CONSUMER':
              statusText = '未消费';
              iconType = {
                type: 'close-circle-o',
                style: { color: '#f44336', marginRight: 4 },
              };
              break;
            // case 'QUEUE':
            //   statusText = '队列中';
            //   iconType = {
            //     type: 'clock-circle-o',
            //     style: { background: 'yellow' },
            //   };
            //   break;
            default:
              break;
          }
          return (
            <div>
              <Icon {...iconType} />
              {statusText}
            </div>
          );
        },
      },
      {
        title: '事务实例',
        dataIndex: 'sagaCode',
      },
      {
        title: '开始时间',
        dataIndex: 'startTime',
        width: 120,
        render: text => {
          return <span>{moment(text).format(getDateFormat())}</span>;
        },
      },
      {
        title: '关联业务类型',
        dataIndex: 'refType',
        width: 200,
      },
      {
        title: '关联业务ID',
        dataIndex: 'refId',
        width: 200,
      },
      {
        title: '操作',
        width: 90,
        render: (text, record) => {
          return <a onClick={() => this.handleShowDetail(record)}>运行详情</a>;
        },
      },
    ];
    return (
      <Table
        bordered
        rowKey="id"
        loading={loading}
        dataSource={dataSource}
        columns={columns}
        scroll={{ x: tableScrollWidth(columns) }}
        expandedRowRender={record => <ExpandRow record={record} />}
        onChange={onChange}
        pagination={pagination}
      />
    );
  }
}
