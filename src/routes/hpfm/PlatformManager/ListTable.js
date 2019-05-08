import React, { PureComponent } from 'react';
import { Table } from 'hzero-ui';
import intl from 'utils/intl';

export default class ListTable extends PureComponent {
  render() {
    const prefix = 'hpfm.login.audit.model';
    const { loading, dataSource, pagination, onChange } = this.props;
    const columns = [
      {
        title: '',
        width: 50,
        align: 'center',
        dataIndex: 'order',
      },
      {
        title: intl.get(`${prefix}.account`).d('账号'),
        width: 200,
        align: 'center',
        dataIndex: 'loginName',
      },
      {
        title: intl.get(`${prefix}.name`).d('名称'),
        width: 200,
        align: 'center',
        dataIndex: 'userName',
      },
      {
        title: intl.get(`${prefix}.phone`).d('手机号'),
        width: 200,
        align: 'center',
        dataIndex: 'phone',
      },
      {
        title: intl.get(`${prefix}.tenant`).d('所属租户'),
        width: 200,
        align: 'center',
        dataIndex: 'tenantName',
      },
      {
        title: intl.get(`${prefix}.login.time`).d('登录时间'),
        width: 200,
        align: 'center',
        dataIndex: 'loginDate',
      },
      {
        title: intl.get(`${prefix}.login.address`).d('登录地址'),
        width: 200,
        align: 'center',
        dataIndex: 'loginIp',
      },
      {
        title: intl.get(`${prefix}.login.platform`).d('登录平台'),
        width: 200,
        align: 'center',
        dataIndex: 'loginPlatform',
      },
      {
        title: intl.get(`${prefix}.login.device`).d('登录设备'),
        width: 200,
        align: 'center',
        dataIndex: 'loginDevice',
      },
    ];

    return (
      <Table
        bordered
        rowKey="order"
        loading={loading}
        columns={columns}
        dataSource={dataSource.map((item, index) => ({ ...item, order: index + 1 }))}
        pagination={pagination}
        onChange={page => onChange(page)}
      />
    );
  }
}
