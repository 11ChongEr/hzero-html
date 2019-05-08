import React, { PureComponent } from 'react';
import { Table, Popconfirm } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';

/**
 * 流程启动数据列表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Array} dataSource - Table数据源
 * @return React.element
 */
export default class ListTable extends PureComponent {
  // 删除
  @Bind()
  deleteData(record) {
    const { onDelete } = this.props;
    onDelete(record);
  }

  // 选中行
  @Bind()
  onSelectChange(selectedRowKeys) {
    const { onSelectedKeys } = this.props;
    onSelectedKeys(selectedRowKeys);
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { variables, selectedRowKeys } = this.props;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    const columns = [
      {
        title: intl.get('hwfl.common.model.param.name').d('参数名称'),
        dataIndex: 'name',
      },
      {
        title: intl.get('hwfl.common.model.param.value').d('参数值'),
        dataIndex: 'value',
        width: 150,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 100,
        render: (val, record) => (
          <span className="action-link">
            <Popconfirm
              placement="topRight"
              title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录')}
              onConfirm={() => this.deleteData(record)}
            >
              <a>{intl.get('hezor.common.button.delete').d('删除')}</a>
            </Popconfirm>
          </span>
        ),
      },
    ];
    return (
      <Table
        bordered
        rowKey="count"
        pagination={false}
        rowSelection={rowSelection}
        dataSource={variables || []}
        columns={columns}
        scroll={{ x: tableScrollWidth(columns) }}
      />
    );
  }
}
