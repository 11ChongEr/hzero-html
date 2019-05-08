import React, { PureComponent, Fragment } from 'react';
import { Table, Popconfirm } from 'hzero-ui';

import intl from 'utils/intl';
import { valueMapMeaning } from 'utils/renderer';

/**
 * 发送配置数据展示列表
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
  /**
   * 编辑
   * @param {object} record - 数据对象
   */
  editOption(record) {
    this.props.onEdit(record);
  }

  /**
   * 删除
   * @param {object} record - 数据对象
   */
  deleteOption(record) {
    this.props.onDelete(record);
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { loading, dataSource = [], messageType } = this.props;
    const columns = [
      {
        title: intl.get('hmsg.sendConfig.model.sendConfig.templateCode').d('模板代码'),
        dataIndex: 'templateCode',
        width: 220,
      },
      {
        title: intl.get('hmsg.sendConfig.model.sendConfig.templateName').d('模板名称'),
        dataIndex: 'templateName',
        width: 150,
      },
      {
        title: intl.get('hmsg.sendConfig.model.sendConfig.typeCode').d('消息类型'),
        dataIndex: 'typeCode',
        width: 120,
        render: val => val && valueMapMeaning(messageType, val),
      },
      {
        title: intl.get('hmsg.sendConfig.model.sendConfig.serverId').d('服务代码'),
        dataIndex: 'serverCode',
        width: 200,
      },
      {
        title: intl.get('hmsg.sendConfig.model.sendConfig.serverName').d('服务名称'),
        dataIndex: 'serverName',
        width: 120,
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'option',
        width: 100,
        align: 'center',
        render: (val, record) => (
          <span className="action-link">
            <a onClick={() => this.editOption(record)}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
            <Popconfirm
              placement="topRight"
              title={intl.get('message.confirm.delete').d('是否删除此条记录')}
              onConfirm={() => this.deleteOption(record)}
            >
              <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
            </Popconfirm>
          </span>
        ),
      },
    ];
    return (
      <Fragment>
        <Table
          bordered
          rowKey="tempServerLineId"
          loading={loading}
          columns={columns}
          dataSource={dataSource}
          pagination={false}
        />
      </Fragment>
    );
  }
}
