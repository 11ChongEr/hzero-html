/**
 * 节点组维护
 * @date: 2018-9-10
 * @author: 王家程 <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Button, Table, Dropdown, Menu, Icon, Popconfirm, Tag, Cascader } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import { Content, Header } from 'components/Page';
import cacheComponent from 'components/CacheComponent';

import { yesOrNoRender } from 'utils/renderer';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getDateFormat, tableScrollWidth } from 'utils/utils';

import FilterForm from './FilterForm';

@connect(({ loading, nodeGroup }) => ({
  nodeGroup,
  initLoading: loading.effects['nodeGroup/fetchNodeGroup'],
  deleteLoading: loading.effects['nodeGroup/deleteNodeGroup'],
  resetLoading: loading.effects['nodeGroup/restartNodeGroup'],
  stopLoading: loading.effects['nodeGroup/stopNodeGroup'],
}))
@formatterCollections({ code: 'hsgp.nodeGroup' })
@cacheComponent({ cacheKey: '/hsgp/node-group/list' })
export default class NodeGroup extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      actionEditNode: {},
      fieldsValue: {},
    };
  }

  componentDidMount() {
    const {
      nodeGroup: { isEditSave },
      dispatch,
    } = this.props;
    // 查询值集
    dispatch({
      type: 'nodeGroup/init',
    });
    if (isEditSave) {
      this.fetchNodeGroup();
    } else {
      this.fetchDefaultProductEnv().then(res => {
        if (res) {
          this.fetchNodeGroup();
        }
      });
    }
  }

  /**
   * 获取产品及环境
   * @returns {object} 默认产品环境数据
   */
  fetchDefaultProductEnv() {
    const { dispatch } = this.props;
    return dispatch({
      type: 'nodeGroup/fetchDefaultProductEnv',
    });
  }

  /**
   * 获取节点组维护列表数据
   * @param {object} params - 请求参数
   */
  fetchNodeGroup(params = {}) {
    const {
      dispatch,
      nodeGroup: { pagination = {}, defaultProductEnv: product = [] },
    } = this.props;
    const { fieldsValue } = this.state;
    dispatch({
      type: 'nodeGroup/fetchNodeGroup',
      payload: {
        page: pagination,
        ...fieldsValue,
        productId: product[0],
        productEnvId: product[1],
        ...params,
      },
    });
  }

  /**
   * @function handleSearch - 搜索表单
   */
  @Bind()
  handleSearch(fieldsValue) {
    this.setState({ fieldsValue });
    this.fetchNodeGroup({ ...fieldsValue, page: {} });
  }

  /**
   * 重置查询表单
   * @param {object} form - 查询表单
   */
  @Bind()
  handleResetSearch(form) {
    this.setState({ fieldsValue: {} });
    form.resetFields();
  }

  /**
   * @function handleCreate - 显示新增modal
   */
  @Bind()
  handleCreate() {
    const {
      history,
      dispatch,
      nodeGroup: { defaultProductEnv: product = [] },
    } = this.props;
    dispatch({
      type: 'nodeGroup/updateState',
      payload: {
        appData: {},
        versionData: {},
        configData: {},
        grayNodeRuleList: [],
        commonNodeRuleList: [],
        productWithVersionList: [],
        serviceWithVersionList: [],
      },
    });
    history.push(`/hsgp/node-group/${product[0]}/${product[1]}/create`);
    // 编辑时，使用标记来提醒保留产品/环境信息
    dispatch({ type: 'nodeGroup/updateState', payload: { isEditSave: true } });
  }

  /**
   * 更改当前产品及环境
   * @param {object} value 选择的产品数据
   */
  @Bind()
  handleChangeProduct(value) {
    const { dispatch } = this.props;
    dispatch({
      type: 'nodeGroup/updateState',
      payload: {
        defaultProductEnv: value,
      },
    });
    this.fetchNodeGroup({ productId: value[0], productEnvId: value[1] });
  }

  /**
   * @function updateNodeGroup - 更新节点组
   * @param {string} record - 行数据
   */
  updateNodeGroup(record) {
    const {
      dispatch,
      history,
      nodeGroup: { defaultProductEnv: product = [] },
    } = this.props;
    history.push(`/hsgp/node-group/${product[0]}/${product[1]}/${record.nodeGroupId}/app`);
    // 编辑时，使用标记来提醒保留产品/环境信息
    dispatch({ type: 'nodeGroup/updateState', payload: { isEditSave: true } });
  }

  /**
   * @function stopNodeGroup - 停止实例
   * @param {string} record - 节点组数据
   */
  stopNodeGroup(record) {
    const {
      dispatch,
      nodeGroup: { defaultProductEnv: product = [] },
    } = this.props;
    this.setState({ actionEditNode: record });
    dispatch({
      type: 'nodeGroup/stopNodeGroup',
      payload: { ...record, productId: product[0], productEnvId: product[1] },
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchNodeGroup();
      }
    });
  }

  /**
   * @function restartNodeGroup - 重启实例
   * @param {string} record - 节点组行数据
   */
  restartNodeGroup(record) {
    const {
      dispatch,
      nodeGroup: { defaultProductEnv: product = [] },
    } = this.props;
    this.setState({ actionEditNode: record });
    dispatch({
      type: 'nodeGroup/restartNodeGroup',
      payload: { ...record, productId: product[0], productEnvId: product[1] },
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchNodeGroup();
      }
    });
  }

  /**
   * @function grayComplete - 灰度完成
   * @param {string} record - 节点组行数据
   */
  grayComplete(record) {
    const {
      dispatch,
      nodeGroup: { defaultProductEnv: product = [] },
    } = this.props;
    this.setState({ actionEditNode: record });
    dispatch({
      type: 'nodeGroup/grayComplete',
      payload: { ...record, productId: product[0], productEnvId: product[1] },
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchNodeGroup();
      }
    });
  }

  /**
   * @function deleteNodeGroup - 删除实例
   * @param {string} record - 节点组数据
   */
  deleteNodeGroup(record) {
    const {
      dispatch,
      nodeGroup: { defaultProductEnv: product = [] },
    } = this.props;
    this.setState({ actionEditNode: record });
    dispatch({
      type: 'nodeGroup/deleteNodeGroup',
      payload: { ...record, productId: product[0], productEnvId: product[1] },
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchNodeGroup();
      }
    });
  }

  /**
   * @function handlePagination - 分页操作
   * @param {Object} pagination - 分页参数
   */
  @Bind()
  handlePagination(pagination) {
    this.fetchNodeGroup({
      page: pagination,
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      initLoading,
      deleteLoading,
      resetLoading,
      stopLoading,
      nodeGroup: {
        nodeGroupList = [],
        pagination = {},
        defaultProductEnv = [],
        productWithEnvList = [],
        nodeGroupTypeList = [],
      },
    } = this.props;
    const { actionEditNode } = this.state;
    const columns = [
      {
        title: '节点组名称',
        dataIndex: 'nodeGroupName',
      },
      {
        title: '服务编码',
        dataIndex: 'serviceCode',
      },
      {
        title: '服务版本',
        width: 200,
        dataIndex: 'serviceVersionNumber',
      },
      {
        title: '产品版本',
        width: 200,
        dataIndex: 'productVersionNumber',
      },
      {
        title: '实例名称',
        width: 200,
        dataIndex: 'instanceCode',
      },
      {
        title: '应用状态',
        width: 150,
        dataIndex: 'status',
        render: (text, record) => {
          let mean = '';
          if (text) {
            switch (text) {
              case 'running':
                mean = <Tag color="green">{record.statusMeaning}</Tag>;
                break;
              case 'operating':
                mean = <Tag color="orange">{record.statusMeaning}</Tag>;
                break;
              case 'stopped':
                mean = <Tag color="orange">{record.statusMeaning}</Tag>;
                break;
              case 'failed':
                mean = <Tag color="red">{record.statusMeaning}</Tag>;
                break;
              default:
                mean = <Tag color="#dcdcdc">{record.statusMeaning}</Tag>;
                break;
            }
          }
          return mean;
        },
      },
      {
        title: intl.get('hsgp.nodeGroup.model.nodeGroup.podCount').d('容器状态'),
        width: 100,
        dataIndex: 'podCount',
        render: (text, record) => {
          return (
            <Tag color="green">
              {record.podRunningCount || '0'}/{text || '0'}
            </Tag>
          );
        },
      },
      {
        title: '客制化',
        width: 80,
        dataIndex: 'commonFlag2',
        render: (text, record) => {
          const v = record.commonFlag ? 0 : 1;
          return yesOrNoRender(v);
        },
      },
      {
        title: intl.get('hsgp.nodeGroup.model.nodeGroup.commonGroupFlag').d('通用'),
        width: 80,
        dataIndex: 'commonFlag',
        render: yesOrNoRender,
      },
      {
        title: intl.get('hsgp.nodeGroup.model.nodeGroup.grayFlag').d('灰度'),
        width: 80,
        dataIndex: 'grayFlag',
        render: yesOrNoRender,
      },
      {
        title: '创建时间',
        width: 150,
        dataIndex: 'creationDate',
        render: text => {
          return <span>{moment(text).format(getDateFormat())}</span>;
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 85,
        fixed: 'right',
        render: (text, record) => {
          const menu = (
            <Menu style={{ textAlign: 'left' }}>
              {record.grayFlag !== 1 && record.status !== 'none' && (
                <Menu.Item key="4">
                  <a onClick={() => this.updateNodeGroup(record)}>
                    {intl.get('hsgp.nodeGroup.view.button.update').d('修改配置信息')}
                  </a>
                </Menu.Item>
              )}
              {record.status === 'running' && (
                <Menu.Item key="stop">
                  <a onClick={() => this.stopNodeGroup(record)}>
                    {intl.get('hsgp.nodeGroup.view.button.stop').d('停止实例')}
                  </a>
                </Menu.Item>
              )}
              {record.status === 'stopped' && (
                <Menu.Item key="restart">
                  <a onClick={() => this.restartNodeGroup(record)}>
                    {intl.get('hsgp.nodeGroup.view.button.restart').d('重启实例')}
                  </a>
                </Menu.Item>
              )}
              {record.status === 'running' && record.grayFlag && (
                <Menu.Item key="grayComplete">
                  <a onClick={() => this.grayComplete(record)}>灰度完成</a>
                </Menu.Item>
              )}
              <Menu.Item key="delete">
                <Popconfirm
                  arrowPointAtCenter={false}
                  placement="left"
                  overlayStyle={{ zIndex: 100 }}
                  title={intl
                    .get('hsgp.nodeGroup.view.confirm.table.remove')
                    .d('删除实例将不可恢复，其配置网络同时失效，确定要删除该实例吗？')}
                  onConfirm={() => {
                    this.deleteNodeGroup(record);
                  }}
                >
                  <a>{intl.get('hsgp.nodeGroup.view.button.delete').d('删除实例')}</a>
                </Popconfirm>
              </Menu.Item>
            </Menu>
          );
          return (
            <Dropdown overlay={menu} disabled={record.status === 'operating'}>
              {actionEditNode.nodeGroupId === record.nodeGroupId &&
              (deleteLoading || resetLoading || stopLoading) ? (
                <Icon type="loading" />
              ) : (
                <a>
                  {intl.get('hzero.common.button.action').d('操作')}
                  <Icon type="down" />
                </a>
              )}
            </Dropdown>
          );
        },
      },
    ];
    return (
      <React.Fragment>
        <Header title="节点组管理">
          <Button
            icon="plus"
            type="primary"
            style={{ marginLeft: 10 }}
            onClick={this.handleCreate}
            disabled={Array.isArray(defaultProductEnv) && defaultProductEnv.length === 0}
          >
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <div>
            <span>产品/环境：</span>
            <Cascader
              style={{ width: 230 }}
              placeholder=""
              expandTrigger="hover"
              allowClear={false}
              value={defaultProductEnv}
              options={productWithEnvList}
              fieldNames={{ label: 'meaning', value: 'value', children: 'children' }}
              onChange={this.handleChangeProduct}
            />
          </div>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm
              nodeGroupTypeList={nodeGroupTypeList}
              search={this.handleSearch}
              reset={this.handleResetSearch}
            />
          </div>
          <Table
            bordered
            rowKey="nodeGroupId"
            loading={initLoading}
            dataSource={nodeGroupList}
            columns={columns}
            scroll={{ x: tableScrollWidth(columns) }}
            pagination={pagination}
            onChange={this.handlePagination}
          />
        </Content>
      </React.Fragment>
    );
  }
}
