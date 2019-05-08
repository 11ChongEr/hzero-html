/**
 * 灰度范围管理-列表页面
 * @date: 2018-10-7
 * @author: 周邓 <deng.zhou@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Table, Form, Input, Dropdown, Menu, Icon, Tag, Popconfirm } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import { createPagination, tableScrollWidth } from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';
import notification from 'utils/notification';
import intl from 'utils/intl';
import NodeGroupDrawer from './NodeGroupDrawer';

const FormItem = Form.Item;
@Form.create({ fieldNameProp: null })
@connect(({ loading, nodeGrayGroup }) => ({
  fetchData: loading.effects['nodeGrayGroup/fetchNodeGroup'],
  nodeGrayGroup,
}))
export default class NodeGrayGroupController extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      pagination: {},
      tablePagination: {},
      modalVisible: false,
    };
  }

  componentDidMount() {
    this.fetchNodeGroup();
  }

  /**
   * 根据灰度发布id查询其节点组
   * @function fetchNodeGroup
   */
  @Bind()
  fetchNodeGroup(params = {}) {
    const {
      dispatch,
      form,
      nodeGrayGroup: {
        currentGrayGroup: { grayGroupId },
        envData: { envId },
      },
    } = this.props;
    const nodeGroupName = form.getFieldValue('nodeGroupName');
    dispatch({
      type: 'nodeGrayGroup/fetchNodeGroup',
      payload: {
        envId,
        grayGroupId,
        page: 0,
        size: 10,
        nodeGroupName,
        ...params,
      },
    }).then(res => {
      this.setState({ pagination: createPagination(res) });
    });
  }

  /**
   * @function handleStandardTableChange - 分页操作
   * @param {Object} pagination - 分页参数
   */
  @Bind()
  handleStandardTableChange(pagination) {
    this.fetchNodeGroup({
      page: pagination.current - 1,
      size: pagination.pageSize,
    });
  }

  /**
   * @function stopNodeGroup - 停止实例
   * @param {string} record - 当前节点组信息
   * @param {string} record.nodeGroupName - 应用节点组名称
   * @param {string} record.nodeGroupId - 应用节点组id
   * @param {string} record.appInstanceCode - 实例名称
   * @param {string} record.appName - 服务
   * @param {string} record.appVersionName - 应用版本
   * @param {string} record.status - 应用状态
   * @param {string} record.podCount - 容器状态
   * @param {number} record.commonGroupFlag - 通用
   */
  stopNodeGroup(record) {
    const {
      dispatch,
      nodeGrayGroup: {
        envData: { envId },
      },
    } = this.props;
    dispatch({
      type: 'nodeGrayGroup/stopNodeGroup',
      payload: { nodeGroupId: record.nodeGroupId, envId },
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchNodeGroup();
      }
    });
  }

  /**
   * @function restartNodeGroup - 重启实例
   * @param {string} record - 当前节点组信息
   * @param {string} record.nodeGroupName - 应用节点组名称
   * @param {string} record.nodeGroupId - 应用节点组id
   * @param {string} record.appInstanceCode - 实例名称
   * @param {string} record.appName - 服务
   * @param {string} record.appVersionName - 应用版本
   * @param {string} record.status - 应用状态
   * @param {string} record.podCount - 容器状态
   * @param {number} record.commonGroupFlag - 通用
   */
  restartNodeGroup(record) {
    const {
      dispatch,
      nodeGrayGroup: {
        envData: { envId },
      },
    } = this.props;
    dispatch({
      type: 'nodeGrayGroup/restartNodeGroup',
      payload: { nodeGroupId: record.nodeGroupId, envId },
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchNodeGroup();
      }
    });
  }

  /**
   * @function deleteNodeGroup - 删除实例
   * @param {string} record - 当前节点组信息
   * @param {string} record.nodeGroupName - 应用节点组名称
   * @param {string} record.nodeGroupId - 应用节点组id
   * @param {string} record.appInstanceCode - 实例名称
   * @param {string} record.appName - 服务
   * @param {string} record.appVersionName - 应用版本
   * @param {string} record.status - 应用状态
   * @param {string} record.podCount - 容器状态
   * @param {number} record.commonGroupFlag - 通用
   */
  deleteNodeGroup(record) {
    const {
      dispatch,
      nodeGrayGroup: {
        envData: { envId },
      },
    } = this.props;
    dispatch({
      type: 'nodeGrayGroup/deleteNodeGroup',
      payload: { nodeGroupId: record.nodeGroupId, envId },
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchNodeGroup();
      }
    });
  }

  /**
   * 渲染查询表单
   * @function renderSearchForm
   */
  renderSearchForm() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form layout="inline">
        <FormItem
          label={intl
            .get('hsgp.nodeGrayGroup.model.nodeGrayGroup.nodeGroupName')
            .d('应用节点组名称')}
        >
          {getFieldDecorator('nodeGroupName')(<Input />)}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit" onClick={this.handleSerach}>
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
        </FormItem>
        <FormItem>
          <Button type="primary" onClick={this.resetSearch}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
        </FormItem>
      </Form>
    );
  }

  /**
   * 重置表单
   * @function resetSearch
   */
  @Bind()
  resetSearch() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 根据条件查询节点组规则
   * @function handleSerach
   */
  @Bind()
  handleSerach() {
    this.fetchNodeGroup();
  }

  /**
   * 控制modal的显示
   * @function handleModalVisible
   * @param {boolean} flag 表示是否可见
   */
  @Bind()
  handleModalVisible(flag) {
    this.setState({
      modalVisible: flag,
    });
  }

  /**
   * 新建
   * @function handleCreate
   */
  @Bind()
  handleCreate() {
    this.handleModalVisible(true);
    this.fetchNewestNodeGroup();
  }

  /**
   * 保存新建灰度发布信息
   * @function handleSaveData
   */
  @Bind()
  handleOk() {
    notification.success();
    this.fetchNodeGroup();
    this.handleModalVisible(false);
  }

  /**
   * @function fetchNewestNodeGroup - 获取当前可新增的节点组
   * @param {object} params - 配置参数
   */
  @Bind()
  fetchNewestNodeGroup(params = {}) {
    const {
      nodeGrayGroup: {
        envData: { envId },
      },
      dispatch,
    } = this.props;
    dispatch({
      type: 'nodeGrayGroup/fetchNewestNodeGroup',
      payload: {
        page: 0,
        size: 10,
        envId,
        ...params,
      },
    }).then(res => {
      if (res) {
        this.setState({ tablePagination: createPagination(res) });
      }
    });
  }

  /**
   * @function deleteRelation - 删除节点组的灰度发布关系
   * @param {object} record - 当前节点组信息
   * @param {string} record.nodeGroupName - 应用节点组名称
   * @param {string} record.nodeGroupId - 应用节点组id
   * @param {string} record.appInstanceCode - 实例名称
   * @param {string} record.appName - 服务
   * @param {string} record.appVersionName - 应用版本
   * @param {string} record.status - 应用状态
   * @param {string} record.podCount - 容器状态
   * @param {number} record.commonGroupFlag - 通用
   */
  deleteRelation(record) {
    const {
      dispatch,
      nodeGrayGroup: {
        envData: { envId },
      },
    } = this.props;
    dispatch({
      type: 'nodeGrayGroup/deleteRelation',
      payload: { nodeGroupId: record.nodeGroupId, envId },
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchNodeGroup();
      }
    });
  }

  render() {
    const { pagination, modalVisible, tablePagination } = this.state;
    const {
      nodeGrayGroup: { NodeGroupList },
      fetchData,
      nodeGrayGroup: { currentGrayGroup },
    } = this.props;
    const DrawerProps = {
      modalVisible,
      tablePagination,
      onOk: this.handleOk,
      handleModalVisible: this.handleModalVisible,
      fetchNewestNodeGroup: this.fetchNewestNodeGroup,
    };
    const columns = [
      {
        title: intl.get('hsgp.nodeGrayGroup.model.nodeGrayGroup.nodeGroupName').d('应用节点组名称'),
        dataIndex: 'nodeGroupName',
      },
      {
        title: intl.get('hsgp.nodeGroup.model.nodeGrayGroup.appInstanceCode').d('实例名称'),
        width: 200,
        dataIndex: 'appInstanceCode',
      },
      {
        title: intl.get('hsgp.nodeGrayGroup.model.nodeGrayGroup.appName').d('服务'),
        dataIndex: 'appName',
        width: 150,
      },
      {
        title: intl.get('hsgp.nodeGrayGroup.model.nodeGrayGroup.appVersionName').d('应用版本'),
        dataIndex: 'appVersionName',
      },
      {
        title: intl.get('hsgp.nodeGrayGroup.model.nodeGrayGroup.status').d('应用状态'),
        dataIndex: 'status',
        width: 100,
        render: (text, record) => {
          let mean = '';
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
          return mean;
        },
      },
      {
        title: intl.get('hsgp.nodeGrayGroup.model.nodeGrayGroup.podCount').d('容器状态'),
        dataIndex: 'podCount',
        width: 100,
        render: (text, record) => {
          return (
            <Tag color="green">
              {record.podRunningCount || 0}/{text || 0}
            </Tag>
          );
        },
      },
      {
        title: intl.get('hsgp.nodeGroup.model.nodeGrayGroup.commonGroupFlag').d('通用'),
        width: 100,
        dataIndex: 'commonGroupFlag',
        render: yesOrNoRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'edit',
        width: 85,
        render: (text, record) => {
          const menu = (
            <Menu style={{ textAlign: 'left' }}>
              {record.status === 'running' && (
                <Menu.Item key="stop">
                  <a onClick={() => this.stopNodeGroup(record)}>
                    {intl.get('hsgp.nodeGrayGroup.view.button.stop').d('停止实例')}
                  </a>
                </Menu.Item>
              )}
              {record.status === 'stopped' && (
                <Menu.Item key="reset">
                  <a onClick={() => this.restartNodeGroup(record)}>
                    {intl.get('hsgp.nodeGrayGroup.view.button.restart').d('重启实例')}
                  </a>
                </Menu.Item>
              )}
              <Menu.Item key="delete">
                <Popconfirm
                  arrowPointAtCenter={false}
                  placement="left"
                  overlayStyle={{ zIndex: 100 }}
                  title={intl
                    .get('hsgp.nodeGrayGroup.view.confirm.remove')
                    .d('删除实例将不可恢复，其配置网络同时失效，确定要删除该实例吗？')}
                  onConfirm={() => this.deleteNodeGroup(record)}
                >
                  <a>{intl.get('hsgp.nodeGrayGroup.view.button.delete').d('删除实例')}</a>
                </Popconfirm>
              </Menu.Item>
              {record.status === 'unbind' && (
                <Menu.Item key="deleteRelation">
                  <a onClick={() => this.deleteRelation(record)}>
                    {intl.get('hsgp.nodeGrayGroup.view.button.deleteRelation').d('删除关联关系')}
                  </a>
                </Menu.Item>
              )}
            </Menu>
          );
          return (
            <Dropdown overlay={menu} disabled={record.status === 'operating'}>
              <a>
                {intl.get('hzero.common.button.action').d('操作')}
                <Icon type="down" />
              </a>
            </Dropdown>
          );
        },
      },
    ];
    return (
      <React.Fragment>
        <Header
          title={intl.get('hsgp.nodeGrayGroup.view.message.grayRange').d('灰度范围管理')}
          backPath="/hsgp/node-gray-group"
        >
          <Button
            icon="plus"
            type="primary"
            onClick={this.handleCreate}
            disabled={currentGrayGroup.groupStatus !== 'NEW'}
          >
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content
          description={
            <React.Fragment>
              <span style={{ marginRight: '8px' }}>
                {intl.get('hsgp.nodeGrayGroup.model.nodeGrayGroup.grayName').d('灰度发布名称')}：
                {currentGrayGroup.grayName}
              </span>
            </React.Fragment>
          }
        >
          <div className="table-list-search">{this.renderSearchForm()}</div>
          <Table
            bordered
            rowKey="nodeGroupId"
            columns={columns}
            scroll={{ x: tableScrollWidth(columns) }}
            pagination={pagination}
            dataSource={NodeGroupList.content || []}
            loading={fetchData}
            onChange={this.handleStandardTableChange}
          />
        </Content>
        <NodeGroupDrawer {...DrawerProps} />
      </React.Fragment>
    );
  }
}
