import React, { PureComponent, Fragment } from 'react';
import { Table, Checkbox, Button } from 'hzero-ui';
import intl from 'utils/intl';
// import notification from 'utils/notification';

/**
 * 员工明细-已分配岗位信息列表
 * @extends {PureComponent} - React.PureComponent
//  * @reactProps {Boolean} primaryFlag - 是否已分配主岗标记
 * @reactProps {Boolean} loading - 数据加载完成标记
 * @reactProps {Array} dataSource - Table数据源
 * @reactProps {Function} onChange - 维护岗位信息
 * @return React.element
 */
export default class PositionList extends PureComponent {
  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      loading,
      dataSource,
      selectedRowKeys,
      onChange,
      onAdd,
      onDelete,
      onEditPrimary,
    } = this.props;
    const columns = [
      {
        title: intl.get('hpfm.employee.model.employee.unitCompanyName').d('所属公司'),
        dataIndex: 'unitCompanyName',
        width: 250,
      },
      {
        title: intl.get('hpfm.employee.model.employee.unitName').d('所属部门'),
        dataIndex: 'unitName',
        width: 220,
      },
      {
        title: intl.get('hpfm.employee.model.employee.positionName').d('所属岗位'),
        dataIndex: 'positionName',
        width: 220,
      },
      {
        title: intl.get('hpfm.employee.model.employee.primaryPositionFlag').d('主岗'),
        dataIndex: 'primaryPositionFlag',
        width: 100,
        align: 'center',
        render: (val, record) => (
          <Checkbox checked={val} onChange={event => onEditPrimary(record, event.target.checked)} />
        ),
      },
    ];
    return (
      <Fragment>
        <div className="table-list-operator">
          <Button icon="plus" onClick={onAdd}>
            {intl.get('hpfm.employee.view.option.change').d('维护岗位')}
          </Button>
          <Button icon="delete" onClick={onDelete} disabled={selectedRowKeys.length === 0}>
            {intl.get('hpfm.employee.view.option.remove').d('删除岗位')}
          </Button>
        </div>
        <Table
          bordered
          rowKey="positionId"
          scroll={{ y: 300, x: 855 }}
          loading={loading}
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          rowSelection={{
            selectedRowKeys,
            onChange,
          }}
        />
      </Fragment>
    );
  }
}
