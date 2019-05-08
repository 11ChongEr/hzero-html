/**
 * template - 模板model
 * @since 2019-1-29
 * @author wangjiacheng <jiacheng.wang@hand-china.com>
 * @version 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent, Fragment } from 'react';
import { Table, Popconfirm } from 'hzero-ui';

import { createPagination, isTenantRoleLevel, tableScrollWidth } from 'utils/utils';
import intl from 'utils/intl';
import { enableRender } from 'utils/renderer';
import { HZERO_IMP } from 'utils/config';

import { downloadFile } from '../../../../services/api';

const modelPrompt = 'himp.template.model.template';
const viewMessagePrompt = 'himp.template.view.message';
const commonPrompt = 'hzero.common';

/**
 * 消息模板数据展示列表
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
   * @param {object} record - 消息模板对象
   */
  changeEdit(record) {
    this.props.editContent(record);
  }

  /**
   * 删除
   * @param {object} record - 消息模板对象
   */
  delHeader(record) {
    this.props.delContent(record);
  }

  /**
   * 导出
   * @param {object} record - 消息模板对象
   */
  changeExport(record) {
    const { organizationId } = this.props;
    const requestUrl = `${HZERO_IMP}/v1/${
      isTenantRoleLevel() ? `${organizationId}/` : ''
    }template/${record.templateCode}/excel`;
    if (record) {
      downloadFile({
        requestUrl,
        queryParams: [{ name: 'tenantId', value: record.tenantId }],
      });
    }
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { loading, dataSource, pagination, onChange } = this.props;
    const paginations = {
      ...createPagination(dataSource),
      ...pagination,
    };

    const columns = [
      {
        title: intl.get(`${modelPrompt}.tenantName`).d('租户'),
        dataIndex: 'tenantName',
      },
      {
        title: intl.get(`${modelPrompt}.templateName`).d('模板名称'),
        dataIndex: 'templateName',
      },
      {
        title: intl.get(`${modelPrompt}.templateCode`).d('模板代码'),
        dataIndex: 'templateCode',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.templateType`).d('模板类型'),
        dataIndex: 'templateTypeMeaning',
        width: 100,
      },
      {
        title: intl.get(`${modelPrompt}.description`).d('描述'),
        dataIndex: 'description',
      },
      {
        title: intl.get(`${commonPrompt}.status.enable`).d('启用'),
        dataIndex: 'enabledFlag',
        width: 100,
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 150,
        render: (val, record) => (
          <span className="action-link">
            <a onClick={() => this.changeEdit(record)}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
            <Popconfirm
              title={intl.get(`${viewMessagePrompt}.title.confirmDelete`).d('确定删除?')}
              onConfirm={() => this.delHeader(record)}
            >
              <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
            </Popconfirm>
            <a onClick={() => this.changeExport(record)}>
              {intl.get('hzero.common.button.export').d('导出')}
            </a>
          </span>
        ),
      },
    ].filter(item => {
      return isTenantRoleLevel() ? item.dataIndex !== 'tenantName' : item;
    });
    return (
      <Fragment>
        <Table
          bordered
          loading={loading}
          rowKey="id"
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          dataSource={dataSource}
          pagination={paginations}
          onChange={onChange}
        />
      </Fragment>
    );
  }
}
