/**
 * 角色分配卡片
 * RoleAssignCardsEditModal
 * 使用 didUpdate 判断需不需要从新加载卡片
 * 重新加载卡片的条件是 visible 为 true, 且有角色信息
 * @date 2019-01-25
 * @author WY yang.wang06@hand-china.com
 * @copyright © HAND 2019
 */

import React from 'react';
import { Bind } from 'lodash-decorators';
import { isBoolean } from 'lodash';
import { Modal, InputNumber, Button, Form, Input } from 'hzero-ui';
import uuid from 'uuid/v4';

import EditTable from 'components/EditTable';
import Checkbox from 'components/Checkbox';

import {
  createPagination,
  addItemToPagination,
  delItemsToPagination,
  delItemToPagination,
  getEditTableData,
  tableScrollWidth,
} from 'utils/utils';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import notification from 'utils/notification';

const CARD_MAX_HEIGHT = 200;

const patchInputStyle = {
  width: '100%',
};

/**
 * @ReactProps {!Function} onFetchRoleCards - 查询已经分配的卡片
 */
export default class RoleAssignCardsEditModal extends React.Component {
  state = {
    rowSelection: {
      selectedRowKeys: [],
      selectedRows: [],
      onChange: this.handleRowSelectionChange,
    },
    dataSource: [],
    pagination: false,
  };

  componentDidUpdate(prevProps) {
    const { role } = prevProps;
    const { visible, role: nextRole } = this.props;
    if (visible) {
      if (nextRole && role !== nextRole) {
        // 两个角色不相同 且有下一个角色
        this.fetchRoleCards();
      }
    }
  }

  render() {
    const { visible, role, loading } = this.props;
    const { dataSource, pagination, rowSelection } = this.state;
    return (
      <Modal
        title={intl.get('hiam.roleManagement.view.title.assignCards').d('工作台配置')}
        width="1000px"
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        visible={visible}
        onOk={this.handleModalOkBtnClick}
        onCancel={this.handleModalCancelBtnClick}
        confirmLoading={loading.saveRoleCards}
      >
        <div className="table-list-operator">
          <Form layout="inline">
            <Form.Item
              label={intl.get('hiam.roleManagement.model.roleManagement.name').d('角色名称')}
            >
              <Input disabled value={role.name} />
            </Form.Item>
            <Form.Item
              label={intl.get('hiam.roleManagement.model.roleManagement.code').d('角色编码')}
            >
              <Input disabled value={role.code} />
            </Form.Item>
          </Form>
        </div>
        <div className="table-list-operator">
          <Button key="add" icon="plus" onClick={this.handleAddBtnClick}>
            {intl.get('hzero.common.button.add').d('新增')}
          </Button>
          <Button
            key="remove"
            icon="delete"
            disabled={rowSelection.selectedRowKeys.length === 0}
            onClick={this.handleRemoveBtnClick}
            loading={loading.removeRoleCards}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
        </div>
        <EditTable
          bordered
          rowKey="id"
          columns={this.columns}
          scroll={{ x: tableScrollWidth(this.columns) }}
          onChange={this.handleTableChange}
          pagination={pagination}
          dataSource={dataSource}
          rowSelection={rowSelection}
          loading={loading.fetchRoleCards}
        />
      </Modal>
    );
  }

  /**
   * 查询角色拥有的卡片
   */
  fetchRoleCards(pagination = {}) {
    const { onFetchRoleCards, role } = this.props;
    const payload = { roleId: role.id, ...pagination };
    if (role.id !== undefined) {
      // 有角色 才能查询
      onFetchRoleCards(payload).then(res => {
        if (res) {
          this.setState({
            dataSource: res.content,
            pagination: createPagination(res),
          });
        }
      });
    }
  }

  // Modal 相关
  @Bind()
  handleModalOkBtnClick() {
    const { onCancel, onOk, role } = this.props;
    const { dataSource } = this.state;
    const updateOrCreateData = dataSource.filter(r => r._status);
    if (updateOrCreateData.length > 0) {
      // 有需要更新的数据
      const validationData = getEditTableData(updateOrCreateData, ['_status', 'id']);
      if (validationData.length === updateOrCreateData.length) {
        onOk(
          validationData.map(r => {
            const { _status, ...restR } = r;
            return { ...restR, roleId: role.id };
          })
        );
      }
    } else {
      onCancel();
    }
  }

  @Bind()
  handleModalCancelBtnClick() {
    const { onCancel } = this.props;
    onCancel();
  }

