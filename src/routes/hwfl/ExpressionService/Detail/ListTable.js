import React, { PureComponent } from 'react';
import { Table, Popconfirm } from 'hzero-ui';
// import { isUndefined } from 'lodash';

import intl from 'utils/intl';
import { yesOrNoRender, valueMapMeaning } from 'utils/renderer';
import { tableScrollWidth } from 'utils/utils';

/**
 * 表达式服务-参数行列表
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
    const { loading, dataSource = [], paramsType = [] } = this.props;
    const columns = [
      {
        title: intl.get('hwfl.common.model.param.name').d('参数名称'),
        dataIndex: 'parameterName',
        width: 150,
      },
      {
        title: intl.get('hwfl.common.model.param.type').d('参数类型'),
        dataIndex: 'parameterType',
        width: 150,
        render: val => val && valueMapMeaning(paramsType, val),
      },
      {
        title: intl.get('hwfl.common.model.common.description').d('描述'),
        dataIndex: 'description',
      },
      {
        title: intl.get('hwfl.common.view.message.defaultValue').d('默认值'),
        dataIndex: 'defaultValue',
        width: 150,
      },
      {
        title: intl.get('hwfl.common.view.message.parameterOrigin').d('页面地址'),
        dataIndex: 'parameterOrigin',
        width: 150,
      },
      {
        title: intl.get('hwfl.common.view.message.editAble').d('是否可编辑'),
        dataIndex: 'editAble',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get('hwfl.common.view.message.isUriVariable').d('是否为URL参数'),
        dataIndex: 'isUriVariable',
        width: 100,
        align: 'center',
        render: yesOrNoRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'option',
        width: 110,
        render: (val, record) => (
          <span className="action-link">
            {record.editAble === 1 ? (
              <a onClick={() => this.editOption(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            ) : (
              ''
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
        rowKey="parameterId"
        pagination={false}
        // className={classNames(styles['param-list'])}
        loading={loading}
        dataSource={dataSource}
        columns={columns}
        scroll={{ x: tableScrollWidth(columns) }}
      />
    );
  }
}
