import React, { PureComponent } from 'react';
import { Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { enableRender } from 'utils/renderer';
import { tableScrollWidth } from 'utils/utils';

/**
 * 短信配置数据展示列表
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

export default class ListTable extends PureComponent {
  // 编辑
  @Bind()
  handleEdit(record) {
    const { onGetRecord } = this.props;
    onGetRecord(record);
  }

  render() {
    const { smsData, loading, pagination, onChange, tenantRoleLevel } = this.props;
    const columns = [
      {
        title: intl.get('hmsg.smsConfig.model.smsConfig.tenant').d('租户'),
        dataIndex: 'tenantName',
        width: 150,
      },
      {
        title: intl.get('hmsg.smsConfig.model.smsConfig.serverCode').d('账户代码'),
        dataIndex: 'serverCode',
        width: 150,
      },
      {
        title: intl.get('hmsg.smsConfig.model.smsConfig.serverName').d('账户名称'),
        dataIndex: 'serverName',
        width: 150,
      },
      {
        title: intl.get('hmsg.smsConfig.model.smsConfig.serverTypeCode').d('服务类型'),
        dataIndex: 'serverTypeMeaning',
        width: 150,
      },
      {
        title: intl.get('hmsg.smsConfig.model.smsConfig.signName').d('短信签名'),
        dataIndex: 'signName',
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        width: 100,
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('编辑'),
        width: 85,
        key: 'error',
        render: (val, record) => (
          <a
            onClick={() => {
              this.handleEdit(record);
            }}
          >
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
        ),
      },
    ].filter(col => {
      return tenantRoleLevel ? col.dataIndex !== 'tenantName' : true;
    });
    return (
      <React.Fragment>
        <Table
          bordered
          rowKey="serverId"
          dataSource={smsData.content || []}
          loading={loading}
          pagination={pagination}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={page => onChange(page)}
        />
      </React.Fragment>
    );
  }
}
