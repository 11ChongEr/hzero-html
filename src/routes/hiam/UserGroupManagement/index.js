/**
 * userGroupManagement 用户组管理
 * @date: 2019-1-14
 * @author: guochaochao <chaochao.guo@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Form, Button, Table, Popconfirm } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { Content, Header } from 'components/Page';

import notification from 'utils/notification';
import intl from 'utils/intl';
import { enableRender } from 'utils/renderer';
import { isTenantRoleLevel, tableScrollWidth } from 'utils/utils';

import MessageDrawer from './Drawer';
import FilterForm from './FilterForm';

@Form.create({ fieldNameProp: null })
@connect(({ userGroupManagement, loading }) => ({
  userGroupManagement,
  fetchUserGroupLoading: loading.effects['userGroupManagement/fetchUserGroupList'],
  createUserGroupLoading: loading.effects['userGroupManagement/createUserGroup'],
  getUserGroupLoading: loading.effects['userGroupManagement/getUserGroupDetail'],
  updateUserGroupLoading: loading.effects['userGroupManagement/updateUserGroup'],
}))
export default class userGroupManagement extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      fieldsValue: {},
    };
  }

  componentDidMount() {
    this.fetchUserGroupList();
  }

  /**
   * 获取用户组列表
   * @param {object} params
   * @memberof userGroupManagement
   */
  @Bind()
  fetchUserGroupList(params = {}) {
    const {
      dispatch,
      userGroupManagement: { pagination = {} },
    } = this.props;
    const { fieldsValue } = this.state;
    dispatch({
      type: 'userGroupManagement/fetchUserGroupList',
      payload: { ...fieldsValue, page: pagination, ...params },
    });
  }

  /**
   * 编辑打开模态框
   */
  @Bind()
  handleUpdateUserGroup(record) {
    const { dispatch } = this.props;
    this.handleModalVisible(true);
    dispatch({
      type: 'userGroupManagement/getUserGroupDetail',
      payload: { userGroupId: record.userGroupId },
    });
  }

  /**
   * 保存用户组
   */
  @Bind()
  handleSaveUserGroup(fieldsValue) {
    const {
      dispatch,
      userGroupManagement: { userGroupDetail = {} },
    } = this.props;
    dispatch({
      type: `userGroupManagement/${
        userGroupDetail.userGroupId !== undefined ? 'updateUserGroup' : 'createUserGroup'
      }`,
      payload: { ...userGroupDetail, ...fieldsValue },
    }).then(res => {
      if (res) {
        notification.success();
        this.hideModal();
        this.fetchUserGroupList();
      }
    });
  }

  /**
   * 删除
   */
  @Bind()
  handleDeleteUserGroup(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'userGroupManagement/deleteUserGroup',
      payload: { ...record, userGroupId: record.userGroupId },
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchUserGroupList();
      }
    });
  }

  /**
   * 分页
   */
  @Bind()
  handleTableChange(pagination) {
    this.fetchUserGroupList({
      page: pagination,
    });
  }

  /**
   * 查询消息
   */
  @Bind()
  handleSearch(form) {
    const fieldsValue = form.getFieldsValue();
    this.setState({ fieldsValue });
    this.fetchUserGroupList({ ...fieldsValue, page: {} });
  }

  /**
   * 重置表单
   */
  @Bind()
  handleResetSearch(form) {
    this.setState({ fieldsValue: {} });
    form.resetFields();
  }

  /**
   * 控制modal显示与隐藏
   * @param {boolean}} flag 是否显示modal
   */
  handleModalVisible(flag) {
    this.setState({ modalVisible: !!flag });
  }

  /**
   * 打开模态框
   */
  @Bind()
  showModal(record = {}) {
    const { dispatch } = this.props;
    if (record.userGroupId !== undefined) {
      dispatch({
        type: 'userGroupManagement/getMessageDetail',
        payload: { userGroupId: record.userGroupId },
      });
    }
    dispatch({
      type: 'userGroupManagement/updateState',
      payload: { userGroupDetail: {} },
    });
    this.handleModalVisible(true);
  }

  /**
   * 关闭模态框
   */
  @Bind()
  hideModal() {
    this.handleModalVisible(false);
  }

  @Bind()
  concatColumns() {
    if (!isTenantRoleLevel()) {
      return [
        {
          title: intl.get('hpfm.database.model.database.tenantName').d('租户名称'),
          width: 200,
          dataIndex: 'tenantName',
        },
      ];
    }
    return [];
  }

  render() {
    const {
      updateUserGroupLoading = false,
      fetchUserGroupLoading = false,
      getUserGroupLoading = false,
      createUserGroupLoading = false,
      userGroupManagement: { userGroupList = [], pagination = {}, userGroupDetail = {} },
    } = this.props;
    const { modalVisible } = this.state;
    const defaultUserGroupColumns = [
      {
        title: intl
          .get('hiam.userGroupManagement.model.userGroupManagement.groupCode')
          .d('用户组编码'),
        width: 200,
        dataIndex: 'groupCode',
      },
      {
        title: intl
          .get('hiam.userGroupManagement.model.userGroupManagement.groupName')
          .d('用户组名称'),
        width: 200,
        dataIndex: 'groupName',
      },
      {
        title: intl.get('hiam.userGroupManagement.model.userGroupManagement.remark').d('备注说明'),
        dataIndex: 'remark',
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        fixed: 'right',
        width: 80,
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        key: 'operator',
        fixed: 'right',
        width: 110,
        render: (text, record) => {
          return (
            <span className="action-link">
              <a onClick={() => this.handleUpdateUserGroup(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              <Popconfirm
                title={intl
                  .get('hsgp.nodeRule.view.message.confirm.remove')
                  .d('是否删除此条记录？')}
                onConfirm={() => this.handleDeleteUserGroup(record)}
              >
                <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
              </Popconfirm>
            </span>
          );
        },
      },
    ];
    const userGroupColumns = this.concatColumns().concat(defaultUserGroupColumns);
    const scroll = {
      x: tableScrollWidth(userGroupColumns),
    };
    return (
      <React.Fragment>
        <Header title={intl.get('hiam.userGroupManagement.view.message.title').d('用户组管理')}>
          <Button icon="plus" type="primary" onClick={this.showModal}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm search={this.handleSearch} reset={this.handleResetSearch} />
          </div>
          <Table
            bordered
            rowKey="userGroupId"
            loading={fetchUserGroupLoading}
            dataSource={userGroupList}
            columns={userGroupColumns}
            pagination={pagination}
            onChange={this.handleTableChange}
            scroll={scroll}
          />
          <MessageDrawer
            title={
              userGroupDetail.userGroupId
                ? intl.get('hiam.userGroupManagement.view.message.edit').d('编辑用户组')
                : intl.get('hiam.userGroupManagement.view.message.create').d('新建用户组')
            }
            initLoading={getUserGroupLoading}
            loading={
              userGroupDetail.userGroupId !== undefined
                ? updateUserGroupLoading
                : createUserGroupLoading
            }
            modalVisible={modalVisible}
            initData={userGroupDetail}
            onCancel={this.hideModal}
            onOk={this.handleSaveUserGroup}
          />
        </Content>
      </React.Fragment>
    );
  }
}
