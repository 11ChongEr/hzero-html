/**
 * 子账户管理-平台级
 * todo 角色，部分： 1。 别的公司管理员分配的角色怎么办
 * @date 2018-12-15
 * @author WY yang.wang06@hand-china.com
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Button, Table, Tree } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { map, isEmpty, join } from 'lodash';

import { Content, Header } from 'components/Page';
import ExcelExport from 'components/ExcelExport';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { HZERO_IAM } from 'utils/config';
import { dateRender } from 'utils/renderer';
import { getCurrentUser, tableScrollWidth } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import notification from 'utils/notification';

import FilterForm from './FilterForm';
import EditPasswordModal from './components/EditPasswordModal';
import EditModal from './components/EditModal';
import UserGroupModal from './components/UserGroupModal';

const { TreeNode } = Tree;

@connect(({ loading, subAccount }) => ({
  fetching: loading.effects['subAccount/fetchSubAccountList'],
  saving:
    loading.effects['subAccount/createSubAccount'] ||
    loading.effects['subAccount/updateSubAccount'],
  passwordLoading: loading.effects['subAccount/updatePassword'],
  queryDetailLoading: loading.effects['subAccount/querySubAccount'],
  currentUserId: (getCurrentUser() || {}).id,
  subAccount,
}))
@formatterCollections({ code: ['hiam.subAccount'] })
export default class SubAccountSite extends React.Component {
  filterFormRef;

  state = {
    editPasswordModalProps: {},
    editModalProps: {},
    groupModalProps: {},
    // pagination: false,
    // 导出相关
    // expandedKeys: [],
    // checkedKeys: [],
  };

  componentDidMount() {
    this.handleFetchList();
    const { dispatch } = this.props;
    dispatch({
      type: 'subAccount/init',
    });
  }

  render() {
    const {
      subAccount: {
        pagination = false,
        dataSource = [],
        lov: { level, levelMap, idd, gender } = {},
      },
      passwordLoading = false,
      queryDetailLoading = false,
      fetching,
      saving,
    } = this.props;
    const { editPasswordModalProps = {}, editModalProps = {}, groupModalProps = {} } = this.state;
    return (
      <React.Fragment>
        <Header title={intl.get('hiam.subAccount.view.message.title').d('子账户管理')}>
          <Button type="primary" onClick={this.showCreateForm} icon="plus">
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <ExcelExport
            requestUrl={`${HZERO_IAM}/hzero/v1/users/export`}
            queryParams={this.getExportQueryParams()}
            queryFormItem={this.renderExportTree()}
          />
        </Header>
        <Content>
          <div className="table-list-form">
            {<FilterForm onRef={this.handleFilterFormRef} onSearch={this.handleFetchList} />}
          </div>
          <Table
            bordered
            pagination={pagination}
            dataSource={dataSource}
            loading={fetching || queryDetailLoading}
            onChange={this.handleTableChange}
            columns={this.columns}
            scroll={{ x: tableScrollWidth(this.columns) }}
            rowKey="id"
          />
        </Content>
        {editPasswordModalProps.visible && (
          <EditPasswordModal
            key="edit-modal-password"
            {...editPasswordModalProps}
            onCancel={this.handlePasswordModalHidden}
            onOk={this.handlePasswordUpdate}
            confirmLoading={passwordLoading}
          />
        )}
        {editModalProps.visible && (
          <EditModal
            key="edit-modal"
            {...editModalProps}
            onCancel={this.hiddenEditModal}
            onOk={this.handleEditModalOK}
            getCurrentUserRoles={this.getCurrentUserRoles}
            level={level}
            levelMap={levelMap}
            idd={idd}
            gender={gender}
            fetchRoles={this.fetchRoles}
            fetchCurrentUserRoles={this.fetchCurrentUserRoles}
            onRoleRemove={this.handleRoleRemove}
            confirmLoading={saving}
          />
        )}
        {groupModalProps.visible && (
          <UserGroupModal
            key="group-modal"
            {...groupModalProps}
            onCancel={this.hiddenGroupModal}
            onOk={this.handleGroupModalOK}
            fetchGroups={this.fetchGroups}
            fetchCurrentUserGroups={this.fetchCurrentUserGroups}
            onGroupRemove={this.handleGroupRemove}
          />
        )}
      </React.Fragment>
    );
  }

  /**
   * 拿到查询表单的引用
   * @param {object} filterFormRef
   */
  @Bind()
  handleFilterFormRef(filterFormRef) {
    this.filterFormRef = filterFormRef;
  }

  /**
   * 查询帐号信息
   * @param {object} pagination
   */
  @Bind()
  handleFetchList(pagination) {
    this.setState({ pagination });
    const { dispatch } = this.props;
    let fieldsValue = {};
    if (this.filterFormRef) {
      const { form } = this.filterFormRef.props;
      fieldsValue = form.getFieldsValue();
      fieldsValue.startDateActive = fieldsValue.startDateActive
        ? fieldsValue.startDateActive.format(DEFAULT_DATE_FORMAT)
        : undefined;
      fieldsValue.endDateActive = fieldsValue.endDateActive
        ? fieldsValue.endDateActive.format(DEFAULT_DATE_FORMAT)
        : undefined;
    }
    dispatch({
      type: 'subAccount/fetchSubAccountList',
      payload: {
        ...pagination,
        ...fieldsValue,
      },
    });
  }

  /**
   * 从新加载页面，保留分页信息
   */
  @Bind()
  reloadList() {
    const { pagination } = this.state;
    this.handleFetchList(pagination);
  }

  /**
   * 页码改变
   * @param {object} page
   * @param {object} filter
   * @param {object} sort
   */
  @Bind()
  handleTableChange(page, filter, sort) {
    this.handleFetchList({ page, sort });
  }

  columns = [
    {
      title: intl.get('hiam.subAccount.model.user.loginName').d('账号'),
      dataIndex: 'loginName',
      width: 120,
    },
    {
      title: intl.get('hiam.subAccount.model.user.realName').d('名称'),
      dataIndex: 'realName',
      // width: 220,
    },
    {
      title: intl.get('hiam.subAccount.model.user.email').d('邮箱'),
      dataIndex: 'email',
      width: 200,
    },
    {
      title: intl.get('hiam.subAccount.model.user.phone').d('手机号码'),
      dataIndex: 'phone',
      width: 200,
      render: (phone, record) => {
        if (record.internationalTelMeaning && record.phone) {
          // todo 需要改成好看的样子
          return `${record.internationalTelMeaning} | ${record.phone}`;
        }
        return phone;
      },
    },
    {
      title: intl.get('hiam.subAccount.model.user.startDateActive').d('有效期从'),
      dataIndex: 'startDateActive',
      width: 100,
      render: dateRender,
    },
    {
      title: intl.get('hiam.subAccount.model.user.endDateActive').d('有效期至'),
      dataIndex: 'endDateActive',
      width: 100,
      render: dateRender,
    },
    {
      title: intl.get('hiam.subAccount.model.user.enabled').d('冻结'),
      dataIndex: 'enabled',
      width: 60,
      render: item => (
        <span>
          {item === true
            ? intl.get('hzero.common.status.no').d('否')
            : intl.get('hzero.common.status.yes').d('是')}
        </span>
      ),
    },
    {
      title: intl.get('hiam.subAccount.model.user.locked').d('锁定'),
      dataIndex: 'locked',
      width: 60,
      render: item => (
        <span>
          {item === false
            ? intl.get('hzero.common.status.no').d('否')
            : intl.get('hzero.common.status.yes').d('是')}
        </span>
      ),
    },
    {
      title: intl.get('hiam.subAccount.model.user.tenant').d('所属租户'),
      dataIndex: 'tenantName',
      width: 200,
    },
    {
      title: intl.get('hzero.common.button.action').d('操作'),
      key: 'edit',
      // FIXME: 超过三个操作 需要使用Dropdown
      width: 260,
      fixed: 'right',
      render: (text, record) => {
        return (
          <span className="action-link">
            <a
              key="edit"
              onClick={() => {
                this.showEditModal(record);
              }}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
            <a
              key="userGroup"
              onClick={() => {
                this.showGroupModal(record);
              }}
            >
              {intl.get('hiam.subAccount.view.option.userGroup').d('用户组')}
            </a>
            <a
              key="password"
              onClick={() => {
                this.handleRecordUpdatePassword(record);
              }}
            >
              {intl.get('hiam.subAccount.view.option.passwordUpdate').d('修改密码')}
            </a>
            {record.locked ? (
              <a
                key="unlock"
                onClick={() => {
                  this.handleUnlock(record);
                }}
              >
                {intl.get('hiam.subAccount.view.option.unlock').d('解除锁定')}
              </a>
            ) : null}
          </span>
        );
      },
    },
  ];

  /**
   * 打开密码编辑模态框
   * @param {onkect} editRecord
   */
  @Bind()
  handleRecordUpdatePassword(editRecord) {
    const { currentUserId } = this.props;
    this.setState({
      editPasswordModalProps: {
        isSameUser: editRecord.id === currentUserId,
        visible: true,
        editRecord,
      },
    });
  }

  /**
   * 隐藏密码模态框
   */
  @Bind()
  handlePasswordModalHidden() {
    this.setState({
      editPasswordModalProps: {
        visible: false,
      },
    });
  }

  /**
   * 更新密码
   * @param {object} fieldsValue
   */
  @Bind()
  handlePasswordUpdate(fieldsValue) {
    const { dispatch } = this.props;
    const {
      editPasswordModalProps: { editRecord = {}, isSameUser = true },
    } = this.state;
    const { id, organizationId } = editRecord;
    dispatch({
      type: 'subAccount/updatePassword',
      payload: {
        isSameUser,
        userId: id,
        userOrganizationId: organizationId,
        ...fieldsValue,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.handlePasswordModalHidden();
      }
    });
  }

  /**
   * 打开新建模态框
   */
  @Bind()
  showCreateForm() {
    this.setState({
      editModalProps: {
        visible: true,
        isCreate: true,
        isSameUser: false,
      },
    });
  }

  /**
   * 编辑帐号
   * 打开帐号模态框
   * @param {object} editRecord
   */
  @Bind()
  showEditModal(editRecord) {
    const { currentUserId, dispatch } = this.props;
    dispatch({
      type: 'subAccount/querySubAccount',
      payload: {
        userId: editRecord.id,
      },
    }).then(detail => {
      if (detail) {
        this.setState({
          editModalProps: {
            isSameUser: editRecord.id === currentUserId,
            visible: true,
            isCreate: false,
            editRecord: detail,
          },
        });
      }
    });
  }

  /**
   * 分配用户组
   * 打开用户组弹窗
   * @param {object} userRecord
   */
  @Bind()
  showGroupModal(userRecord) {
    const { currentUserId } = this.props;
    this.setState({
      groupModalProps: {
        isSameUser: userRecord.id === currentUserId,
        visible: true,
        isCreate: false,
        userRecord,
      },
    });
  }

  /**
   * 关闭用户组模态框
   */
  @Bind()
  hiddenGroupModal() {
    this.setState({
      groupModalProps: {
        visible: false,
      },
    });
  }

  /**
   * 获取已经分配的角色
   * @param {object} payload
   * @param {number} payload.userId 当前编辑帐号id
   * @param {pagination} payload.pagination 分页信息
   */
  @Bind()
  fetchCurrentUserRoles(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'subAccount/getCurrentUserRoles',
      payload,
    });
  }

  // TODO接口联调
  /**
   * 获取已经分配的用户组
   * @param {object} payload
   * @param {number} payload.userId 当前编辑帐号id
   * @param {pagination} payload.pagination 分页信息
   */
  @Bind()
  fetchCurrentUserGroups(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'subAccount/getCurrentUserGroups',
      payload,
    });
  }

  /**
   * 关闭编辑模态框
   */
  @Bind()
  hiddenEditModal() {
    this.setState({
      editModalProps: {
        visible: false,
      },
    });
  }

  /**
   * 保存 新建帐号 或 更新帐号
   * @param saveData
   */
  @Bind()
  handleEditModalOK(saveData) {
    const {
      editModalProps: { isCreate = true },
    } = this.state;
    const { dispatch } = this.props;
    if (isCreate) {
      dispatch({
        type: 'subAccount/createSubAccount',
        payload: saveData,
      }).then(res => {
        if (res) {
          notification.success();
          this.hiddenEditModal();
          this.reloadList();
        }
      });
    } else {
      dispatch({
        type: 'subAccount/updateSubAccount',
        payload: saveData,
      }).then(res => {
        if (res) {
          notification.success();
          this.hiddenEditModal();
          this.reloadList();
        }
      });
    }
  }

  /**
   * 保存 用户组信息
   * @param saveData
   */
  @Bind()
  handleGroupModalOK(saveData) {
    const { dispatch } = this.props;
    dispatch({
      type: 'subAccount/addUserGroup',
      payload: saveData,
    }).then(res => {
      if (res) {
        notification.success();
        this.hiddenGroupModal();
        this.reloadList();
      }
    });
  }

  /**
   * 解锁帐号
   * @param {object} unLockRecord
   */
  @Bind()
  handleUnlock(unLockRecord) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'subAccount/unlockSubAccount',
      payload: { userId: unLockRecord.id },
    }).then(res => {
      if (res) {
        this.reloadList();
      }
    });
  }

  /**
   * 查询 可分配角色
   * @param {object} params
   */
  @Bind()
  fetchRoles(params) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'subAccount/fetchRoles',
      payload: params,
    });
  }

  // TODO 接口
  /**
   * 查询 可分配的用户组
   * @param {object} params
   */
  @Bind()
  fetchGroups(params) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'subAccount/fetchGroups',
      payload: params,
    });
  }

  /**
   * 删除角色
   * @param {object[]} memberRoleList
   */
  @Bind()
  handleRoleRemove(memberRoleList) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'subAccount/removeRoles',
      payload: { memberRoleList },
    });
  }

  // TODO 接口
  /**
   * 删除用户组
   * @param {object[]} memberGroupList
   */
  @Bind()
  handleGroupRemove(params) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'subAccount/deleteUserGroup',
      payload: params,
    });
  }

  // 导出

  /**
   * 获取导出字段查询参数
   */
  @Bind()
  getExportQueryParams() {
    const { checkedKeys } = this.state;
    let fieldsValue = {};
    if (this.filterFormRef) {
      fieldsValue = this.filterFormRef.props.form.getFieldsValue();
    }
    return {
      ...fieldsValue,
      authorityTypeQueryParams: join(checkedKeys, ','),
    };
  }

  /**
   * 节点展开
   * @param {string[]} expandedKeys - 展开的节点组成的数组
   */
  @Bind()
  handleExpand(expandedKeys) {
    this.setState({
      expandedKeys,
    });
  }

  /**
   * 选择项变化监控
   * @param {string[]} checkedKeys - 选中项的 key 数组
   */
  @Bind()
  handleSelect(checkedKeys) {
    this.setState({ checkedKeys });
  }

  /**
   * 渲染权限维度的树
   */
  @Bind()
  renderExportTree() {
    const {
      subAccount: { lov: { authorityType = [] } = {} },
    } = this.props;
    const { expandedKeys, checkedKeys } = this.state;
    if (isEmpty(authorityType)) {
      return null;
    } else {
      return (
        <Tree
          checkable
          onExpand={this.handleExpand}
          expandedKeys={expandedKeys}
          defaultExpandedKeys={['authorityType']}
          onCheck={this.handleSelect}
          checkedKeys={checkedKeys}
        >
          <TreeNode
            title={intl.get('hiam.subAccount.model.user.authorityType').d('权限维度')}
            key="authorityType"
          >
            {map(authorityType, item => {
              return <TreeNode title={item.meaning} key={item.value} />;
            })}
          </TreeNode>
        </Tree>
      );
    }
  }
}
