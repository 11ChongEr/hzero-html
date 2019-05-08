import React from 'react';
import { Table, Form, Popconfirm, Input, InputNumber, Switch } from 'hzero-ui';
import { map } from 'lodash';
import { Bind } from 'lodash-decorators';

import { totalRender, TagRender } from 'utils/renderer';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';

const EditableContext = React.createContext();
const FormItem = Form.Item;

const modelPrompt = 'himp.comment.model.comment';
const viewMessagePrompt = 'himp.comment.view.message';
const commonPrompt = 'hzero.common';

const EditableRow = ({ form, index, ...props }) => {
  return (
    <EditableContext.Provider value={form}>
      <tr {...props} />
    </EditableContext.Provider>
  );
};

const EditableFormRow = Form.create()(EditableRow);

function getInput(type) {
  switch (type) {
    case 'String':
      return <Input />;
    case 'Decimal':
      return <InputNumber />;
    case 'Long':
      return <InputNumber />;
    case 'Boolean':
      return <Switch checkedValue unCheckedValue={false} />;
    // case 'Date':
    //   return <Switch />;
    default:
      return <Input />;
  }
}

export default class List extends React.Component {
  state = {
    editableKey: null,
    prevDataSource: [],
    dataSource: [],
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const { dataSource } = nextProps;
    if (dataSource !== prevState.prevDataSource) {
      return {
        dataSource: map(dataSource, record => {
          const { data, ...rest } = record;
          let rData;
          try {
            rData = JSON.parse(data);
          } catch (e) {
            rData = {};
          }
          return {
            ...rData,
            ...rest,
          };
        }),
      };
    }
  }

  @Bind()
  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 150,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: e => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  @Bind()
  edit(editableKey) {
    this.setState({
      editableKey,
    });
  }

  @Bind()
  cancel() {
    this.setState({
      editableKey: null,
    });
  }

  @Bind()
  handleSave(form, id) {
    const { save = e => e } = this.props;
    save(form, id, this.cancel);
  }

  @Bind()
  editRender(text, record) {
    const { editableKey } = this.state;
    return (
      <span className="action-link">
        {editableKey === record.id ? (
          <span>
            <EditableContext.Consumer>
              {form => (
                <a onClick={() => this.handleSave(form, record.id)}>
                  {intl.get('hzero.common.button.save').d('保存')}
                </a>
              )}
            </EditableContext.Consumer>
            <Popconfirm
              title={intl.get(`${viewMessagePrompt}.title.sureToCancel`).d('确定取消编辑?')}
              onConfirm={() => this.cancel()}
            >
              <a>{intl.get('hzero.common.button.cancel').d('取消')}</a>
            </Popconfirm>
          </span>
        ) : (
          !record.imported && (
            <a onClick={() => this.edit(record.id)}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          )
        )}
      </span>
    );
  }

  @Bind()
  getDynamicColumns() {
    const { dynamicColumns = [] } = this.props;
    const { editableKey } = this.state;
    return dynamicColumns.map(n => ({
      title: n.title,
      dataIndex: n.dataIndex,
      width: n.width,
      onCell: this.onCell,
      render: (text, record) => {
        return (
          <EditableContext.Consumer>
            {form => {
              const { getFieldDecorator } = form;
              return editableKey === record.id ? (
                <FormItem style={{ margin: 0, width: 90 }}>
                  {getFieldDecorator(n.dataIndex, {
                    rules: [
                      {
                        required: n.required,
                        message: intl
                          .get(`${commonPrompt}.validation.requireInput`, { name: n.title })
                          .d(`请输入${n.title}`),
                      },
                    ],
                    initialValue: this.setInitValue(record[n.dataIndex]),
                  })(getInput(n.columnType))}
                </FormItem>
              ) : (
                text
              );
            }}
          </EditableContext.Consumer>
        );
      },
    }));
  }

  setInitValue(value) {
    if (value === 'true' || value === 'false') {
      return value === 'true';
    } else {
      return value;
    }
  }

  render() {
    const { processing = {} } = this.props;
    const { dataSource = [] } = this.state;
    const components = {
      body: {
        row: EditableFormRow,
      },
    };
    const dynamicColumns = this.getDynamicColumns();
    const defaultColumns = [
      {
        title: intl.get(`${modelPrompt}.dataStatus`).d('数据状态'),
        dataIndex: 'dataStatus',
        width: 120,
        render: (text, record) => {
          const statusList = [
            { status: 'NEW', color: 'blue', text: 'Excel导入' },
            { status: 'VALID_SUCCESS', color: 'green', text: '验证成功' },
            { status: 'VALID_FAILED', color: 'red', text: '验证失败' },
            { status: 'IMPORT_SUCCESS', color: 'green', text: '导入成功' },
            { status: 'IMPORT_FAILED', color: 'red', text: '导入失败' },
            { status: 'ERROR', color: 'red', text: '数据异常' },
          ];
          return TagRender(record.dataStatus, statusList);
        },
      },
      {
        title: intl.get(`${modelPrompt}.errorMsg`).d('错误信息'),
        dataIndex: 'errorMsg',
        width: 150,
        onCell: this.onCell,
      },
      {
        title: intl.get(`${commonPrompt}.table.column.option`).d('操作'),
        width: 120,
        render: this.editRender,
      },
    ];
    const tableColumns = dynamicColumns.concat(defaultColumns);
    const tableProps = {
      components,
      dataSource,
      rowKey: 'id',
      bordered: true,
      loading: processing.loading || processing.queryColumns,
      columns: tableColumns,
      scroll: {
        x: tableScrollWidth(tableColumns),
      },
      pagination: {
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
        pageSize: 10,
        total: (dataSource || []).length,
        showTotal: totalRender,
      },
    };
    return <Table {...tableProps} />;
  }
}
