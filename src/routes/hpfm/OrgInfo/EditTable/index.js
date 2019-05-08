import React from 'react';
import { Table } from 'hzero-ui';
import EditableCell from './EditableCell';
import EditableFormRow from './EditableFormRow';
// import autobind from 'utils/autobind'

export const EditableContext = React.createContext();

class EditTable extends React.Component {
  render() {
    // antd table属性
    const {
      pagination,
      columns,
      dataSource,
      editingKey,
      rowKey,
      loading,
      onChange,
      ...otherProps
    } = this.props;
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };
    const column = columns.map(col => {
      return {
        ...col,
        // 对每一列的属性处理
        onCell: record => ({
          record,
          dataIndex: col.dataIndex,
          title: col.title,
          renderType: col.renderType,
          rules: col.rules,
          // 设置行的可编辑状态：当前行或是新增
          editing: record[rowKey] === editingKey || record.isCreate,
        }),
      };
    });
    const editTableProps = {
      pagination,
      components,
      dataSource,
      columns: column,
      rowKey,
      loading,
      onChange,
      ...otherProps,
    };
    return <Table {...editTableProps} />;
  }
}

export default EditTable;
