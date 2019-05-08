/**
 * nodeRule - 节点组规则 - 新增/编辑页面
 * @date: 2018-9-7
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Button, Form, Input, Table, Row, Col, InputNumber, Popconfirm } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';
import Switch from 'components/Switch';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { HZERO_HSGP } from 'utils/config';
import { tableScrollWidth } from 'utils/utils';

import SourceLov from '../../SourceLov';
import UrlTable from './UrlTable';
import UserTable from './UserTable';

const FormItem = Form.Item;
@Form.create({ fieldNameProp: null })
@connect(({ loading, nodeRule }) => ({
  nodeRule,
  detailLoading: loading.effects['nodeRule/fetchNodeRuleDetails'],
  tenantLoading: loading.effects['nodeRule/fetchTenantList'],
  saveLoading: loading.effects['nodeRule/updateNodeRule'],
  createLoading: loading.effects['nodeRule/createNodeRule'],
  urlLoading: loading.effects['nodeRule/fetchUrlList'],
  userLoading: loading.effects['nodeRule/fetchUserList'],
  fetchLovLoading: loading.effects['nodeRule/fetchTenantLovList'],
}))
@formatterCollections({ code: 'hsgp.nodeRule' })
export default class Editor extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      tableType: 'user',
      actionTenant: {},
      selectedUrlRows: [],
    };
  }

  componentDidMount() {
    const {
      dispatch,
      match: {
        params: { nodeRuleId },
      },
    } = this.props;
    // 初始化数据
    dispatch({
      type: 'nodeRule/updateState',
      payload: {
        tenantList: [],
        userList: [],
        urlList: [],
        nodeRuleDetails: {},
      },
    });
    if (nodeRuleId !== 'create') {
      this.fetchNodeRuleDetails().then(res => {
        if (res) {
          this.fetchTenantList();
        }
      });
    }
  }

  /**
   * @function fetchNodeRuleDetails - 获取节点组规则详情
   * @param {object} params - 查询参数
   */
  fetchNodeRuleDetails(params = {}) {
    const {
      dispatch,
      match: {
        params: { nodeRuleId, productId, productEnvId },
      },
    } = this.props;
    return dispatch({
      type: 'nodeRule/fetchNodeRuleDetails',
      payload: {
        nodeRuleId,
        productId,
        productEnvId,
        ...params,
      },
    });
  }

  /**
   * @function fetchTenantList - 获取节点组规则租户列表
   * @param {object} params - 查询参数
   */
  fetchTenantList(params = {}) {
    const {
      dispatch,
      match: {
        params: { nodeRuleId, productId, productEnvId },
      },
    } = this.props;
    dispatch({
      type: 'nodeRule/fetchTenantList',
      payload: {
        nodeRuleId,
        productId,
        productEnvId,
        ...params,
      },
    });
  }

  /**
   * @function handleSave - 保存
   */
  @Bind()
  handleSave() {
    const {
      form,
      dispatch,
      match: {
        params: { nodeRuleId, productId, productEnvId },
      },
      history,
      nodeRule: { nodeRuleDetails = {}, tenantList = {} },
    } = this.props;
    const { content = [] } = tenantList;
    const paramsContent = content;
    const type = nodeRuleDetails.nodeRuleId ? 'nodeRule/updateNodeRule' : 'nodeRule/createNodeRule';
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        if (content.length === 0) {
          notification.warning({
            message: intl.get('hsgp.nodeRule.view.message.title.add').d('请先新增租户信息'),
          });
          return;
        }
        dispatch({
          type,
          payload: {
            ...nodeRuleDetails,
            ...fieldsValue,
            nodeRuleTenantList: paramsContent,
            productId,
            productEnvId,
          },
        }).then(res => {
          if (res) {
            notification.success();
            // 新增成功后前往详情页
            if (nodeRuleId === 'create') {
              history.push(`${HZERO_HSGP}/node-rule/config/${res.nodeRuleId}`);
            } else {
              const { nodeRuleTenantList, ...other } = res;
              dispatch({
                type: 'nodeRule/updateState',
                payload: { nodeRuleDetails: other, tenantList: { content: nodeRuleTenantList } },
              });
            }
          }
        });
      }
    });
  }

  /**
   * @function onUserSelectChange - 选择user列表
   * @param {array} - selectedRowKeys - 选中的keys
   */
  onUserSelectChange(selectedRowKeys) {
    const {
      dispatch,
      nodeRule: { tenantList },
    } = this.props;
    // 当前正在操作的租户
    const {
      actionTenant: { tenantId },
    } = this.state;
    const { content = [] } = tenantList;
    const nodeRuleTenantUserList = selectedRowKeys.map(item => {
      return {
        userId: item,
      };
    });
    // 将选择的user插入到操作的租户数据中
    content.forEach((item, index, arr) => {
      if (item.tenantId === tenantId) {
        // eslint-disable-next-line
        arr[index] = { ...item, nodeRuleTenantUserList };
      }
    });
    dispatch({
      type: 'nodeRule/updateState',
      payload: {
        selectedUserRowKeys: selectedRowKeys,
        tenantList: { ...tenantList, content },
      },
    });
  }

  /**
   * @function onUrlSelectChange - 选择url列表
   */
  onUrlSelectChange(selectedRowKeys, selectedRows) {
    const {
      dispatch,
      nodeRule: { tenantList },
    } = this.props;
    const { selectedUrlRows = [] } = this.state;
    // 数组去中
    const newSelectedUrlRows = [...new Set(selectedUrlRows.concat(selectedRows))];
    this.setState({ selectedUrlRows: newSelectedUrlRows });
    // 当前正在操作的租户
    const {
      actionTenant: { tenantId },
    } = this.state;
    const { content = [] } = tenantList;
    const nodeRuleTenantUrlList = newSelectedUrlRows.map(item => {
      return {
        serviceName: item.serviceName,
        urlId: item.urlId,
        method: item.method,
        url: item.url,
      };
    });
    // 将选择的url插入到操作的租户数据中
    content.forEach((item, index, arr) => {
      if (item.tenantId === tenantId) {
        // eslint-disable-next-line
        arr[index] = { ...item, nodeRuleTenantUrlList };
      }
    });
    dispatch({
      type: 'nodeRule/updateState',
      payload: {
        selectedUrlRowKeys: selectedRowKeys,
        tenantList: { ...tenantList, content },
      },
    });
  }

  /**
   * @function - handleDelete - 删除租户
   * @param {object} record - 租户行数据
   */
  handleDelete(record) {
    const {
      dispatch,
      nodeRule: { tenantList = {} },
    } = this.props;
    const { content } = tenantList;
    const { ruleTenantId } = record;
    if (ruleTenantId) {
      dispatch({
        type: 'nodeRule/deleteTenant',
        payload: { ...record },
      }).then(res => {
        if (res) {
          notification.success();
          this.fetchTenantList();
        }
      });
    } else {
      const newContent = content.filter(item => item.tenantId !== record.tenantId);
      dispatch({
        type: 'nodeRule/updateState',
        payload: { tenantList: { ...tenantList, content: newContent } },
      });
      notification.success();
    }
  }

  /**
   * @function handleSetUser - 设置租户对应的用户
   * @param {object} record - 行数据
   */
  handleSetUser(record) {
    const {
      dispatch,
      match: {
        params: { productEnvId },
      },
    } = this.props;
    const { nodeRuleTenantUserList = [] } = record;
    const userIds = nodeRuleTenantUserList.map(item => {
      return item.userId;
    });
    this.setState({ tableType: 'user', actionTenant: record });
    dispatch({
      type: 'nodeRule/fetchUserList',
      payload: {
        ...record,
        page: 0,
        size: 10,
        productEnvId,
      },
    }).then(res => {
      if (res) {
        // 设置user列表预先选中
        dispatch({
          type: 'nodeRule/updateState',
          payload: { selectedUserRowKeys: userIds },
        });
      }
    });
  }

  /**
   * @function handleUserStandardTable - 用户列表分页
   * @param {object} pagination - 分页信息
   */
  handleUserStandardTable(pagination) {
    const {
      dispatch,
      match: {
        params: { productId, productEnvId },
      },
    } = this.props;
    const {
      actionTenant: { tenantId },
    } = this.state;
    dispatch({
      type: 'nodeRule/fetchUserList',
      payload: {
        tenantId,
        productId,
        productEnvId,
        page: pagination.current - 1,
        size: pagination.pageSize,
      },
    });
  }

  /**
   * @function handleSetUrl - 设置租户对应的url
   * @param {object} record - 行数据
   */
  handleSetUrl(record) {
    const {
      dispatch,
      match: {
        params: { productId, productEnvId },
      },
    } = this.props;
    const { nodeRuleTenantUrlList = [] } = record;
    const urlIds = nodeRuleTenantUrlList.map(item => item.urlId);
    this.setState({
      tableType: 'url',
      actionTenant: record,
      selectedUrlRows: nodeRuleTenantUrlList,
    });
    dispatch({
      type: 'nodeRule/fetchUrlList',
      payload: { productId, productEnvId, page: 0, size: 10 },
    }).then(res => {
      if (res) {
        // 设置url列表预先选中
        dispatch({
          type: 'nodeRule/updateState',
          payload: { selectedUrlRowKeys: urlIds },
        });
      }
    });
  }

  /**
   * @function handleUserStandardTable - Url列表分页
   * @param {object} pagination - 分页信息
   */
  handleUrlStandardTable(pagination) {
    const {
      dispatch,
      match: {
        params: { productId, productEnvId },
      },
    } = this.props;
    dispatch({
      type: 'nodeRule/fetchUrlList',
      payload: {
        productId,
        productEnvId,
        page: pagination.current - 1,
        size: pagination.pageSize,
      },
    });
  }

  @Bind()
  fetchTenantLov(params = {}) {
    const {
      dispatch,
      match: {
        params: { productEnvId },
      },
    } = this.props;
    dispatch({
      type: 'nodeRule/fetchTenantLovList',
      payload: {
        productEnvId,
        ...params,
      },
    });
  }

  @Bind()
  openLovModal() {
    this.fetchTenantLov();
    this.setState({ lovModalVisible: true });
  }

  @Bind()
  handleCloseTenantLov() {
    this.setState({ lovModalVisible: false });
  }

  /**
   * @function handleTenantLovOk - 选择租户数据
   * @param {object} record - 选择的租户行数据
   */
  @Bind()
  handleTenantLovOk(record) {
    const {
      dispatch,
      nodeRule: { tenantList = {} },
    } = this.props;
    const { content = [] } = tenantList;
    if (content.length === 0) {
      content.push(record);
    } else {
      const flag = content.some(item => {
        return item.tenantId === record.tenantId;
      });
      if (flag) {
        notification.warning({
          message: intl.get('hsgp.nodeRule.view.message.title.repeat').d('所选租户已存在'),
        });
        return;
      } else {
        content.push(record);
      }
    }
    // 选择租户后设置租户列表，清空租户url列表
    dispatch({
      type: 'nodeRule/updateState',
      payload: { tenantList: { ...tenantList, content }, nodeRuleTenantUrlList: [] },
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      dispatch,
      form,
      nodeRule: {
        tenantList = {},
        userList = {},
        urlList = {},
        selectedUserRowKeys = [],
        selectedUrlRowKeys = [],
        nodeRuleDetails = {},
        tenantLovList = {},
      },
      match: {
        params: { nodeRuleId, productId, productEnvId },
      },
      saveLoading = false,
      createLoading = false,
      tenantLoading = false,
      userLoading = false,
      urlLoading = false,
      fetchLovLoading = false,
    } = this.props;
    const { tableType, actionTenant, lovModalVisible } = this.state;
    const { getFieldDecorator } = form;
    const { ruleName, priority, enabledFlag = 1 } = nodeRuleDetails;
    const { content = [] } = tenantList;
    const userProps = {
      dispatch,
      loading: userLoading,
      userList,
      actionTenant,
      selectedUserRowKeys,
      productId,
      productEnvId,
      standardTable: pagination => this.handleUserStandardTable(pagination),
      onUserSelectChange: (keys, rows) => this.onUserSelectChange(keys, rows),
    };
    const urlProps = {
      dispatch,
      loading: urlLoading,
      urlList,
      actionTenant,
      selectedUrlRowKeys,
      productId,
      productEnvId,
      standardTable: pagination => this.handleUrlStandardTable(pagination),
      onUrlSelectChange: (keys, rows) => this.onUrlSelectChange(keys, rows),
    };
    const title =
      nodeRuleId === 'create'
        ? intl.get('hsgp.nodeRule.view.message.title.create').d('节点组规则新建')
        : intl.get('hsgp.nodeRule.view.message.title.editor').d('节点组规则编辑');
    // 租户 lov props
    const lovModalProps = {
      rowKey: 'tenantId',
      visible: lovModalVisible,
      onOk: this.handleTenantLovOk,
      onCancel: this.handleCloseTenantLov,
      dataSource: tenantLovList,
      onSearch: this.fetchTenantLov,
      loading: fetchLovLoading,
      filterItems: [
        {
          label: intl.get('hsgp.nodeRule.model.nodeRule.tenantNum').d('租户编码'),
          code: 'tenantNum',
        },
        {
          label: intl.get('hsgp.nodeRule.model.nodeRule.tenantName').d('租户名称'),
          code: 'tenantName',
        },
      ],
      columns: [
        {
          title: intl.get('hsgp.nodeRule.model.nodeRule.tenantNum').d('租户编码'),
          width: 150,
          dataIndex: 'tenantNum',
        },
        {
          title: intl.get('hsgp.nodeRule.model.nodeRule.tenantName').d('租户名称'),
          dataIndex: 'tenantName',
        },
      ],
    };
    const columns = [
      {
        title: intl.get('hsgp.nodeRule.model.nodeRule.tenantId').d('租户ID'),
        width: 80,
        dataIndex: 'tenantId',
      },
      {
        title: intl.get('hsgp.nodeRule.model.nodeRule.tenantNum').d('租户编码'),
        width: 100,
        dataIndex: 'tenantNum',
      },
      {
        title: intl.get('hsgp.nodeRule.model.nodeRule.tenantName').d('租户名称'),
        dataIndex: 'tenantName',
      },
      {
        title: intl.get('hsgp.nodeRule.model.nodeRule.user').d('用户(可选)'),
        width: 120,
        dataIndex: 'user',
        render: (text, record) => (
          <a onClick={() => this.handleSetUser(record)}>
            {intl.get('hzero.common.button.setting').d('设置')}
          </a>
        ),
      },
      {
        title: intl.get('hsgp.nodeRule.model.nodeRule.url').d('URL(可选)'),
        width: 120,
        dataIndex: 'url',
        render: (text, record) => (
          <a onClick={() => this.handleSetUrl(record)}>
            {intl.get('hzero.common.button.setting').d('设置')}
          </a>
        ),
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 85,
        dataIndex: 'editor',
        render: (text, record) => (
          <Popconfirm
            title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录')}
            onConfirm={() => this.handleDelete(record)}
          >
            <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
          </Popconfirm>
        ),
      },
    ];
    return (
      <React.Fragment>
        <Header title={title} backPath="/hsgp/node-rule">
          <Button
            type="primary"
            icon="save"
            onClick={this.handleSave}
            loading={nodeRuleDetails.nodeRuleId ? saveLoading : createLoading}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content>
          <Form layout="inline">
            <FormItem label={intl.get('hsgp.nodeRule.model.nodeRule.ruleName').d('规则名称')}>
              {getFieldDecorator('ruleName', {
                initialValue: ruleName,
                rules: [
                  {
                    type: 'string',
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hsgp.nodeRule.model.nodeRule.ruleName').d('规则名称'),
                    }),
                  },
                  {
                    max: 60,
                    message: intl.get('hzero.common.validation.max', {
                      max: 60,
                    }),
                  },
                ],
              })(<Input />)}
            </FormItem>
            <FormItem label={intl.get('hzero.common.priority').d('优先级')}>
              {getFieldDecorator('priority', {
                initialValue: priority,
                rules: [
                  {
                    type: 'number',
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hzero.common.priority').d('优先级'),
                    }),
                  },
                ],
              })(<InputNumber />)}
            </FormItem>
            <FormItem label={intl.get('hzero.common.status.enable').d('启用')}>
              {getFieldDecorator('enabledFlag', {
                initialValue: enabledFlag,
              })(<Switch />)}
            </FormItem>
          </Form>
          <Row gutter={16} style={{ display: 'flex', alignItems: 'flex-start', marginTop: '24px' }}>
            <Col span={14}>
              <SourceLov
                isButton
                style={{ marginBottom: 12 }}
                onClick={this.openLovModal}
                lovModalProps={lovModalProps}
              >
                新建租户
              </SourceLov>
              <Table
                bordered
                rowKey="tenantId"
                loading={tenantLoading}
                dataSource={content}
                columns={columns}
                scroll={{ x: tableScrollWidth(columns) }}
                pagination={false}
                onChange={this.handleStandardTableChange}
                onRow={record => {
                  if (record.tenantId === actionTenant.tenantId) {
                    return {
                      style: { background: '#f0f4ff' },
                    };
                  }
                }}
              />
            </Col>
            <Col span={10}>
              {tableType === 'user' ? <UserTable {...userProps} /> : <UrlTable {...urlProps} />}
            </Col>
          </Row>
        </Content>
      </React.Fragment>
    );
  }
}
