import React, { PureComponent } from 'react';
import { Modal, Table, Form, Button, Input, Badge } from 'hzero-ui';
import { pullAllBy } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

const FormItem = Form.Item;

const viewMessagePrompt = 'hiam.menuConfig.view.message';
const modelPrompt = 'hiam.menuConfig.model.menuConfig';
const commonPrompt = 'hzero.common';

@Form.create({ fieldNameProp: null })
export default class PermissionsModal extends PureComponent {
  state = {
    selectedRows: [],
  };

  @Bind()
  onSelect(record, selected) {
    const { selectedRows = [] } = this.state;
    this.setState({
      selectedRows: selected
        ? selectedRows.concat(record)
        : selectedRows.filter(n => n.id !== record.id),
    });
  }

  @Bind()
  onSelectAll(selected, newSelectedRows, changeRows) {
    const { selectedRows = [] } = this.state;
    this.setState({
      selectedRows: selected
        ? selectedRows.concat(changeRows)
        : pullAllBy([...selectedRows], changeRows, 'id'),
    });
  }

  @Bind()
  ok() {
    const { onOk = e => e } = this.props;
    const { selectedRows } = this.state;
    onOk(selectedRows);
    this.cancel();
  }

  @Bind()
  cancel() {
    this.setSelectedRows();
    this.reset();
  }

  @Bind()
  onTableChange(pagination = {}) {
    const {
      handleFetchDataSource = e => e,
      form: { getFieldsValue = e => e },
    } = this.props;
    const { current = 1, pageSize = 10 } = pagination;
    handleFetchDataSource({ page: current - 1, size: pageSize, ...getFieldsValue() });
  }

  @Bind()
  search() {
    const {
      handleFetchDataSource = e => e,
      form: { getFieldsValue = e => e },
    } = this.props;
    handleFetchDataSource({ page: 0, size: 10, ...getFieldsValue() });
  }

  @Bind()
  reset() {
    const {
      form: { resetFields = e => e },
    } = this.props;
    resetFields();
  }

  @Bind()
  setSelectedRows(selectedRows = []) {
    this.setState({
      selectedRows,
    });
  }

  @Bind()
  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 180,
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

  render() {
    const {
      title,
      onCancel,
      onOk,
      dataSource,
      queryPermissionsByMenuId,
      assignPermissions,
      pagination,
      visible,
      form: { getFieldDecorator = e => e },
      ...others
    } = this.props;
    const { selectedRows = [] } = this.state;

    const tableProps = {
      columns: [
        {
          title: intl.get(`${modelPrompt}.permissionCode`).d('权限编码'),
          dataIndex: 'code',
          width: 150,
          onCell: this.onCell,
        },
        {
          title: intl.get(`${modelPrompt}.description`).d('描述'),
          dataIndex: 'description',
          width: 150,
          onCell: this.onCell,
        },
        {
          title: intl.get(`${modelPrompt}.path`).d('路径'),
          dataIndex: 'path',
          width: 150,
          onCell: this.onCell,
        },
        {
          title: intl.get(`${modelPrompt}.method`).d('方法'),
          dataIndex: 'method',
          width: 80,
        },
        {
          title: intl.get(`${modelPrompt}.loginAccess`).d('登录可访问'),
          dataIndex: 'loginAccess',
          width: 100,
          render: text => {
            if (text) {
              return <Badge status="success" text={intl.get('hzero.common.status.yes')} />;
            } else {
              return <Badge status="error" text={intl.get('hzero.common.status.no')} />;
            }
          },
        },
        {
          title: intl.get(`${modelPrompt}.publicAccess`).d('公开接口'),
          dataIndex: 'publicAccess',
          width: 80,
          render: text => {
            if (text) {
              return <Badge status="success" text={intl.get('hzero.common.status.yes')} />;
            } else {
              return <Badge status="error" text={intl.get('hzero.common.status.no')} />;
            }
          },
        },
      ],
      rowKey: 'id',
      rowSelection: {
        selectedRowKeys: selectedRows.map(n => n.id),
        onSelect: this.onSelect,
        onSelectAll: this.onSelectAll,
        // fixed: true,
      },
      pagination,
      dataSource,
      loading: queryPermissionsByMenuId,
      bordered: true,
      onChange: this.onTableChange,
    };

    return (
      <Modal
        title={title || intl.get(`${viewMessagePrompt}.title.selectPermissions`).d('选择权限')}
        visible={visible}
        onOk={this.ok}
        onCancel={onCancel}
        width={850}
        confirmLoading={assignPermissions}
        destroyOnClose
        {...others}
      >
        <Form layout="inline" style={{ marginBottom: 15 }}>
          <Form.Item label={intl.get(`${modelPrompt}.code`).d('目录编码')}>
            {getFieldDecorator('code')(<Input />)}
          </Form.Item>
          <Form.Item label={intl.get(`${modelPrompt}.conditionPermission`).d('描述/路径')}>
            {getFieldDecorator('condition')(<Input />)}
          </Form.Item>
          <FormItem>
            <Button type="primary" htmlType="submit" onClick={this.search}>
              {intl.get(`${commonPrompt}.button.search`).d('查询')}
            </Button>
          </FormItem>
          <FormItem>
            <Button onClick={this.reset}>
              {intl.get(`${commonPrompt}.button.reset`).d('重置')}
            </Button>
          </FormItem>
        </Form>
        <Table {...tableProps} />
      </Modal>
    );
  }
}