  // 头按钮相关
  @Bind()
  handleAddBtnClick() {
    const { dataSource, pagination } = this.state;
    this.setState({
      // 新增卡片 x,y 默认为0
      dataSource: [{ id: uuid(), _status: 'create', x: 0, y: 0 }, ...dataSource],
      pagination: addItemToPagination(dataSource.length, pagination),
    });
  }

  @Bind()
  handleRemoveBtnClick() {
    const {
      rowSelection: { selectedRows },
      dataSource,
      pagination,
    } = this.state;
    const addRows = [];
    const oriRows = [];
    selectedRows.forEach(record => {
      if (record._status === 'create') {
        addRows.push(record);
      } else {
        oriRows.push(record);
      }
    });
    if (oriRows.length > 0) {
      const { onRemoveRoleCards } = this.props;
      onRemoveRoleCards(oriRows).then(res => {
        if (res) {
          notification.success();
          // 删除成功
          this.setState({
            dataSource: dataSource.filter(r => !selectedRows.some(addR => addR.id === r.id)),
            pagination: delItemsToPagination(selectedRows.length, dataSource.length, pagination),
            rowSelection: {
              selectedRowKeys: [],
              selectedRows: [],
              onChange: this.handleRowSelectionChange,
            },
          });
        }
      });
    } else {
      notification.success();
      this.setState({
        dataSource: dataSource.filter(r => !addRows.some(addR => addR.id === r.id)),
        pagination: delItemsToPagination(addRows.length, dataSource.length, pagination),
        rowSelection: {
          selectedRowKeys: [],
          selectedRows: [],
          onChange: this.handleRowSelectionChange,
        },
      });
    }
  }

  // Table 相关

  @Bind()
  handleTableChange(page, filter, sort) {
    this.fetchRoleCards({ page, sort });
  }

  @Bind()
  handleRowSelectionChange(_, selectedRows) {
    this.setState({
      rowSelection: {
        selectedRows,
        onChange: this.handleRowSelectionChange,
        selectedRowKeys: selectedRows.map(r => r.id),
      },
    });
  }

  @Bind()
  handleLineEdit(record) {
    const { dataSource } = this.state;
    this.setState({
      dataSource: dataSource.map(r => {
        if (r.id === record.id) {
          return {
            ...r,
            _status: 'update',
          };
        } else {
          return r;
        }
      }),
    });
  }

  @Bind()
  handleLineEditCancel(record) {
    const { dataSource } = this.state;
    this.setState({
      dataSource: dataSource.map(r => {
        if (r.id === record.id) {
          const { _status, ...oriRecord } = r;
          return oriRecord;
        } else {
          return r;
        }
      }),
    });
  }

  @Bind()
  handleLineClean(record) {
    const { dataSource, rowSelection, pagination } = this.state;
    const nextSelectedRows = rowSelection.selectedRows.filter(r => r.id !== record.id);
    this.setState({
      dataSource: dataSource.filter(r => r.id !== record.id),
      pagination: delItemToPagination(dataSource.length, pagination),
      rowSelection: {
        ...rowSelection,
        selectedRows: nextSelectedRows,
        selectedRowKeys: nextSelectedRows.map(r => r.id),
      },
    });
  }

