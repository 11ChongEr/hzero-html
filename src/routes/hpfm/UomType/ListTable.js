/*
 * ListTable - 计量单位类型定义数据表格显示
 * @date: 2018/08/07 14:41:37
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Table } from 'hzero-ui';
// import PropTypes from 'prop-types';
import classNames from 'classnames';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { enableRender } from 'utils/renderer';
import styles from './index.less';

const promptCode = 'hpfm.uomType';
/**
 * 计量单位数据表单显示
 * @extends {Component} - React.Component
 * @reactProps {Function} showEditModal // 显示编辑模态框
 * @reactProps {Object} form
 * @return React.element
 */

export default class ListTable extends Component {
  /**
   * 显示编辑模态框
   * @param {obj} record 当前行数据
   */
  @Bind()
  showEditModal(record) {
    this.props.editLine(record);
  }

  render() {
    const { loading, dataSource, onSearch, pagination } = this.props;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.uomType.uomTypeCode`).d('单位类别代码'),
        dataIndex: 'uomTypeCode',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.uomType.uomTypeName`).d('单位类别名称'),
        dataIndex: 'uomTypeName',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.uomType.baseUomCode`).d('基本单位代码'),
        dataIndex: 'baseUomCode',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.uomType.baseUomName`).d('基本单位名称'),
        dataIndex: 'baseUomName',
        width: 150,
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        key: 'enabledFlag',
        width: 80,
        align: 'center',
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        align: 'center',
        width: 80,
        render: (val, record) => (
          <a
            onClick={() => {
              this.showEditModal(record);
            }}
          >
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
        ),
      },
    ];
    const editTableProps = {
      loading,
      columns,
      dataSource,
      pagination,
      bordered: true,
      rowKey: 'uomTypeId',
      onChange: page => onSearch(page),
      className: classNames(styles['uom-list']),
    };
    return (
      <Fragment>
        <Table {...editTableProps} />
      </Fragment>
    );
  }
}
