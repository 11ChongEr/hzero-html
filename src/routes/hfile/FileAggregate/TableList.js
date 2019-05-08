import React, { PureComponent } from 'react';
import { Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { createPagination, isTenantRoleLevel, tableScrollWidth } from 'utils/utils';
import { dateTimeRender } from 'utils/renderer';

export default class TableList extends PureComponent {
  @Bind()
  handleStandardTableChange(pagination) {
    const { formValues, onSearch } = this.props;
    const params = {
      page: pagination.current - 1,
      size: pagination.pageSize,
      ...formValues,
    };
    onSearch(params);
  }

  render() {
    const { fileData, loading } = this.props;
    const columns = [
      {
        title: intl.get('hfile.fileAggregate.model.fileAggregate.tenantId').d('租户'),
        dataIndex: 'tenantId',
        width: 150,
        render: (val, record) => <span>{record.tenantName}</span>,
      },
      {
        title: intl.get('hfile.fileAggregate.model.fileAggregate.bucketName').d('分组'),
        dataIndex: 'bucketName',
        width: 120,
      },
      {
        title: intl.get('hfile.fileAggregate.model.fileAggregate.directory').d('上传目录'),
        dataIndex: 'directory',
        width: 120,
      },
      {
        title: intl.get('hfile.fileAggregate.model.fileAggregate.fileType').d('文件类型'),
        dataIndex: 'fileType',
        width: 200,
      },
      {
        title: intl.get('hfile.fileAggregate.model.fileAggregate.fileName').d('文件名称'),
        dataIndex: 'fileName',
      },
      {
        title: intl.get('hfile.fileAggregate.model.fileAggregate.hrealName').d('上传人'),
        dataIndex: 'realName',
        width: 150,
      },
      {
        title: intl.get('hzero.common.date.creation').d('创建时间'),
        dataIndex: 'creationDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get('hfile.fileAggregate.model.fileAggregate.fileSize').d('文件大小'),
        dataIndex: 'fileSize',
        width: 120,
        render: val => <span>{`${val}B`}</span>,
      },
      {
        title: intl.get('hfile.fileAggregate.model.fileAggregate.attachmentUuid').d('批号'),
        dataIndex: 'attachmentUuid',
        width: 250,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        key: 'option',
        width: 80,
        fixed: 'right',
        render: (val, record) => (
          <span className="action-link">
            {record.fileUrl && (
              <a href={record.fileUrl} target="_blank" rel="noopener noreferrer">
                {intl.get('hzero.common.button.download').d('下载')}
              </a>
            )}
          </span>
        ),
      },
    ].filter(col => {
      return isTenantRoleLevel() ? col.dataIndex !== 'tenantId' : true;
    });
    return (
      <Table
        bordered
        scroll={{ x: tableScrollWidth(columns) }}
        columns={columns}
        rowKey="fileId"
        dataSource={fileData.content || []}
        pagination={createPagination(fileData)}
        loading={loading}
        onChange={this.handleStandardTableChange}
      />
    );
  }
}
