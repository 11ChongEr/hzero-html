/*
 * List - 接口监控列表
 * @date: 2018/09/17 15:40:00
 * @author: LZH <zhaohui.liu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Table } from 'hzero-ui';
// import { getDateFormat } from 'utils/utils';
import { dateTimeRender } from 'utils/renderer.js';
import intl from 'utils/intl';
import { isTenantRoleLevel, tableScrollWidth } from 'utils/utils';

const promptCode = 'hitf.interfaceLogs';
const tenantRoleLevel = isTenantRoleLevel();

export default class List extends PureComponent {
  render() {
    const { dataSource, history, pagination, loading, searchPaging } = this.props;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.interfaceLogs.tenant`).d('所属租户'),
        dataIndex: 'tenantName',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.interfaceLogs.applicationCode`).d('应用代码'),
        dataIndex: 'applicationCode',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.interfaceLogs.applicationName`).d('应用名称'),
        dataIndex: 'applicationName',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.interfaceLogs.serverCode`).d('服务代码'),
        dataIndex: 'serverCode',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.interfaceLogs.serverName`).d('服务名称'),
        dataIndex: 'serverName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.interfaceLogs.clientId`).d('客户端ID'),
        dataIndex: 'clientId',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.interfaceLogs.interfaceUrl`).d('接口路径'),
        dataIndex: 'interfaceUrl',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.interfaceLogs.invokeKey`).d('请求ID'),
        dataIndex: 'invokeKey',
      },
      {
        title: intl.get(`${promptCode}.model.interfaceLogs.interfaceRequestTime`).d('请求时间'),
        width: 160,
        dataIndex: 'requestTime',
        render: dateTimeRender,
      },
      {
        title: intl.get(`${promptCode}.model.interfaceLogs.responseStatus`).d('请求状态'),
        dataIndex: 'responseStatus',
        width: 120,
        render: val => {
          // FIXME: 没有国际化
          return val === 'success' ? '成功' : '失败';
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 85,
        fixed: 'right',
        render: (val, record) => (
          <div>
            <a
              onClick={() => {
                history.push(`/hitf/interface-logs/detail/${record.interfaceLogId}`);
              }}
            >
              {intl.get(`${promptCode}.view.message.detail`).d('详情')}
            </a>
          </div>
        ),
      },
    ].filter(col => {
      return tenantRoleLevel ? col.dataIndex !== 'tenantName' : true;
    });
    return (
      <Fragment>
        <Table
          bordered
          rowKey="interfaceLogId"
          loading={loading}
          dataSource={dataSource}
          pagination={pagination}
          onChange={searchPaging}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
        />
      </Fragment>
    );
  }
}
