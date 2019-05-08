import React, { PureComponent } from 'react';
import { Table, Popconfirm } from 'hzero-ui';
import { includes } from 'lodash';

import intl from 'utils/intl';
import { getAccessToken, tableScrollWidth } from 'utils/utils';
import { valueMapMeaning } from 'utils/renderer';
import { API_HOST, BPM_HOST } from 'utils/config';

import { downloadFile } from '../../../services/api';

/**
 * 流程定义数据列表
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
   * @param {object} record - 流程对象
   */
  editOption(record) {
    this.props.onEdit(record);
  }

  /**
   * 删除
   * @param {object} record - 流程对象
   */
  deleteOption(record) {
    this.props.onDelete(record);
  }

  /**
   * 部署记录
   * @param {object} record - 流程对象
   */
  deployOption(record) {
    this.props.onDeploy(record);
  }

  /**
   * 发布
   * @param {object} record - 流程对象
   */
  releaseOption(record) {
    this.props.onRelease(record);
  }

  /**
   * 下载
   * @param {object} record - 流程对象
   */
  exportOption(record) {
    const api = `${API_HOST}/hwfl/v1/${record.tenantId}/process/models/${record.id}/export`;
    downloadFile({ requestUrl: api, queryParams: [{ name: 'type', value: 'bpmn20' }] });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { processList, dataSource, pagination, processing, onChange, category } = this.props;

    const columns = [
      {
        title: intl.get('hwfl.common.model.process.class').d('流程分类'),
        dataIndex: 'category',
        width: 150,
        render: val => val && valueMapMeaning(category, val),
      },
      {
        title: intl.get('hwfl.common.model.process.code').d('流程编码'),
        dataIndex: 'key',
        width: 200,
      },
      {
        title: intl.get('hwfl.common.model.process.name').d('流程名称'),
        dataIndex: 'name',
      },
      {
        title: intl.get('hwfl.processDefine.model.process.updateTime').d('修改时间'),
        dataIndex: 'lastUpdateTime',
        width: 150,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 270,
        render: (val, record) => (
          <span className="action-link">
            <a
              href={`${BPM_HOST}/editor/index.html?modelId=${record.id}&tenant_id=${
                record.tenantId
              }&access_token=${getAccessToken()}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
            <a onClick={() => this.deployOption(record)}>
              {intl.get('hzero.common.button.deploy').d('部署记录')}
            </a>
            {record.deploymentId && (
              <a onClick={() => this.exportOption(record)}>
                {intl.get('hzero.common.button.download').d('下载')}
              </a>
            )}
            {processing.release && includes(processList, record.id) ? null : (
              <a onClick={() => this.releaseOption(record)}>
                {record.deploymentId
                  ? intl.get('hzero.common.button.republish').d('重新发布')
                  : intl.get('hzero.common.button.release').d('发布')}
              </a>
            )}
            <Popconfirm
              placement="topRight"
              title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录')}
              onConfirm={() => this.deleteOption(record)}
            >
              <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
            </Popconfirm>
          </span>
        ),
      },
    ];
    return (
      <Table
        bordered
        rowKey="id"
        loading={processing.list}
        dataSource={dataSource}
        pagination={pagination}
        onChange={onChange}
        columns={columns}
        scroll={{ x: tableScrollWidth(columns) }}
      />
    );
  }
}
