/**
 * AddDataModal - 增加数据弹框
 * @date: 2018-12-8
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Modal, Table, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class EditForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      addRows: [],
    };
  }

  /**
   * 点击确定触发事件
   */
  @Bind()
  okHandle() {
    const { addData } = this.props;
    const { addRows } = this.state;
    if (addData) {
      addData(addRows);
    }
  }

  /**
   * 点击取消触发事件
   */
  @Bind()
  cancelHandle() {
    const { onHideAddModal } = this.props;
    if (onHideAddModal) {
      onHideAddModal(false);
    }
  }

  /**
   *分页change事件
   */
  @Bind()
  handleTableChange(pagination = {}) {
    const { fetchModalData } = this.props;
    if (fetchModalData) {
      fetchModalData({
        page: pagination,
      });
    }
  }

  /**
   * 表格勾选
   * @param {null} _ 占位
   * @param {object} selectedRow 选中行
   */
  @Bind()
  onSelectChange(_, selectedRow) {
    this.setState({ addRows: selectedRow });
  }

  /**
   * 表单重置
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 查询方法
   */
  @Bind()
  queryValue() {
    const { form, fetchModalData } = this.props;
    if (fetchModalData) {
      fetchModalData(form.getFieldsValue() || {});
    }
  }

  @Bind()
  renderForm() {
    const { queryCode, queryName, queryCodeDesc, queryNameDesc } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <Form layout="inline">
        <FormItem label={queryNameDesc}>{getFieldDecorator(`${queryName}`)(<Input />)}</FormItem>
        <FormItem label={queryCodeDesc}>
          {getFieldDecorator(`${queryCode}`)(<Input typeCase="upper" trim inputChinese={false} />)}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit" onClick={this.queryValue}>
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
        </FormItem>
      </Form>
    );
  }

  render() {
    const {
      title,
      modalVisible,
      loading,
      confirmLoading,
      rowKey,
      columns = [],
      dataSource = [],
      pagination = {},
    } = this.props;
    const { addRows } = this.state;
    const rowSelection = {
      onChange: this.onSelectChange,
      selectedRowKeys: addRows.map(n => n[rowKey]),
    };
    return (
      <Modal
        destroyOnClose
        confirmLoading={confirmLoading}
        title={title}
        visible={modalVisible}
        onOk={this.okHandle}
        width={800}
        onCancel={this.cancelHandle}
      >
        <div className="table-list-search">{this.renderForm()}</div>
        <Table
          bordered
          rowKey={rowKey}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          loading={loading}
          dataSource={dataSource}
          rowSelection={rowSelection}
          pagination={pagination}
          onChange={this.handleTableChange}
        />
      </Modal>
    );
  }
}
