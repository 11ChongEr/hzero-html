/**
 * index - 角色管理 - 分配权限
 * @date: 2018-10-26
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table, Checkbox, Button, Form, Input } from 'hzero-ui';
import { isInteger, isEmpty } from 'lodash';

import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';

import Drawer from '../Drawer';
import styles from './index.less';

// 折叠面板组件初始化
const FormItem = Form.Item;

const modelPrompt = 'hiam.roleManagement.model.roleManagement';
const viewTitlePrompt = 'hiam.roleManagement.view.title';
const commonPrompt = 'hzero.common';

const PermissionsQueryForm = ({ form = {}, search = e => e }) => {
  const { getFieldDecorator = e => e, resetFields = e => e, getFieldsValue = e => e } = form;
  return (
    <Form layout="inline">
      <FormItem label={intl.get(`${modelPrompt}.permissionSetName`).d('权限层级名称')}>
        {getFieldDecorator('name')(<Input />)}
      </FormItem>
      <FormItem>
        <Button
          type="primary"
          htmlType="submit"
          onClick={() => {
            search(getFieldsValue());
          }}
        >
          {intl.get(`${commonPrompt}.button.search`).d('查询')}
        </Button>
      </FormItem>
      <FormItem>
        <Button onClick={() => resetFields()}>
          {intl.get(`${commonPrompt}.button.reset`).d('重置')}
        </Button>
      </FormItem>
    </Form>
  );
};

const WrapperPermissionsQueryForm = Form.create({ fieldNameProp: null })(PermissionsQueryForm);

export default class Permissions extends PureComponent {
  constructor(props) {
    super(props);
    // 方法注册
    [
      'handleFetchDataSource',
      'handleClose',
      'operationRender',
      'onExpand',
      'collapseAll',
      'expandAll',
    ].forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  state = {
    dataSource: [],
    expandedRowKeys: [],
    defaultExpandedRowKeys: [],
  };

  getSnapshotBeforeUpdate(prevProps) {
    const { visible, roleId } = this.props;
    return visible && isInteger(roleId) && roleId !== prevProps.roleId;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot) {
      this.handleFetchDataSource();
    }
  }

  defaultTableRowKey = 'id';

  handleFetchDataSource(params = {}) {
    const { fetchDataSource = e => e, roleId } = this.props;
    fetchDataSource(roleId, params).then(res => {
      if (res) {
        const { dataSource = [], defaultExpandedRowKeys = [] } = res;
        this.setState({
          dataSource,
          defaultExpandedRowKeys,
        });
      }
    });
  }

  handleClose() {
    const { close = e => e } = this.props;
    this.setState({
      dataSource: [],
      expandedRowKeys: [],
    });
    close();
  }

  onCheckboxChange(record) {
    const {
      batchAssignPermissionSets = e => e,
      batchUnassignPermissionSets = e => e,
      roleId,
    } = this.props;

    const setIdList = [];
    const getSubSetIdList = (collections = []) => {
      // collections.forEach(n => {
      //   if (n.psLeafFlag === 1) {
      //     setIdList.push(n.id);
      //   }
      //   if (!isEmpty(n.subMenus)) {
      //     getSubSetIdList(n.subMenus);
      //   }
      // });
      collections.forEach(n => {
        if (n.type === 'ps') {
          setIdList.push(n.id);
        }
        if (!isEmpty(n.subMenus)) {
          getSubSetIdList(n.subMenus);
        }
      });
    };

    if (record.type === 'ps') {
      setIdList.push(record.id);
    }

    if (!isEmpty(record.subMenus)) {
      getSubSetIdList(record.subMenus);
    }
    if (record.checkedFlag !== 'Y') {
      batchAssignPermissionSets(roleId, setIdList, this.handleFetchDataSource);
    } else {
      batchUnassignPermissionSets(roleId, setIdList, this.handleFetchDataSource);
    }
  }

  /**
   * expandAll - 全部展开
   */
  expandAll() {
    const { defaultExpandedRowKeys } = this.state;
    this.setState({
      expandedRowKeys: defaultExpandedRowKeys,
    });
  }

  /**
   * expandAll - 全部收起
   */
  collapseAll() {
    this.setState({
      expandedRowKeys: [],
    });
  }

  /**
   * onExpand - 展开树
   * @param {boolean} expanded - 是否展开
   * @param {record} record - 当前行数据
   */
  onExpand(expanded, record) {
    const { expandedRowKeys = [] } = this.state;
    this.setState({
      expandedRowKeys: expanded
        ? expandedRowKeys.concat(record.key)
        : expandedRowKeys.filter(o => o !== record.key),
    });
  }

  operationRender(text, record) {
    const checkboxProps = {
      indeterminate: record.checkedFlag === 'P',
      checked: record.checkedFlag === 'Y',
      onChange: this.onCheckboxChange.bind(this, record),
    };
    // if (record.psLeafFlag !== 1) {
    //   checkboxProps.disabled = true;
    // }
    return <Checkbox {...checkboxProps} />;
  }

  render() {
    const { prompt = {}, roleName, visible, processing = {} } = this.props;
    const { dataSource = [], expandedRowKeys = [] } = this.state;

    const drawerProps = {
      title: intl
        .get(`${viewTitlePrompt}.title.assignedPermissionsToRole`, { name: roleName })
        .d(`给“${roleName}”分配权限`),
      visible,
      onCancel: this.handleClose,
      width: 750,
      anchor: 'right',
      wrapClassName: styles['hiam-role-permissions-editor'],
      footer: (
        <Button type="primary" onClick={this.handleClose}>
          {intl.get(`${commonPrompt}.button.close`).d('关闭')}
        </Button>
      ),
    };
    const columns = [
      // {
      //   title: '编码',
      //   dataIndex: 'code',
      //   width: 300,
      // },
      {
        title: intl.get(`${modelPrompt}.permissionSetName`).d('权限层级名称'),
        dataIndex: 'name',
      },
      {
        title: intl.get(`${commonPrompt}.table.column.option`).d('操作'),
        width: 85,
        render: this.operationRender,
        // (text, record) =>
        //   record.psLeafFlag === 1 && (
        //     <Checkbox
        //       indeterminate={record.checkedFlag === 'P'}
        //       checked={record.checkedFlag === 'Y'}
        //       onChange={this.onCheckboxChange.bind(this, record)}
        //     />
        //   ),
      },
    ];
    const tableProps = {
      columns,
      dataSource,
      scroll: { x: tableScrollWidth(columns, 300) },
      loading:
        processing.query ||
        processing.batchAssignPermissionSets ||
        processing.batchUnassignPermissionSets,
      bordered: true,
      childrenColumnName: 'subMenus',
      pagination: false,
      expandedRowKeys,
      onExpand: this.onExpand,
    };
    return (
      <Drawer {...drawerProps}>
        <WrapperPermissionsQueryForm search={this.handleFetchDataSource} prompt={prompt} />
        <br />
        <div className="action">
          <Button icon="up" onClick={this.collapseAll} style={{ marginRight: 8 }}>
            {intl.get(`${commonPrompt}.button.collapseAll`).d('全部收起')}
          </Button>
          <Button icon="down" onClick={this.expandAll}>
            {intl.get(`${commonPrompt}.button.expandAll`).d('全部展开')}
          </Button>
        </div>
        <br />
        <Table {...tableProps} />
      </Drawer>
    );
  }
}
