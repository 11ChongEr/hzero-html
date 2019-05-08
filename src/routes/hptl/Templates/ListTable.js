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
  editModal(record) {
    const { onGetRecord } = this.props;
    onGetRecord(record);
  }

  render() {
    const { templateData = {}, loading, pagination, onChange } = this.props;
    const columns = [
      {
        title: intl.get('hmsg.portalTemplate.model.portalTemplate.templateCode').d('模板代码'),
        dataIndex: 'templateCode',
        width: 150,
      },
      {
        title: intl.get('hmsg.portalTemplate.model.portalTemplate.templateName').d('模板名称'),
        dataIndex: 'templateName',
        width: 150,
      },
      {
        title: intl.get('hmsg.portalTemplate.model.portalTemplate.templateAvatar').d('模板缩略图'),
        dataIndex: 'templateAvatar',
        width: 300,
        render: (val, record) => (
          <a href={val} target="_blank" rel="noopener noreferrer">
            {record.imageName}
          </a>
        ),
      },
      {
        title: intl.get('hmsg.portalTemplate.model.portalTemplate.templatePath').d('模板路径'),
        dataIndex: 'templatePath',
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        width: 100,
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 85,
        key: 'error',
        render: (val, record) => (
          <a
            onClick={() => {
              this.editModal(record);
            }}
          >
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
        ),
      },
    ];
    return (
      <Table
        bordered
        columns={columns}
        scroll={{ x: tableScrollWidth(columns) }}
        rowKey="templateId"
        dataSource={templateData.content || []}
        pagination={pagination}
        loading={loading}
        onChange={page => onChange(page)}
      />
    );
  }
}
