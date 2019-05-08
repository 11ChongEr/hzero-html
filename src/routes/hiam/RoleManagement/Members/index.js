import React, { PureComponent, Fragment } from 'react';
import { Table, Button, Form } from 'hzero-ui';
import { isEmpty, uniqBy, isInteger, omit, pullAllBy, find } from 'lodash';
import uuidv4 from 'uuid/v4';
import { getCurrentOrganizationId, tableScrollWidth } from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { VERSION_IS_OP } from 'utils/config';
import EditableCell from './EditableCell';
import Drawer from '../Drawer';
// import OrganizationModal from './Organization';
import QueryForm from './QueryForm';
import styles from './index.less';

const EditableContext = React.createContext();
const currentTenantId = getCurrentOrganizationId();

const EditableRow = ({ form, index, ...props }) => {
  return (
    <EditableContext.Provider value={form}>
      <tr {...props} />
    </EditableContext.Provider>
  );
};

const EditableFormRow = Form.create({ fieldNameProp: null })(EditableRow);

const modelPrompt = 'hiam.roleManagement.model.roleManagement';
const commonPrompt = 'hzero.common';

function getCodeTag(value, code = []) {
  let result;
  if (value && !isEmpty(code)) {
    const codeList = code.filter(n => n.value === value);
    if (!isEmpty(codeList)) {
      result = codeList[0].tag;
    }
  }
  return result;
}

function assignResourceLevel(
  options = [],
  roleDatasource,
  recordOrganizationId,
  parentRoleAssignLevel
) {
  let newOptions = options;
  const parentRoleAssignLevelTag = Number(getCodeTag(parentRoleAssignLevel, options));
  // if (roleDatasource.tenantId !== 0) {
  newOptions = options.filter(o => o.value !== 'site');
  // } else {
  //   newOptions = options.filter(o => o.value === 'site');
  // }

  return newOptions.filter(o => Number(o.tag) >= parentRoleAssignLevelTag);
  // roleDatasource.tenantId !== recordOrganizationId
  // ? newOptions.filter(o => Number(o.tag) >= parentRoleAssignLevelTag)
  // newOptions;
}

export default class Members extends PureComponent {
  constructor(props) {
    super(props);
    this.onDrawerClose = this.onDrawerClose.bind(this);
    this.fetchDataSource = this.fetchDataSource.bind(this);
  }

  state = {
    selectedRows: [],
    dataSource: [],
    pagination: {},
    editingRows: [],
    // organizationModalVisible: false,
    // organizationModalDataSource: [],
    // currentEditingRow: {},
  };

