/*
 * List - 租户级子账户列表
 * @date: 2018/11/19 20:31:56
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import { Table, Form, Icon, Menu, Dropdown } from 'hzero-ui';

import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';
import { tableScrollWidth } from 'utils/utils';

/**
 * 租户级子账户列表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} showEditModal 显示编辑模态框
 * @reactProps {Object} form 表单
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class ListTable extends React.Component {
  render() {
    const {
      loading,
      searchPaging,
      handleRecordEditBtnClick,
      showGroupModal,
      handleRecordAuthManageBtnClick,
      // handleRecordGrantBtnClick,
      handleRecordUpdatePassword,
      dataSource = [],
      pagination = {},
    } = this.props;
    const columns = [
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
        title: intl.get('hzero.common.date.active.from').d('有效日期从'),
        dataIndex: 'startDateActive',
        width: 100,
        render: dateRender,
      },
      {
        title: intl.get('hzero.common.date.active.to').d('有效日期至'),
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
        title: intl.get('hzero.common.button.action').d('操作'),
        key: 'edit',
        width: 100,
        fixed: 'right',
        render: (_, record) => {
          const menu = (
            <Menu>
              <Menu.Item>
                <a
                  onClick={() => {
                    handleRecordEditBtnClick(record);
                  }}
                >
                  <Icon type="edit" /> {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              </Menu.Item>
              <Menu.Item>
                <a
                  onClick={() => {
                    showGroupModal(record);
                  }}
                >
                  <Icon type="team" />
                  {intl.get('hiam.subAccount.view.option.userGroup').d('用户组')}
                </a>
              </Menu.Item>
              <Menu.Item>
                <a
                  onClick={() => {
                    handleRecordAuthManageBtnClick(record);
                  }}
                >
                  <Icon type="solution" />
                  {intl.get('hiam.subAccount.view.option.authMaintain').d('权限维护')}
                </a>
              </Menu.Item>
              {/* <Menu.Item> */}
              {/* <a */}
              {/* onClick={() => { */}
              {/* handleRecordGrantBtnClick(record); */}
              {/* }} */}
              {/* > */}
              {/* <Icon type="exclamation-circle-o" /> */}
              {/* {intl.get('hiam.subAccount.view.option.grantMaintain').d('授权维护')} */}
              {/* </a> */}
              {/* </Menu.Item> */}
              <Menu.Item>
                <a
                  onClick={() => {
                    handleRecordUpdatePassword(record);
                  }}
                >
                  <Icon type="key" />
                  {intl.get('hiam.subAccount.view.option.passwordUpdate').d('修改密码')}
                </a>
              </Menu.Item>
            </Menu>
          );
          return (
            <Dropdown overlay={menu} placement="bottomRight">
              <a className="ant-dropdown-link">
                {intl.get('hzero.common.button.action').d('操作')} <Icon type="down" />
              </a>
            </Dropdown>
          );
        },
      },
    ];
    const tableProps = {
      loading,
      dataSource,
      pagination,
      columns,
      bordered: true,
      rowKey: 'id',
      scroll: { x: tableScrollWidth(columns) },
      onChange: searchPaging,
    };
    return <Table {...tableProps} />;
  }
}