  columns = [
    {
      title: intl.get('hiam.roleManagement.model.tenantAssignCards.cardCode').d('卡片代码'),
      dataIndex: 'code',
      width: 180,
      render: (code, record) => {
        if (record._status === 'create') {
          const form = record.$form;
          const onCardChange = function onCardChange(_, card) {
            form.setFieldsValue({
              name: card.name,
              catalogMeaning: card.catalogMeaning,
              h: card.h,
              w: card.w,
              code: card.code,
              catalogType: card.catalogType,
            });
          };
          return (
            <Form.Item>
              {form.getFieldDecorator('cardId', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hiam.roleManagement.model.tenantAssignCards.cardCode')
                        .d('卡片代码'),
                    }),
                  },
                ],
              })(<Lov code="HPFM.ROLE_ASSIGN_CARD" onChange={onCardChange} textValue={code} />)}
            </Form.Item>
          );
        }
        return code;
      },
    },
    {
      title: intl.get('hiam.roleManagement.model.tenantAssignCards.cardName').d('卡片名称'),
      dataIndex: 'name',
      render: (name, record) => {
        if (record._status === 'create') {
          const form = record.$form;
          return (
            <React.Fragment>
              {form.getFieldValue('name')}
              {form.getFieldDecorator('code')(<div />)}
            </React.Fragment>
          );
        }
        return name;
      },
    },
    {
      title: intl.get('hiam.roleManagement.model.tenantAssignCards.cardType').d('卡片类别'),
      dataIndex: 'catalogMeaning',
      width: 100,
      render: (catalogMeaning, record) => {
        if (record._status === 'create') {
          const form = record.$form;
          return (
            <React.Fragment>
              {form.getFieldValue('catalogMeaning')}
              {form.getFieldDecorator('catalogType')(<div />)}
            </React.Fragment>
          );
        }
        return catalogMeaning;
      },
    },
    {
      title: intl.get('hiam.roleManagement.model.tenantAssignCards.cardH').d('高度'),
      dataIndex: 'h',
      width: 80,
      align: 'right',
      render: (h, record) => {
        if (record._status === 'create') {
          const form = record.$form;
          return (
            <React.Fragment>
              {form.getFieldValue('h')}
              {form.getFieldDecorator('h')(<div />)}
            </React.Fragment>
          );
        }
        return h;
      },
    },
    {
      title: intl.get('hiam.roleManagement.model.tenantAssignCards.cardW').d('长度'),
      dataIndex: 'w',
      width: 80,
      render: (w, record) => {
        if (record._status === 'create') {
          const form = record.$form;
          return (
            <React.Fragment>
              {form.getFieldValue('w')}
              {form.getFieldDecorator('w')(<div />)}
            </React.Fragment>
          );
        }
        return w;
      },
    },
    {
      title: intl.get('hiam.roleManagement.model.tenantAssignCards.cardX').d('位置X'),
      dataIndex: 'x',
      width: 80,
      render: (x, record) => {
        const { tenantRoleLevel } = this.props;
        if (!tenantRoleLevel && record._status) {
          const form = record.$form;
          const formOptions = {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hiam.roleManagement.model.tenantAssignCards.cardX').d('位置X'),
                }),
              },
            ],
          };
          formOptions.initialValue = record._status === 'update' ? x : 0;
          return (
            <Form.Item>
              {form.getFieldDecorator('x', formOptions)(
                <InputNumber
                  min={0}
                  max={CARD_MAX_HEIGHT}
                  precision={0}
                  step={1}
                  style={patchInputStyle}
                />
              )}
            </Form.Item>
          );
        } else {
          return x;
        }
      },
    },
    {
      title: intl.get('hiam.roleManagement.model.tenantAssignCards.cardY').d('位置Y'),
      dataIndex: 'y',
      width: 80,
      align: 'right',
      render: (y, record) => {
        const { tenantRoleLevel } = this.props;
        if (!tenantRoleLevel && record._status) {
          const form = record.$form;
          const formOptions = {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hiam.roleManagement.model.tenantAssignCards.cardY').d('位置Y'),
                }),
              },
            ],
          };
          formOptions.initialValue = record._status === 'update' ? y : 0;
          return (
            <Form.Item>
              {form.getFieldDecorator('y', formOptions)(
                <InputNumber
                  min={0}
                  max={CARD_MAX_HEIGHT}
                  precision={0}
                  step={1}
                  style={patchInputStyle}
                />
              )}
            </Form.Item>
          );
        } else {
          return y;
        }
      },
    },
    {
      title: intl.get('hiam.roleManagement.model.tenantAssignCards.cardInit').d('初始化'),
      dataIndex: 'defaultDisplayFlag',
      width: 80,
      render: (defaultDisplayFlag, record) => {
        if (record._status) {
          const form = record.$form;
          const formOptions = {};
          if (record._status === 'update') {
            formOptions.initialValue = defaultDisplayFlag;
          } else {
            formOptions.initialValue = 0;
          }
          return form.getFieldDecorator('defaultDisplayFlag', formOptions)(<Checkbox />);
        } else {
          return <Checkbox checked={defaultDisplayFlag === 1} disabled />;
        }
      },
    },
    {
      title: intl.get('hzero.common.button.action').d('操作'),
      width: 85,
      render: (_, record) => {
        const actionButtons = [];
        if (record._status === 'create') {
          actionButtons.push(
            <a key="action-create" onClick={this.handleLineClean.bind(undefined, record)}>
              {intl.get('hzero.common.button.clean').d('清除')}
            </a>
          );
        } else if (record._status === 'update') {
          actionButtons.push(
            <a key="action-cancel" onClick={this.handleLineEditCancel.bind(undefined, record)}>
              {intl.get('hzero.common.button.cancel').d('取消')}
            </a>
          );
        } else {
          actionButtons.push(
            <a key="action-edit" onClick={this.handleLineEdit.bind(undefined, record)}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          );
        }
        return <span className="action-link">{actionButtons}</span>;
      },
    },
  ].filter(column => !isBoolean(column));
}