  getSnapshotBeforeUpdate(prevProps) {
    const { visible, roleDatasource } = this.props;
    return (
      visible && isInteger(roleDatasource.id) && roleDatasource.id !== prevProps.roleDatasource.id
    );
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot) {
      this.fetchDataSource();
    }
  }

  onDrawerClose() {
    const { close = e => e } = this.props;
    this.setState({
      dataSource: [],
      selectedRows: [],
      pagination: {},
      editingRows: [],
    });
    close();
  }

  onTableSelectedRowChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRows,
    });
  }

  onTableChange(pagination) {
    const { getFieldsValue = e => e } = this.queryForm;
    const { current = 1, pageSize = 10 } = pagination;
    this.fetchDataSource({ ...getFieldsValue(), page: current - 1, size: pageSize });
  }

  fetchDataSource(params = {}) {
    const { handleFetchData = e => e } = this.props;
    handleFetchData({ page: 0, size: 10, ...params }).then(res => {
      if (res) {
        const { dataSource, pagination } = res;
        this.setState({
          dataSource,
          pagination,
        });
      }
    });
  }

  add() {
    const { editingRows, dataSource } = this.state;
    const { roleDatasource = {} /* , resourceLevel = [] */ } = this.props;
    const item = { key: uuidv4() };
    // if (roleDatasource.tenantId === 0) {
    //   item.organizationId = roleDatasource.tenantId;
    //   item.tenantName = roleDatasource.tenantName;
    //   // item.assignLevel = 'site';
    //   // item.assignLevelMeaning = getCodeMeaning('site', resourceLevel);
    //   // item.assignLevelValue = 0;
    //   // item.assignLevelValueMeaning = roleDatasource.tenantName;
    // }

    if (currentTenantId !== 0 && VERSION_IS_OP) {
      item.organizationId = roleDatasource.tenantId;
      item.tenantName = roleDatasource.tenantName;
      item.assignLevel = 'organization';
      // item.assignLevelMeaning = getCodeMeaning('site', resourceLevel);
      item.assignLevelValue = 0;
      // item.assignLevelValueMeaning = roleDatasource.tenantName;
    }

    this.setState({
      dataSource: [item].concat(dataSource),
      editingRows: uniqBy(editingRows.concat(item), 'key'),
    });
  }

  deleteRow() {
    const { selectedRows, dataSource, pagination } = this.state;
    const { handleDelete = e => e, roleDatasource = {} } = this.props;
    const { current, pageSize } = pagination;
    const { getFieldsValue = e => e } = this.queryForm;
    const data = selectedRows.filter(o => isInteger(Number(o.key)));
    this.setState({
      dataSource: pullAllBy(
        [...dataSource],
        selectedRows.filter(o => !isInteger(Number(o.key)), 'key')
      ),
    });
    if (!isEmpty(data)) {
      handleDelete(
        data.map(n => ({
          memberId: n.id,
          roleId: roleDatasource.id,
        })),
        () => {
          notification.success();
          this.fetchDataSource({
            roleId: roleDatasource.id,
            page: current - 1,
            size: pageSize,
            ...getFieldsValue(),
          });
        }
      );
    }
  }

  save() {
    const { handleSave = e => e, roleDatasource } = this.props;
    const { dataSource = [] } = this.state;
    if (!isEmpty(dataSource.filter(o => !isEmpty(o.error)))) {
      return;
    }

    const data = dataSource.map(n => {
      const item = omit(n, ['key', 'error']);
      const { assignLevel, assignLevelValue } = item;
      return { memberId: item.id, assignLevel, assignLevelValue, roleId: roleDatasource.id };
    });

    if (!isEmpty(data)) {
      handleSave(data, false, () => {
        notification.success({
          message: intl.get(`${commonPrompt}.notification.success.save`).d('保存成功'),
        });
        this.onDrawerClose();
      });
    }
  }

  search(params) {
    this.fetchDataSource({ page: 0, size: 10, ...params });
  }

  getColumns(defaultColumns) {
    const { roleDatasource, resourceLevel, handleFetchHrunitsTree = e => e } = this.props;
    const { editingRows, dataSource = [] } = this.state;
    const saveBtnTarget = this.saveBtn;
    const setRecord = newRecored => {
      this.setState({
        dataSource: dataSource.map(o => (o.key === newRecored.key ? newRecored : o)),
      });
    };
    const getColumn = defaultColumn => {
      const { dataIndex, title } = defaultColumn;
      return dataIndex !== 'realName' && dataIndex !== 'tenantName'
        ? {
            ...defaultColumn,
            render: (text, record) => {
              const isUpdate = isInteger(Number(record.key));
              const editing = !isEmpty(editingRows.filter(o => o.key === record.key));
              const editable =
                defaultColumn.className === 'editable-cell' ||
                defaultColumn.className === 'editable-cell-operation';
              const isColumnEdited = {
                id: editing && !isUpdate,
                assignLevel: editing, // editing && record.organizationId !== 0,
                assignLevelValue: editing && record.assignLevel === 'org',
                // editing && record.organizationId !== 0 && record.assignLevel === 'org',
              };
              const editableCellProps = {
                title,
                text,
                dataIndex,
                record,
                saveBtnTarget,
                editable,
                editing: isColumnEdited[dataIndex],
                currentEditingRow: find(editingRows, o => o.key === record.key),
                roleTenantId: roleDatasource.tenantId,
                roleTenantName: roleDatasource.tenantName,
                setRecord,
                // siteMeaning: getCodeMeaning('site', resourceLevel),
              };
              if (dataIndex === 'assignLevel') {
                editableCellProps.options = assignResourceLevel(
                  resourceLevel,
                  roleDatasource,
                  record.organizationId,
                  roleDatasource.parentRoleAssignLevel
                );
              }
              if (dataIndex === 'assignLevelValue') {
                editableCellProps.handleFetchOrganizationData = handleFetchHrunitsTree;
                editableCellProps.roleId = roleDatasource.id;
              }
              return (
                <EditableContext.Consumer>
                  {form =>
                    defaultColumn.className === 'editable-cell' ? (
                      <EditableCell form={form} {...editableCellProps} />
                    ) : !isEmpty(editingRows.filter(o => o.key === record.key)) ? (
                      <a onClick={this.cancel.bind(this, record, form)}>
                        {isInteger(Number(record.key))
                          ? intl.get(`${commonPrompt}.button.cancel`).d('取消')
                          : intl.get(`${commonPrompt}.button.clean`).d('清除')}
                      </a>
                    ) : (
                      <a onClick={this.edit.bind(this, record, form)}>
                        {intl.get(`${commonPrompt}.button.edit`).d('编辑')}
                      </a>
                    )
                  }
                </EditableContext.Consumer>
              );
            },
          }
        : defaultColumn;
    };
    return defaultColumns.map(n => getColumn(n));
  }

  edit(record) {
    const { editingRows } = this.state;
    this.setState({
      editingRows: uniqBy(editingRows.concat(record), 'key'),
    });
  }

  cancel(record) {
    const { dataSource, editingRows } = this.state;
    this.setState({
      dataSource: isInteger(record.key)
        ? dataSource.map(n => (n.key === record.key ? record : n))
        : dataSource.filter(o => o.key !== record.key),
      editingRows: editingRows.filter(o => o.key !== record.key),
    });
  }

  render() {
    const { visible, title, processing = {}, prompt = {} } = this.props;
    const { selectedRows, dataSource, pagination, editingRows } = this.state;
    const columns = [
      {
        title: intl.get(`${modelPrompt}.userLoginName`).d('用户名'),
        className: 'editable-cell',
        dataIndex: 'id',
      },
      !VERSION_IS_OP &&
        currentTenantId === 0 && {
          title: intl.get(`${modelPrompt}.tenant`).d('所属租户'),
          dataIndex: 'tenantName',
          width: 200,
        },
      {
        title: intl.get(`${modelPrompt}.assignLevel`).d('分配层级'),
        dataIndex: 'assignLevel',
        className: 'editable-cell',
      },
      {
        title: intl.get(`${modelPrompt}.assignLevelValue`).d('分配层级值'),
        className: 'editable-cell',
        dataIndex: 'assignLevelValue',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.table.column.option`).d('操作'),
        dataIndex: 'operation',
        className: 'editable-cell-operation',
        width: 85,
      },
    ].filter(Boolean);

    const drawerProps = {
      title,
      visible,
      onCancel: this.onDrawerClose.bind(this),
      width: 800,
      anchor: 'right',
      wrapClassName: styles['hiam-role-members'],
      footer: (
        <Fragment>
          <Button onClick={this.onDrawerClose.bind(this)} disabled={processing.save}>
            {intl.get(`${commonPrompt}.button.cancel`).d('取消')}
          </Button>
          {!isEmpty(editingRows) && (
            <Button
              ref={node => {
                this.saveBtn = node;
              }}
              id="saveBtn"
              type="primary"
              loading={processing.save}
              onClick={this.save.bind(this)}
            >
              {intl.get(`${commonPrompt}.button.save`).d('保存')}
            </Button>
          )}
        </Fragment>
      ),
    };

    const queryFormProps = {
      ref: node => {
        this.queryForm = node;
      },
      prompt,
      handleFetchData: this.search.bind(this),
      disabled: processing.save,
      loading: processing.query,
    };

    const components = {
      body: {
        row: EditableFormRow,
      },
    };

    const tableColumns = this.getColumns.bind(this)(columns);

    const tableProps = {
      components,
      pagination,
      dataSource,
      bordered: true,
      className: 'editable-table',
      columns: tableColumns,
      scroll: { x: tableScrollWidth(tableColumns) },
      loading: processing.query || processing.save,
      rowSelection: {
        selectedRowKeys: selectedRows.map(n => n.key),
        onChange: this.onTableSelectedRowChange.bind(this),
      },
      onChange: this.onTableChange.bind(this),
    };
    return (
      <Drawer {...drawerProps}>
        <QueryForm {...queryFormProps} />
        <br />
        <div className="action">
          <Button
            icon="plus"
            onClick={this.add.bind(this)}
            style={{ marginRight: 8 }}
            disabled={processing.delete || processing.save || processing.query}
          >
            {intl.get(`${commonPrompt}.button.add`).d('新建')}
          </Button>
          <Button
            icon="delete"
            onClick={this.deleteRow.bind(this)}
            disabled={
              isEmpty(selectedRows) || processing.delete || processing.save || processing.query
            }
            style={{ marginRight: 8 }}
          >
            {intl.get(`${commonPrompt}.button.delete`).d('删除')}
          </Button>
        </div>
        <br />
        <Table {...tableProps} />
      </Drawer>
    );
  }
}
