/**
 * 个性化配置-列表 table
 * Table 的 rowKey 为 pageCode
 * 平台级的页面没有 pageId
 * @date 2018/11/20
 * @author WY yang.wang06@hand-china.com
 * @copyright (c) 2018 Hand
 */

import React from 'react';
import { Table } from 'hzero-ui';
import PropTypes from 'prop-types';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

export default class DataTable extends React.Component {
  columns = [
    {
      title: intl.get('hpfm.ui.model.page.pageCode').d('页面编码'),
      dataIndex: 'pageCode',
      width: 200,
    },
    {
      title: '页面描述',
      dataIndex: 'description',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => {
        return (
          <span className="action-link">
            <a
              onClick={e => {
                e.preventDefault();
                this.handleColumnPageEditBtnClick(record);
              }}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
            <a
              onClick={e => {
                e.preventDefault();
                this.handleColumnPageDesignBtnClick(record.pageCode);
              }}
            >
              {intl.get('hpfm.ui.view.button.pageDesign').d('页面设计')}
            </a>
          </span>
        );
      },
    },
  ];

  static defaultProps = {
    loading: false,
    dataSource: [],
    pagination: false,
  };

  static propTypes = {
    loading: PropTypes.bool,
    dataSource: PropTypes.array,
    pagination: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    onPageEdit: PropTypes.func.isRequired,
    onPageDesign: PropTypes.func.isRequired,
    onTableChange: PropTypes.func.isRequired,
  };

  @Bind()
  handleColumnPageEditBtnClick(record) {
    const { onPageEdit } = this.props;
    onPageEdit(record);
  }

  @Bind()
  handleColumnPageDesignBtnClick(pageCode) {
    const { onPageDesign } = this.props;
    onPageDesign(pageCode);
  }

  @Bind()
  handleStandardTableChange(pagination, filtersArg, sorter) {
    const { onTableChange } = this.props;
    onTableChange({ pagination, filtersArg, sorter });
  }

  render() {
    const { pagination, dataSource, loading } = this.props;
    return (
      <Table
        bordered
        rowKey="pageCode"
        loading={loading}
        columns={this.columns}
        pagination={pagination}
        dataSource={dataSource}
        onChange={this.handleStandardTableChange}
      />
    );
  }
}
