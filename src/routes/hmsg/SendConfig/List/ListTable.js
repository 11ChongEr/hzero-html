import React, { PureComponent } from 'react';
import { Table, Popconfirm, Tag } from 'hzero-ui';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { enableRender } from 'utils/renderer';
import { tableScrollWidth } from 'utils/utils';

/**
 * 发送配置数据展示列表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 分页查询
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
   * 发送
   *
   * @memberof ListTable
   */
  sendOption(record) {
    this.props.onOpenSendModal(record);
  }

  /**
   * 渲染启用服务
   * @param {*} item
   */
  typeMeaningRender(item) {
    let mean = '';
    switch (item.typeCode) {
      case 'WEB':
        mean = (
          <Tag color="green" key="1">
            {item.typeMeaning}
          </Tag>
        );
        break;
      case 'EMAIL':
        mean = (
          <Tag color="orange" key="2">
            {item.typeMeaning}
          </Tag>
        );
        break;
      case 'SMS':
        mean = (
          <Tag color="blue" key="3">
            {item.typeMeaning}
          </Tag>
        );
        break;
      default:
        mean = (
          <Tag color="#dcdcdc" key="4">
            {item}
          </Tag>
        );
        break;
    }
    return mean;
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { loading, dataSource, pagination, onChange, tenantRoleLevel } = this.props;
    const columns = [
      {
        title: intl.get('entity.tenant.tag').d('租户'),
        dataIndex: 'tenantName',
        width: 150,
      },
      {
        title: intl.get('hmsg.sendConfig.model.sendConfig.messageCode').d('消息代码'),
        dataIndex: 'messageCode',
        width: 200,
      },
      {
        title: intl.get('hmsg.sendConfig.model.sendConfig.messageName').d('消息名称'),
        dataIndex: 'messageName',
      },
      {
        title: intl.get('hmsg.sendConfig.model.sendConfig.typeMeaning').d('启用服务'),
        dataIndex: 'typeMeaning',
        width: 200,
        render: (val, record) => {
          let types = [];
          if (!isEmpty(record.serverList)) {
            types = record.serverList.map(item => {
              return {
                typeCode: item.typeCode,
                typeMeaning: item.typeMeaning,
              };
            });
          }
          return (
            <span>
              {types &&
                types.map(item => {
                  return this.typeMeaningRender(item);
                })}
            </span>
          );
        },
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        width: 100,
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 200,
        render: (val, record) => (
          <span className="action-link">
            <a onClick={() => this.editOption(record)}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
            <Popconfirm
              placement="topRight"
              title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录')}
              onConfirm={() => this.deleteOption(record)}
            >
              <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
            </Popconfirm>
            {record.enabledFlag && record.serverList && record.serverList.length !== 0 ? (
              <a onClick={() => this.sendOption(record)}>
                {intl.get('hwfl.sendConfig.view.title.testSend').d('测试发送')}
              </a>
            ) : (
              ''
            )}
          </span>
        ),
      },
    ].filter(col => {
      return tenantRoleLevel ? col.dataIndex !== 'tenantName' : true;
    });
    return (
      <Table
        bordered
        rowKey="tempServerId"
        loading={loading}
        columns={columns}
        scroll={{ x: tableScrollWidth(columns) }}
        dataSource={dataSource}
        pagination={pagination}
        onChange={page => onChange(page)}
      />
    );
  }
}
