import React from 'react';
import PropTypes from 'prop-types';
import { isEmpty, isFunction, isUndefined } from 'lodash';
import { Modal, Table, notification, Form, Button, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';

import intl from 'utils/intl';
import { createPagination, tableScrollWidth } from 'utils/utils';

const FormItem = Form.Item;

const rowProps = {
  style: {
    cursor: 'pointer',
  },
};

/**
 * RoleModal-选择新的角色 弹框
 * @reactProps {Boolean} visible 模态框是否显示
 * @reactProps {Boolean} dataSource 角色的数据源
 * @reactProps {Function(selectedRows:Object[]):Promise|*} onSave 确认按钮的回调,接收选中的角色,返回一个Promise对象或者任意值
 * @reactProps {Function} onCancel 取消按钮的回调
 */
@Form.create({ fieldNameProp: null })
export default class RoleModal extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
      dataSource: [],
      pagination: false,
    };
  }

  static propTypes = {
    onSave: PropTypes.func.isRequired,
    fetchRoles: PropTypes.func.isRequired,
    excludeRoleIds: PropTypes.array.isRequired,
    excludeUserIds: PropTypes.array.isRequired,
  };

  componentDidMount() {
    this.fetchRoleList();
  }

  @Bind()
  handleSearchBtnClick() {
    this.fetchRoleList();
  }

  @Bind()
  fetchRoleList(pagination = { page: 0, size: 10 }) {
    const {
      fetchRoles,
      form,
      excludeRoleIds = [], // 新分配的角色
      excludeUserIds = [], // 当前编辑帐号的帐号id( 需要排除的帐号对应的角色 )
    } = this.props;
    const queryParams = {
      ...pagination,
      excludeRoleIds,
      excludeUserIds,
    };
    const name = form.getFieldValue('name');
    const tenantId = form.getFieldValue('tenantId');
    if (!isUndefined(name)) {
      queryParams.name = name;
    }
    if (!isUndefined(tenantId)) {
      queryParams.tenantId = tenantId;
    }
    this.setState({
      fetchRolesLoading: true,
    });
    fetchRoles(queryParams)
      .then(res => {
        if (res) {
          this.setState({
            dataSource: res.content,
            pagination: createPagination(res),
            selectedRowKeys: [],
            selectedRows: [],
          });
        }
      })
      .finally(() => {
        this.setState({
          fetchRolesLoading: false,
        });
      });
  }

  @Bind()
  handleRow() {
    return rowProps;
  }

  @Bind()
  handleRowClick(record) {
    const { selectedRowKeys = [], selectedRows = [] } = this.state;
    if (selectedRowKeys.some(id => id === record.id)) {
      // 已经选中 需要移除
      this.setState({
        selectedRowKeys: selectedRowKeys.filter(id => id !== record.id),
        selectedRows: selectedRows.filter(item => item !== record),
      });
    } else {
      // 没有选中 需要新增
      this.setState({
        selectedRowKeys: [...selectedRowKeys, record.id],
        selectedRows: [...selectedRows, record],
      });
    }
  }

  @Bind()
  handleRowSelectionChange(_, selectedRows) {
    this.setState({
      selectedRowKeys: selectedRows.map(r => r.id),
      selectedRows,
    });
  }

  @Bind()
  handleTableChange({ current = 1, pageSize = 10 } = {}) {
    this.fetchRoleList({ page: current - 1, size: pageSize });
  }

  /**
   * 保存
   */
  @Bind()
  handleSaveBtnClick() {
    const { selectedRows } = this.state;
    this.save(selectedRows);
  }

  /**
   *
   * @param {Object[]} selectedRows
   */
  @Bind()
  save(selectedRows) {
    const { onSave } = this.props;
    if (isEmpty(selectedRows)) {
      notification.warning({
        message: intl
          .get('hiam.subAccount.view.message.chooseNewRoleFirst')
          .d('请先选择新增的角色'),
      });
    } else if (isFunction(onSave)) {
      onSave(selectedRows);
      this.setState({
        selectedRowKeys: [],
        selectedRows: [],
      });
    }
  }

  /**
   * 取消保存
   */
  @Bind()
  handleCancelBtnClick() {
    const { onCancel } = this.props;
    if (isFunction(onCancel)) {
      this.setState({
        selectedRowKeys: [],
        selectedRows: [],
      });
      onCancel();
    }
  }

  @Bind()
  handleResetBtnClick() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields();
  }

  render() {
    const {
      visible,
      form: { getFieldDecorator },
    } = this.props;
    const { selectedRowKeys, dataSource = [], pagination = false, fetchRolesLoading } = this.state;
    const columns = [
      {
        title: intl.get('hiam.subAccount.model.role.name').d('角色名称'),
        dataIndex: 'name',
        width: 200,
      },
      {
        title: intl.get('hiam.subAccount.model.role.tenantName').d('所属租户'),
        dataIndex: 'tenantName',
        width: 400,
      },
    ];
    return (
      <Modal
        visible={visible}
        onOk={this.handleSaveBtnClick}
        onCancel={this.handleCancelBtnClick}
        width={660}
        title={intl.get('hiam.subAccount.view.message.title.roleModal').d('选择角色')}
      >
        <Form layout="inline">
          <FormItem label={intl.get('hiam.subAccount.model.role.name').d('角色名称')}>
            {getFieldDecorator('name')(<Input />)}
          </FormItem>
          <FormItem label={intl.get('hiam.subAccount.model.user.tenant').d('所属租户')}>
            {getFieldDecorator('tenantId')(<Lov code="HPFM.TENANT" textField="tenantName" />)}
          </FormItem>
          <FormItem>
            <Button htmlType="submit" type="primary" onClick={this.handleSearchBtnClick}>
              {intl.get('hzero.common.button.search').d('查询')}
            </Button>
          </FormItem>
          <FormItem>
            <Button onClick={this.handleResetBtnClick}>
              {intl.get('hzero.common.button.reset').d('重置')}
            </Button>
          </FormItem>
        </Form>
        <Table
          bordered
          rowKey="id"
          loading={fetchRolesLoading}
          columns={columns}
          pagination={pagination}
          dataSource={dataSource}
          scroll={{ y: 400, x: tableScrollWidth(columns) }}
          onRow={this.handleRow}
          onRowClick={this.handleRowClick}
          rowSelection={{
            selectedRowKeys,
            onChange: this.handleRowSelectionChange,
          }}
          onChange={this.handleTableChange}
        />
      </Modal>
    );
  }
}
