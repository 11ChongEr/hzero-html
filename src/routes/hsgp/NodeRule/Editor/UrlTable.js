/**
 * nodeRule - 节点组规则 - 新增/编辑 - url表格
 * @date: 2018-9-7
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Table, Form, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { createPagination, tableScrollWidth } from 'utils/utils';
import intl from 'utils/intl';

const { Search } = Input;

@Form.create({ fieldNameProp: null })
export default class UrlTable extends React.PureComponent {
  /**
   * @function handleSearch - 搜索
   * @param {string} value - 搜索条件
   */
  @Bind()
  handleSearch(value) {
    const { dispatch, productEnvId } = this.props;
    dispatch({
      type: 'nodeRule/fetchUrlList',
      payload: { productEnvId, condition: value, page: 0, size: 10 },
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { loading, urlList, standardTable, selectedUrlRowKeys, onUrlSelectChange } = this.props;
    const columns = [
      {
        title: intl.get('hsgp.nodeRule.model.nodeRule.serviceName').d('服务名'),
        dataIndex: 'serviceName',
      },
      {
        title: 'URL',
        dataIndex: 'url',
      },
      {
        title: 'HttpMethod',
        width: 80,
        dataIndex: 'method',
      },
    ];
    const rowSelection = {
      selectedRowKeys: selectedUrlRowKeys,
      onChange: onUrlSelectChange,
    };
    return (
      <React.Fragment>
        <Search
          style={{ width: 200, marginBottom: 12 }}
          placeholder={`${intl.get('hsgp.nodeRule.model.nodeRule.serviceName').d('服务名')}/URL`}
          onSearch={this.handleSearch}
        />
        <Table
          bordered
          rowKey="urlId"
          rowSelection={rowSelection}
          loading={loading}
          dataSource={urlList.content || []}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          pagination={createPagination(urlList)}
          onChange={standardTable}
        />
      </React.Fragment>
    );
  }
}
