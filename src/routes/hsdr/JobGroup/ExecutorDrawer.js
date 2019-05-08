import React from 'react';
import { Button, Form, Modal, InputNumber } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import EditTable from 'components/EditTable';

import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';

const FormItem = Form.Item;

export default class UserModal extends React.Component {
  state = {
    selectedRowKeys: [],
    selectRows: [],
  };

  @Bind()
  handleSelectTable(keys, rows) {
    this.setState({ selectedRowKeys: keys, selectRows: rows });
  }

  @Bind()
  handleDelete() {
    const { onDelete = e => e } = this.props;
    const { selectRows, selectedRowKeys } = this.state;
    onDelete(selectRows, selectedRowKeys);
    this.setState({ selectedRowKeys: [] });
  }

  /**
   * 编辑当前行
   * @param {Object} record - 当前行数据
   */
  @Bind()
  editRow(record, flag) {
    const { onEdit = e => e } = this.props;
    onEdit(record, flag);
  }

  @Bind()
  handleCancel() {
    const { onCancel = e => e } = this.props;
    this.setState({ selectRows: [], selectedRowKeys: [] });
    onCancel();
  }

  render() {
    const {
      initLoading = false,
      saveLoading = false,
      dataSource = [],
      modalVisible = false,
      onCancel = e => e,
      onOk = e => e,
    } = this.props;
    const { selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleSelectTable,
    };
    const updateList = dataSource.filter(item => item._status === 'update');
    const columns = [
      {
        title: intl.get('hsdr.jobGroup.model.address').d('执行器地址'),
        width: 200,
        dataIndex: 'address',
      },
      {
        title: intl.get('hsdr.jobGroup.model.weight').d('权重'),
        dataIndex: 'weight',
        render: (value, record) => {
          if (record._status === 'create' || record._status === 'update') {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('weight', {
                  initialValue: value,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hsdr.jobGroup.model.weight').d('权重'),
                      }),
                    },
                  ],
                })(<InputNumber min={0} />)}
              </FormItem>
            );
          } else {
            return value;
          }
        },
      },
      {
        title: intl.get('hsdr.jobGroup.model.weight').d('最大并发量'),
        dataIndex: 'maxConcurrent',
        render: (value, record) => {
          if (record._status === 'create' || record._status === 'update') {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('maxConcurrent', {
                  initialValue: value,
                })(<InputNumber min={0} />)}
              </FormItem>
            );
          } else {
            return value;
          }
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 110,
        render: (val, record) => (
          <span className="action-link">
            {record._status === 'update' && (
              <a onClick={() => this.editRow(record, false)}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            )}
            {record._status !== 'create' && record._status !== 'update' && (
              <a onClick={() => this.editRow(record, true)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            )}
            {record._status === 'create' && (
              <a onClick={() => this.deleteRow(record)}>
                {intl.get('hzero.common.button.delete').d('删除')}
              </a>
            )}
          </span>
        ),
      },
    ];
    return (
      <Modal
        destroyOnClose
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        width={720}
        title={intl.get('hsdr.jobGroup.view.message.executor').d('配置')}
        visible={modalVisible}
        confirmLoading={saveLoading}
        onCancel={this.handleCancel}
        footer={[
          <Button key="cancel" onClick={onCancel}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>,
          <Button
            loading={saveLoading}
            type="primary"
            key="save"
            disabled={updateList.length === 0}
            onClick={onOk}
          >
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>,
        ]}
      >
        <div style={{ marginBottom: 12 }}>
          <Button onClick={this.handleDelete} icon="delete" disabled={selectedRowKeys.length === 0}>
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
        </div>
        <EditTable
          bordered
          rowSelection={rowSelection}
          loading={initLoading}
          rowKey="configId"
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          dataSource={dataSource}
        />
      </Modal>
    );
  }
}
