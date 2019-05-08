import React, { PureComponent, Fragment } from 'react';
import { Table, Button } from 'hzero-ui';
import intl from 'utils/intl';

/**
 * 员工明细-已分配用户信息列表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Boolean} loading - 数据加载完成标记
 * @reactProps {Array} dataSource - Table数据源
 * @return React.element
 */
export default class UserList extends PureComponent {
  /**
   * render
   * @returns React.element
   */
  render() {
    const { loading, dataSource, selectedRowKeys, onAdd, onDelete, onChange } = this.props;
    const columns = [
      {
        title: intl.get('entity.user.code').d('用户编码'),
        dataIndex: 'loginName',
        width: 200,
      },
      {
        title: intl.get('entity.user.name').d('用户姓名'),
        dataIndex: 'realName',
      },
    ];
    return (
      <Fragment>
        <div className="table-list-operator">
          <Button icon="plus" onClick={onAdd}>
            {intl.get('hpfm.employee.view.option.user.add').d('新增用户')}
          </Button>
          <Button icon="delete" onClick={onDelete} disabled={selectedRowKeys.length === 0}>
            {intl.get('hpfm.employee.view.option.user.delete').d('删除用户')}
          </Button>
        </div>
        <Table
          bordered
          rowKey="employeeUserId"
          loading={loading}
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          scroll={{ y: 300, x: 400 }}
          rowSelection={{
            selectedRowKeys,
            onChange,
          }}
        />
      </Fragment>
    );
  }
}
