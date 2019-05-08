/**
 * Orgination - 组织架构维护
 * @date: 2018-6-19
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Form, Button, InputNumber, Input, Select } from 'hzero-ui';
import { connect } from 'dva';
import uuidv4 from 'uuid/v4';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import { Header, Content } from 'components/Page';
import TLEditor from 'components/TLEditor';
import EditTable from 'components/EditTable';
import Checkbox from 'components/Checkbox';
import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getEditTableData, filterNullValueObject } from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';
import FilterForm from './FilterForm';
import Drawer from './Drawer';
import styles from './index.less';

/**
 * 组织架构维护组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} organization - 数据源
 * @reactProps {!boolean} loading - 数据加载是否完成
 * @reactProps {!boolean} saveLoading - 数据保存是否完成
 * @reactProps {!String} tenantId - 租户ID
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */

@connect(({ organization, loading }) => ({
  organization,
  loading: {
    loading: loading.effects['organization/searchOrganizationData'],
    save: loading.effects['organization/saveAddData'],
    edit: loading.effects['organization/saveEditData'],
  },
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({ code: ['hpfm.organization', 'hpfm.common', 'entity.organization'] })
export default class Organization extends Component {
  form;

  /**
   * state初始化
   * @param {object} props 组件Props
   */
  constructor(props) {
    super(props);
    this.state = {};
  }

  /**
   * componentDidMount 生命周期函数
   * render执行后获取页面数据
   */
  componentDidMount() {
    const { dispatch, tenantId } = this.props;
    this.handleSearch();
    dispatch({
      type: 'organization/fetchOrgInfo',
      payload: { tenantId },
    });
  }

  /**
   * 根据节点路径，在树形结构树中的对应节点添加或替换children属性
   * @param {Array} collections 树形结构树
   * @param {Array} cursorPath 节点路径
   * @param {Array} data  追加或替换的children数据
   * @returns {Array} 新的树形结构
   */
  findAndSetNodeProps(collections, cursorPath = [], data) {
    let newCursorList = cursorPath;
    const cursor = newCursorList[0];
    const tree = collections.map(n => {
      const m = n;
      if (m.unitId === cursor) {
        if (newCursorList[1]) {
          if (!m.children) {
            m.children = [];
          }
          newCursorList = newCursorList.filter(o => newCursorList.indexOf(o) !== 0);
          m.children = this.findAndSetNodeProps(m.children, newCursorList, data);
        } else {
          m.children = [...data];
        }
        if (m.children.length === 0) {
          const { children, ...others } = m;
          return { ...others };
        } else {
          return m;
        }
      }
      return m;
    });
    return tree;
  }

  /**
   * 根据节点路径，在树形结构树中的对应节点
   * @param {Array} collection 树形结构树
   * @param {Array} cursorList 节点路径
   * @param {String} keyName 主键名称
   * @returns {Object} 节点信息
   */
  findNode(collection, cursorList = [], keyName) {
    let newCursorList = cursorList;
    const cursor = newCursorList[0];
    for (let i = 0; i < collection.length; i++) {
      if (collection[i][keyName] === cursor) {
        if (newCursorList[1]) {
          newCursorList = newCursorList.slice(1);
          return this.findNode(collection[i].children, newCursorList, keyName);
        }
        return collection[i];
      }
    }
  }

  /**
   * 查询数据
   * 根据输入框的内容进行查询，查询结果直接替换内容树
   * @param {Object} fields - 查询参数
   */
  @Bind()
  handleSearch(fields = {}) {
    const { dispatch, tenantId } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'organization/searchOrganizationData',
      payload: {
        tenantId,
        ...fieldValues,
        ...fields,
      },
    });
  }

  /**
   * 添加组织
   */
  @Bind()
  handleAddOrg() {
    const { dispatch, organization, tenantId } = this.props;
    const { renderTree = [], addData = {}, expandedRowKeys = [] } = organization;
    // 先获取直接下级节点，将新增的节点添加在子节点列表末位
    const unitId = uuidv4();
    const newItem = {
      tenantId,
      unitId,
      unitCode: '',
      unitName: '',
      unitTypeMeaning: '',
      unitTypeCode: '',
      orderSeq: '',
      distribute: '',
      operator: '',
      supervisorFlag: 0, // 默认非主管组织
      enabledFlag: 1, // 新增节点默认启用
      _status: 'create', // 新增节点的标识
    };
    dispatch({
      type: 'organization/updateState',
      payload: {
        ...organization,
        renderTree: [newItem, ...renderTree],
        addData: {
          newItem,
          ...addData,
        },
        expandedRowKeys: [...expandedRowKeys, unitId],
      },
    });
  }

  /**
   * 特定组织添加下级组织
   * @param {Object} record  操作对象
   */
  @Bind()
  handleAddLine(record = {}) {
    const { dispatch, organization, tenantId } = this.props;
    const { renderTree = [], pathMap = {}, addData = {}, expandedRowKeys = [] } = organization;
    const unitId = uuidv4();
    const newItem = {
      tenantId,
      unitId,
      unitCode: '',
      unitName: '',
      unitTypeMeaning: '',
      unitTypeCode: '',
      orderSeq: '',
      supervisorFlag: 0, // 默认非主管组织
      enabledFlag: 1, // 新增节点默认启用
      parentUnitName: record.unitName,
      parentUnitId: record.unitId,
      _status: 'create', // 新增节点的标识
    };

    const newChildren = [...(record.children || []), newItem];
    const newRenderTree = this.findAndSetNodeProps(renderTree, pathMap[record.unitId], newChildren);
    dispatch({
      type: 'organization/updateState',
      payload: {
        renderTree: [...newRenderTree],
        expandedRowKeys: [...expandedRowKeys, record.unitId],
        addData: {
          ...addData,
          newItem,
        },
      },
    });
  }

  /**
   * 按钮- 保存
   * 批量保存新增组织
   */
  @Bind()
  handleSave() {
    const { dispatch, organization, tenantId } = this.props;
    const { expandedRowKeys = [], renderTree = [] } = organization;
    // 处理表单效验，获取处理后的表单数据
    const params = getEditTableData(renderTree, ['children', 'unitId']);
    if (Array.isArray(params) && params.length !== 0) {
      dispatch({
        type: 'organization/saveAddData',
        payload: {
          tenantId,
          data: params,
        },
      }).then(res => {
        if (res) {
          notification.success();
          this.handleSearch({ expandedRowKeys, addData: {}, expandFlag: true });
        }
      });
    }
  }

  /**
   * 展开全部
   * 将页面展示的数据进行展开
   */
  @Bind()
  handleExpand() {
    const {
      dispatch,
      organization: { pathMap = {} },
    } = this.props;
    dispatch({
      type: 'organization/updateState',
      payload: {
        expandedRowKeys: Object.keys(pathMap).map(item => +item),
      },
    });
  }

  /**
   * 收起全部
   * 页面顶部收起全部按钮，将内容树收起
   */
  @Bind()
  handleShrink() {
    const { dispatch } = this.props;
    dispatch({
      type: 'organization/updateState',
      payload: { expandedRowKeys: [] },
    });
  }

  /**
   * 清除 - 新增组织行
   * @param {Object} record 新增组织行对象
   */
  @Bind()
  handleCleanLine(record = {}) {
    const {
      dispatch,
      organization: { renderTree = [], addData = {}, pathMap = {} },
    } = this.props;
    delete addData[record.unitId];
    let newRenderTree = [];
    if (record.parentUnitId) {
      // 找到父节点的children, 更新children数组
      const parent = this.findNode(renderTree, pathMap[record.parentUnitId], 'unitId');
      const newChildren = parent.children.filter(item => item.unitId !== record.unitId);
      newRenderTree = this.findAndSetNodeProps(
        renderTree,
        pathMap[record.parentUnitId],
        newChildren
      );
    } else {
      newRenderTree = renderTree.filter(item => item.unitId !== record.unitId);
    }
    dispatch({
      type: 'organization/updateState',
      payload: {
        renderTree: newRenderTree,
        addData: {
          ...addData,
        },
      },
    });
  }

  /**
   *  禁用 - 禁用特定组织，同时禁用所有下属组织
   * @param {Object} item 组织行信息
   */
  @Bind()
  handleForbidLine(item = {}) {
    const {
      dispatch,
      tenantId,
      organization: { expandedRowKeys = [] },
    } = this.props;
    dispatch({
      type: 'organization/forbidLine',
      payload: {
        tenantId,
        unitId: item.unitId,
        objectVersionNumber: item.objectVersionNumber,
        _token: item._token,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.handleSearch({ expandedRowKeys, expandFlag: true });
      }
    });
  }

  /**
   * 启用 - 启用某组织，如果有下级组织则同时启用所有下属组织
   * @param {Object} item 组织行信息
   */
  @Bind()
  handleEnabledLine(item) {
    const {
      dispatch,
      tenantId,
      organization: { expandedRowKeys = [] },
    } = this.props;
    dispatch({
      type: 'organization/enabledLine',
      payload: {
        tenantId,
        unitId: item.unitId,
        objectVersionNumber: item.objectVersionNumber,
        _token: item._token,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.handleSearch({ expandedRowKeys, expandFlag: true });
      }
    });
  }

  /**
   * 点击展开图标，展开行
   *  @param {Boolean} isExpand 展开标记
   *  @param {Object} record 组织行信息
   */
  @Bind()
  handleExpandSubLine(isExpand, record) {
    const {
      dispatch,
      organization: { expandedRowKeys = [] },
    } = this.props;
    const rowKeys = isExpand
      ? [...expandedRowKeys, record.unitId]
      : expandedRowKeys.filter(item => item !== record.unitId);
    dispatch({
      type: 'organization/updateState',
      payload: {
        expandedRowKeys: [...rowKeys],
      },
    });
  }

  /**
   * 分配部门
   * 对当前组织行进行部分分配，跳转到下一级页面
   * @param {Object} record 当前操作行
   */
  @Bind()
  handleGotoSubGrade(record = {}) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/hpfm/hr/org/department/${record.unitId}`,
      })
    );
  }

  /**
   * 保存 - 单条组织行数据修改后保存
   * @param {Object} values 修改后的数据
   */
  @Bind()
  handleDrawerOk(values) {
    const {
      dispatch,
      tenantId,
      organization: { expandedRowKeys = [] },
    } = this.props;
    dispatch({
      type: 'organization/saveEditData',
      payload: {
        tenantId,
        values,
      },
    }).then(res => {
      if (res) {
        this.setState({ drawerVisible: false, activeOrgData: {} });
        notification.success();
        this.handleSearch({ expandedRowKeys, expandFlag: true });
      }
    });
  }

  /**
   *
   * @param {object} record - 行对象
   */
  @Bind()
  handleEditRow(record) {
    this.setState({ drawerVisible: true, activeOrgData: record });
  }

  /**
   * 编辑侧滑款隐藏
   */
  @Bind()
  handleDrawerCancel() {
    this.setState({ drawerVisible: false });
  }

  /**
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { organization, loading } = this.props;
    const { groupCode, groupName, renderTree, unitType, expandedRowKeys = [] } = organization;
    const { drawerVisible = false, activeOrgData = {} } = this.state;
    const filterProps = {
      groupCode,
      groupName,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    const columns = [
      {
        title: intl.get('entity.organization.code').d('组织编码'),
        dataIndex: 'unitCode',
        // align: 'center',
        render: (val, record) =>
          record._status === 'create' ? (
            <Form.Item>
              {record.$form.getFieldDecorator('unitCode', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('entity.organization.code').d('组织编码'),
                    }),
                  },
                ],
              })(<Input trim typeCase="upper" inputChinese={false} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('entity.organization.name').d('组织名称'),
        dataIndex: 'unitName',
        width: 250,
        render: (val, record) =>
          record._status === 'create' ? (
            <Form.Item>
              {record.$form.getFieldDecorator('unitName', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('entity.organization.name').d('组织名称'),
                    }),
                  },
                ],
              })(
                <TLEditor
                  label={intl.get('entity.organization.name').d('组织名称')}
                  field="unitName"
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('entity.organization.type').d('组织类型'),
        dataIndex: 'unitTypeMeaning',
        width: 150,
        align: 'center',
        render: (val, record) =>
          record._status === 'create' ? (
            <Form.Item>
              {record.$form.getFieldDecorator('unitTypeCode', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('entity.organization.type').d('组织类型'),
                    }),
                  },
                ],
              })(
                <Select style={{ width: 100 }}>
                  {unitType.map(item => (
                    <Select.Option key={item.value} value={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hpfm.common.model.common.orderSeq').d('排序号'),
        dataIndex: 'orderSeq',
        width: 80,
        align: 'center',
        render: (val, record) =>
          record._status === 'create' ? (
            <Form.Item>
              {record.$form.getFieldDecorator('orderSeq', {
                initialValue: 1,
              })(<InputNumber min={1} precision={0} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hpfm.organization.model.unit.supervisorFlag').d('主管组织'),
        dataIndex: 'supervisorFlag',
        width: 100,
        align: 'center',
        render: (val, record) =>
          record._status === 'create' ? (
            <Form.Item>
              {record.$form.getFieldDecorator('supervisorFlag', {
                initialValue: val,
                valuePropName: 'checked',
              })(<Checkbox />)}
            </Form.Item>
          ) : (
            yesOrNoRender(val)
          ),
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 300,
        align: 'center',
        render: (val, record) =>
          record._status === 'create' ? (
            <a onClick={() => this.handleCleanLine(record)}>
              {intl.get('hzero.common.button.clean').d('清除')}
            </a>
          ) : record.enabledFlag ? (
            <span className="action-link">
              <a onClick={() => this.handleEditRow(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              <a onClick={() => this.handleAddLine(record)}>{intl.get('hzero').d('新增下级')}</a>
              <a onClick={() => this.handleForbidLine(record)}>
                {intl.get('hzero.common.status.disable').d('禁用')}
              </a>
              <a onClick={() => this.handleGotoSubGrade(record)}>
                {intl.get('hpfm.organization.view.option.assign').d('分配部门')}
              </a>
            </span>
          ) : (
            <span className="action-link">
              <a onClick={() => this.handleEditRow(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              <a style={{ color: '#F04134' }}>
                {intl.get('hzero.common.status.disable').d('禁用')}
              </a>
              <a onClick={() => this.handleEnabledLine(record)}>
                {intl.get('hzero.common.status.enable').d('启用')}
              </a>
              <a onClick={() => this.handleGotoSubGrade(record)}>
                {intl.get('hpfm.organization.view.option.assign').d('分配部门')}
              </a>
            </span>
          ),
      },
    ];
    const editTableProps = {
      expandedRowKeys,
      columns,
      loading: loading.loading,
      rowKey: 'unitId',
      pagination: false,
      bordered: true,
      dataSource: renderTree,
      onExpand: this.handleExpandSubLine,
      indentSize: 24,
      className: styles['hpfm-hr-show'],
    };
    const drawerProps = {
      unitType,
      loading: loading.edit || loading.loading,
      visible: drawerVisible,
      anchor: 'right',
      title: intl.get('hpfm.organization.view.message.edit').d('组织信息修改'),
      onCancel: this.handleDrawerCancel,
      onOk: this.handleDrawerOk,
      itemData: activeOrgData,
    };
    return (
      <Fragment>
        <Header title={intl.get('hpfm.organization.view.message.title').d('组织架构维护')}>
          <Button
            icon="save"
            type="primary"
            onClick={this.handleSave}
            loading={loading.save || loading.loading}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button icon="plus" onClick={this.handleAddOrg}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button icon="down" onClick={this.handleExpand}>
            {intl.get('hzero.common.button.expandAll').d('全部展开')}
          </Button>
          <Button icon="up" onClick={this.handleShrink}>
            {intl.get('hzero.common.button.collapseAll').d('全部收起')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          <EditTable {...editTableProps} />
          <Drawer {...drawerProps} />
        </Content>
      </Fragment>
    );
  }
}
