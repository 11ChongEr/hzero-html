import React, { PureComponent } from 'react';
import { Modal, Table, Form, Button, Input } from 'hzero-ui';
import { pullAllBy } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

const FormItem = Form.Item;

const viewMessagePrompt = 'hiam.menuConfig.view.message';
const modelPrompt = 'hiam.menuConfig.model.menuConfig';
const commonPrompt = 'hzero.common';

@Form.create({ fieldNameProp: null })
export default class LovModal extends PureComponent {
  state = {
    selectedRows: [],
  };

  @Bind()
  onSelect(record, selected) {
    const { selectedRows = [] } = this.state;
    this.setState({
      selectedRows: selected
        ? selectedRows.concat(record)
        : selectedRows.filter(n => n.lovId !== record.lovId),
    });
  }

  @Bind()
  onSelectAll(selected, newSelectedRows, changeRows) {
    const { selectedRows = [] } = this.state;
    this.setState({
      selectedRows: selected
        ? selectedRows.concat(changeRows)
        : pullAllBy([...selectedRows], changeRows, 'lovId'),
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

  render() {
    const {
      title,
      onCancel,
      onOk,
      dataSource,
      queryLovByMenuId,
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
          title: intl.get(`${modelPrompt}.lovCode`).d('编码'),
          dataIndex: 'lovCode',
          width: 250,
        },
        {
          title: intl.get(`${modelPrompt}.lovName`).d('名称'),
          dataIndex: 'lovName',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.lovTypeCode`).d('类型'),
          dataIndex: 'lovTypeCode',
          width: 100,
        },
      ],
      rowKey: 'lovId',
      rowSelection: {
        selectedRowKeys: selectedRows.map(n => n.lovId),
        onSelect: this.onSelect,
        onSelectAll: this.onSelectAll,
      },
      pagination,
      dataSource,
      loading: queryLovByMenuId,
      bordered: true,
      onChange: this.onTableChange,
    };

    return (
      <Modal
        title={title || intl.get(`${viewMessagePrompt}.title.selectLov`).d('选择Lov')}
        visible={visible}
        onOk={this.ok}
        onCancel={onCancel}
        width={750}
        confirmLoading={assignPermissions}
        destroyOnClose
        {...others}
      >
        <Form layout="inline" style={{ marginBottom: 15 }}>
          <Form.Item label={intl.get(`${modelPrompt}.conditionLov`).d('编码/名称')}>
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
