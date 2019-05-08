/**
 * 灰度发布管理-列表页面
 * @date: 2018-10-7
 * @author: 周邓 <deng.zhou@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { isUndefined } from 'lodash';
import { Button, Table, Form, Popconfirm, Input, Modal, Tag } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';
import Lov from 'components/Lov';
import cacheComponent from 'components/CacheComponent';

import { createPagination, tableScrollWidth } from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
@connect(({ loading, nodeGrayGroup }) => ({
  fetchData: loading.effects['nodeGrayGroup/fetchNodeGrayGroup'],
  confirm: loading.effects['nodeGrayGroup/createNodeGrayGroup'],
  nodeGrayGroup,
}))
@formatterCollections({ code: 'hsgp.nodeGrayGroup' })
@cacheComponent({ cacheKey: '/hsgp/node-gray-group/list' })
export default class NodeGrayGroupController extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      pagination: {},
    };
  }

  componentDidMount() {
    this.fetchDefaultEnv().then(res => {
      if (res) {
        this.fetchNodeGrayGroup();
      }
    });
  }

  /**
   * 获取默认环境
   * @async
   * @function fetchDefaultEnv
   */
  fetchDefaultEnv() {
    const { dispatch } = this.props;
    return dispatch({
      type: 'nodeGrayGroup/fetchDefaultEnv',
    });
  }

  /**
   * 获取某环境的灰度发布列表数据
   * @function fetchNodeGrayGroup
   * @param {number} record.envId 环境id
   */
  fetchNodeGrayGroup(params = {}) {
    const {
      form,
      dispatch,
      nodeGrayGroup: {
        envData: { envId },
      },
    } = this.props;
    const grayName = form.getFieldValue('grayName');
    dispatch({
      type: 'nodeGrayGroup/fetchNodeGrayGroup',
      payload: {
        envId,
        grayName,
        page: 0,
        size: 10,
        ...params,
      },
    }).then(res => {
      if (res) {
        this.setState({ pagination: createPagination(res) });
      }
    });
  }

  /**
   * @function handleSaveEnv - 选择环境
   * @param {string} text 选择的环境数据
   * @param {object} record 选择的环境行数据
   * @param {number} record.envId 所选环境的id
   */
  @Bind()
  handleSaveEnv(text, record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'nodeGroup/updateState',
      payload: {
        envData: record,
      },
    });
    this.fetchNodeGrayGroup({ envId: record.envId });
  }

  /**
   * 发布灰度
   * @function releaseNodeGrayGroup
   * @param {object} record 选择的环境行数据
   * @param {string} record.grayName 灰度发布名称
   * @param {string} record.groupStatus 状态
   * @param {string} record.releasedDate 发布时间
   * @param {string} record.finishedDate 结束时间
   */
  releaseNodeGrayGroup(record) {
    const {
      dispatch,
      nodeGrayGroup: {
        envData: { envId },
      },
    } = this.props;
    dispatch({
      type: 'nodeGrayGroup/releaseNodeGrayGroup',
      payload: {
        envId,
        ...record,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchNodeGrayGroup();
      }
    });
  }

  /**
   * 结束灰度
   * @function completeNodeGrayGroup
   * @param {object} record 选择的环境行数据
   * @param {string} record.grayName 灰度发布名称
   * @param {string} record.groupStatus 状态
   * @param {string} record.releasedDate 发布时间
   * @param {string} record.finishedDate 结束时间
   */
  completeNodeGrayGroup(record) {
    const {
      dispatch,
      nodeGrayGroup: {
        envData: { envId },
      },
    } = this.props;
    dispatch({
      type: 'nodeGrayGroup/completeNodeGrayGroup',
      payload: {
        envId,
        ...record,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchNodeGrayGroup();
      }
    });
  }

  /**
   * 删除灰度发布
   * @function deleteNodeGrayGroup
   * @param {object} record 选择的环境行数据
   * @param {string} record.grayName 灰度发布名称
   * @param {string} record.groupStatus 状态
   * @param {string} record.releasedDate 发布时间
   * @param {string} record.finishedDate 结束时间
   */
  deleteNodeGrayGroup(record) {
    const {
      dispatch,
      nodeGrayGroup: {
        envData: { envId },
      },
    } = this.props;
    dispatch({
      type: 'nodeGrayGroup/deleteNodeGrayGroup',
      payload: {
        envId,
        ...record,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchNodeGrayGroup();
      }
    });
  }

  /**
   * 跳转至灰度发布节点组页面
   * @function handleTograyRange
   * @param {object} record 选择的环境行数据
   * @param {string} record.grayName 灰度发布名称
   * @param {string} record.groupStatus 状态
   * @param {string} record.releasedDate 发布时间
   * @param {string} record.finishedDate 结束时间
   */
  @Bind()
  handleTograyRange(record) {
    const { history, dispatch } = this.props;
    // 保存当前灰度发布数据,便于为其添加节点组时获取id
    dispatch({
      type: 'nodeGrayGroup/saveNodeGroupData',
      payload: record,
    });
    history.push('/hsgp/node-gray-group/gray-range');
  }

  /**
   * @function handleStandardTableChange - 分页操作
   * @param {Object} pagination - 分页参数
   */
  @Bind()
  handleStandardTableChange(pagination) {
    this.fetchNodeGrayGroup({
      page: pagination.current - 1,
      size: pagination.pageSize,
    });
  }

  /**
   * 控制modal的显示
   * @function handleModalVisible
   * @param {boolean} flag 标识modal是否显示
   */
  handleModalVisible(flag) {
    this.setState({
      modalVisible: flag,
    });
  }

  /**
   * 保存新建灰度发布信息
   * @function handleSaveData
   */
  @Bind()
  handleSaveData() {
    const {
      form,
      dispatch,
      nodeGrayGroup: {
        envData: { envId },
      },
    } = this.props;
    const addGrayName = form.getFieldValue('addGrayName');
    form.validateFields(err => {
      if (!err) {
        dispatch({
          type: 'nodeGrayGroup/createNodeGrayGroup',
          payload: {
            grayName: addGrayName,
            envId,
          },
        }).then(res => {
          if (res) {
            notification.success();
            this.fetchNodeGrayGroup();
            this.handleModalVisible(false);
          }
        });
      }
    });
  }

  /**
   * 渲染查询表单
   * @function renderForm
   */
  renderForm() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form layout="inline">
        <FormItem
          label={intl.get('hsgp.nodeGrayGroup.model.nodeGrayGroup.grayName').d('灰度发布名称')}
        >
          {getFieldDecorator('grayName')(<Input />)}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit" onClick={this.handleSerach}>
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
        </FormItem>
        <FormItem>
          <Button onClick={this.resetSearch}>
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
   * 根据灰度发布名称查询灰度发布
   * @function handleSerach
   */
  @Bind()
  handleSerach() {
    this.fetchNodeGrayGroup();
  }

  render() {
    const { pagination, modalVisible } = this.state;
    const {
      nodeGrayGroup: {
        NodeGrayGroupList = {},
        envData: { envId, envName },
      },
      fetchData,
      confirm,
      form,
    } = this.props;
    const { getFieldDecorator } = form;
    const formLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    const columns = [
      {
        title: intl.get('hsgp.nodeGrayGroup.model.nodeGrayGroup.grayName').d('灰度发布名称'),
        dataIndex: 'grayName',
      },
      {
        title: intl.get('hsgp.nodeGrayGroup.model.nodeGrayGroup.groupStatus').d('状态'),
        dataIndex: 'groupStatus',
        width: 100,
        render: text => {
          if (text === 'NEW') {
            return <Tag color="green">{intl.get('hzero.common.button.create').d('新建')}</Tag>;
          } else if (text === 'RELEASED') {
            return (
              <Tag color="orange">
                {intl.get('hsgp.nodeGrayGroup.model.nodeGrayGroup.released').d('已发布')}
              </Tag>
            );
          } else {
            return (
              <Tag color="#dcdcdc">
                {intl.get('hsgp.nodeGrayGroup.model.nodeGrayGroup.finishedGray').d('灰度结束')}
              </Tag>
            );
          }
        },
      },
      {
        title: intl.get('hsgp.nodeGrayGroup.model.nodeGrayGroup.releasedDate').d('发布时间'),
        dataIndex: 'releasedDate',
        width: 200,
      },
      {
        title: intl.get('hsgp.nodeGrayGroup.model.nodeGrayGroup.finishedDate').d('结束时间'),
        dataIndex: 'finishedDate',
        width: 150,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'edit',
        width: 150,
        render: (text, record) => {
          return (
            <span className="action-link">
              <a
                onClick={() => {
                  this.handleTograyRange(record);
                }}
              >
                {intl.get('hsgp.nodeGrayGroup.view.button.grayRange').d('灰度范围')}
              </a>
              {record.groupStatus === 'NEW' && (
                <a
                  onClick={() => {
                    this.releaseNodeGrayGroup(record);
                  }}
                >
                  {intl.get('hzero.common.button.release').d('发布')}
                </a>
              )}
              {record.groupStatus === 'NEW' && (
                <a
                  onClick={() => {
                    this.deleteNodeGrayGroup(record);
                  }}
                >
                  {intl.get('hzero.common.button.delete').d('删除')}
                </a>
              )}
              {record.groupStatus === 'RELEASED' && (
                <Popconfirm
                  title={intl
                    .get('hsgp.nodeGrayGroup.view.confirm.toComplete')
                    .d('是否结束此灰度？')}
                  onConfirm={() => {
                    this.completeNodeGrayGroup(record);
                  }}
                >
                  <a>{intl.get('hsgp.nodeGrayGroup.view.button.complete').d('结束灰度')}</a>
                </Popconfirm>
              )}
            </span>
          );
        },
      },
    ];
    return (
      <React.Fragment>
        <Header title={intl.get('hsgp.nodeGrayGroup.view.message.title').d('灰度发布管理')}>
          <Button
            icon="plus"
            type="primary"
            onClick={() => this.handleModalVisible(true)}
            disabled={isUndefined(envId)}
          >
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Lov
            textValue={envName}
            value={envId}
            code="HSGP.ENV"
            style={{ width: 200, marginLeft: 8 }}
            onChange={this.handleSaveEnv}
          />
        </Header>
        <Content>
          <div className="table-list-search">{this.renderForm()}</div>
          <Table
            bordered
            rowKey="grayGroupId"
            columns={columns}
            scroll={{ x: tableScrollWidth(columns) }}
            dataSource={NodeGrayGroupList.content || []}
            pagination={pagination}
            loading={fetchData}
            onChange={this.handleStandardTableChange}
          />
        </Content>
        <Modal
          destroyOnClose
          title={intl.get('hsgp.nodeGrayGroup.view.message.createNodeGray').d('新建灰度发布')}
          onCancel={() => this.handleModalVisible(false)}
          onOk={this.handleSaveData}
          visible={modalVisible}
          confirmLoading={confirm}
        >
          <Form>
            <FormItem
              label={intl.get('hsgp.nodeGrayGroup.model.nodeGrayGroup.grayName').d('灰度发布名称')}
              {...formLayout}
            >
              {getFieldDecorator('addGrayName', {
                rules: [
                  {
                    required: true,
                    message: intl
                      .get('hsgp.nodeGrayGroup.view.message.inputGrayName')
                      .d('请输入灰度发布名称'),
                  },
                ],
              })(<Input />)}
            </FormItem>
          </Form>
        </Modal>
      </React.Fragment>
    );
  }
}
