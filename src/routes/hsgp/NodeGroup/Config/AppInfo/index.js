/**
 * 节点组维护 - 新建节点组 - 应用信息步骤
 * @date: 2018-9-10
 * @author: 王家程 <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Form, Input, Icon, Button, Row, Col, Table, Popconfirm, Spin } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import notification from 'utils/notification';
import { Content } from 'components/Page';
import Checkbox from 'components/Checkbox';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';

import SourceLov from '../../../SourceLov';
import styles from '../index.less';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
@connect(({ loading, nodeGroup }) => ({
  loading,
  nodeGroup,
  fetchLovLoading: loading.effects['nodeGroup/fetchRuleLovList'],
  fetchGrayLovLoading: loading.effects['nodeGroup/fetchGrayLovList'],
}))
@formatterCollections({ code: 'hsgp.nodeGroup' })
export default class AppInfo extends React.PureComponent {
  state = {
    lovModalVisible: false,
    grayLovModalVisible: false,
  };

  componentDidMount() {
    const {
      match: {
        params: { nodeGroupId },
      },
    } = this.props;
    if (nodeGroupId !== 'create') {
      this.fetchNodeGroupDetail();
    }
  }

  /**
   * 获取节点组详情数据
   * @param {object} params - 请求参数
   */
  fetchNodeGroupDetail(params = {}) {
    const {
      dispatch,
      match: {
        params: { productId, productEnvId, nodeGroupId },
      },
    } = this.props;
    dispatch({
      type: 'nodeGroup/fetchNodeGroupDetail',
      payload: { productId, productEnvId, nodeGroupId, ...params },
    }).then(res => {
      if (res) {
        dispatch({
          type: 'nodeGroup/fetchRuleList',
          payload: { productId, productEnvId, nodeGroupId, ...params },
        });
        // 如果设置了灰度规则，则查询灰度规则列表
        if (res.grayFlag) {
          dispatch({
            type: 'nodeGroup/fetchGrayRuleList',
            payload: { productId, productEnvId, nodeGroupId, ...params },
          });
        }
      }
    });
  }

  /**
   * 前往下一步，选择版本及应用
   */
  @Bind()
  handleNextStep() {
    const {
      history,
      form,
      dispatch,
      match: {
        params: { nodeGroupId, productId, productEnvId },
      },
      nodeGroup: { commonNodeRuleList = [], grayNodeRuleList = [] },
    } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        if (!fieldsValue.commonFlag && commonNodeRuleList.length === 0) {
          notification.warning({
            message: intl.get('hsgp.nodeGroup.view.message.title.add').d('请选择节点组规则'),
          });
          return;
        }
        if (fieldsValue.grayFlag && grayNodeRuleList.length === 0) {
          notification.warning({
            message: '请选择灰度规则',
          });
          return;
        }
        dispatch({
          type: 'nodeGroup/updateState',
          payload: {
            appData: {
              ...fieldsValue,
              commonNodeRuleList,
              grayNodeRuleList,
            },
          },
        });
        history.push(`/hsgp/node-group/${productId}/${productEnvId}/${nodeGroupId}/version`);
      }
    });
  }

  /**
   * @function - handleDelete - 删除节点组规则
   * @param {object} record - 行数据
   */
  handleDelete(record) {
    const {
      dispatch,
      nodeGroup: { commonNodeRuleList = {} },
    } = this.props;
    const newContent = commonNodeRuleList.filter(item => item.nodeRuleId !== record.nodeRuleId);
    dispatch({
      type: 'nodeGroup/updateState',
      payload: { commonNodeRuleList: newContent },
    });
    notification.success();
  }

  @Bind()
  fetchRuleLov(params = {}) {
    const {
      dispatch,
      match: {
        params: { productId, productEnvId },
      },
    } = this.props;
    dispatch({
      type: 'nodeGroup/fetchRuleLovList',
      payload: {
        productId,
        productEnvId,
        ...params,
      },
    });
  }

  @Bind()
  openLovModal() {
    this.fetchRuleLov();
    this.setState({ lovModalVisible: true });
  }

  @Bind()
  handleCloseRuleLov() {
    this.setState({ lovModalVisible: false });
  }

  /**
   * @function handleRuleLovOk - 选择节点组规则数据
   * @param {object} record - 选择的数据
   */
  @Bind()
  handleRuleLovOk(record) {
    const {
      dispatch,
      nodeGroup: { commonNodeRuleList = [] },
    } = this.props;
    if (commonNodeRuleList.length === 0) {
      commonNodeRuleList.push(record);
    } else {
      const flag = commonNodeRuleList.some(item => {
        return item.nodeRuleId === record.nodeRuleId;
      });
      if (flag) {
        notification.warning({
          message: intl.get('hsgp.nodeGroup.view.message.title.repeat').d('所选规则已存在'),
        });
        return;
      } else {
        commonNodeRuleList.push(record);
      }
    }
    dispatch({
      type: 'nodeGroup/updateState',
      payload: { commonNodeRuleList },
    });
  }

  @Bind()
  fetchGrayLov(params = {}) {
    const {
      dispatch,
      match: {
        params: { productId, productEnvId },
      },
    } = this.props;
    dispatch({
      type: 'nodeGroup/fetchGrayLovList',
      payload: {
        productId,
        productEnvId,
        ...params,
      },
    });
  }

  /**
   * @function - handleDeleteGray - 删除灰度规则
   * @param {object} record - 行数据
   */
  handleDeleteGray(record) {
    const {
      dispatch,
      nodeGroup: { grayNodeRuleList = [] },
    } = this.props;
    const newContent = grayNodeRuleList.filter(item => item.nodeRuleId !== record.nodeRuleId);
    dispatch({
      type: 'nodeGroup/updateState',
      payload: { grayNodeRuleList: newContent },
    });
    notification.success();
  }

  @Bind()
  openGrayLovModal(flag) {
    if (flag) {
      this.fetchGrayLov();
    }
    this.setState({ grayLovModalVisible: flag });
  }

  /**
   * @function handleGrayLovOk - 选择节点组规则数据
   * @param {object} record - 选择的数据
   */
  @Bind()
  handleGrayLovOk(record) {
    const {
      dispatch,
      nodeGroup: { grayNodeRuleList = [] },
    } = this.props;
    if (grayNodeRuleList.length === 0) {
      grayNodeRuleList.push(record);
    } else {
      const flag = grayNodeRuleList.some(item => {
        return item.nodeRuleId === record.nodeRuleId;
      });
      if (flag) {
        notification.warning({
          message: intl.get('hsgp.nodeGroup.view.message.title.repeat').d('所选规则已存在'),
        });
        return;
      } else {
        grayNodeRuleList.push(record);
      }
    }
    dispatch({
      type: 'nodeGroup/updateState',
      payload: { grayNodeRuleList },
    });
  }

  /**
   * 监听灰度设置标识
   * @param {object} e 灰度标识
   */
  @Bind()
  handleGrayChange({ target: { value = 0 } }) {
    const { dispatch } = this.props;
    // 灰度为false时，清空灰度规则列表
    if (!value) {
      dispatch({
        type: 'nodeGroup/updateState',
        payload: { grayNodeRuleList: [] },
      });
    }
  }

  render() {
    const {
      loading,
      form,
      getCurrentStep,
      fetchLovLoading = false,
      fetchGrayLovLoading = false,
      match: {
        params: { nodeGroupId },
      },
      nodeGroup: {
        commonNodeRuleList = [],
        appData = {},
        ruleLovList = {},
        grayNodeRuleList = [],
        grayLovList = {},
      },
    } = this.props;
    const { lovModalVisible, grayLovModalVisible } = this.state;
    const { nodeGroupName, commonFlag = 1, grayFlag = 0 } = appData;
    const { getFieldDecorator } = form;
    const requestLoading = {
      init: loading.effects['nodeGroup/fetchNodeGroupDetail'],
    };
    // 节点组规则 lov props
    const lovModalProps = {
      rowKey: 'nodeRuleId',
      visible: lovModalVisible,
      onOk: this.handleRuleLovOk,
      onCancel: this.handleCloseRuleLov,
      onSearch: this.fetchRuleLov,
      dataSource: ruleLovList,
      loading: fetchLovLoading,
      columns: [
        {
          title: '规则ID',
          width: 150,
          dataIndex: 'nodeRuleId',
        },
        {
          title: '规则名称',
          dataIndex: 'ruleName',
        },
      ],
    };
    const ruleColumns = [
      {
        title: intl.get('hsgp.nodeGroup.model.nodeGroup.nodeRuleId').d('规则ID'),
        width: 100,
        align: 'center',
        dataIndex: 'nodeRuleId',
      },
      {
        title: intl.get('hsgp.nodeGroup.model.nodeGroup.ruleName').d('规则名称'),
        align: 'center',
        dataIndex: 'ruleName',
      },
    ];
    const columns = [
      ...ruleColumns,
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 85,
        dataIndex: 'editor',
        render: (text, record) => {
          return (
            <Popconfirm
              title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录')}
              onConfirm={() => {
                this.handleDelete(record);
              }}
            >
              <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
            </Popconfirm>
          );
        },
      },
    ];
    // 灰度规则 lov props
    const grayLovModalProps = {
      ...lovModalProps,
      visible: grayLovModalVisible,
      onOk: this.handleGrayLovOk,
      onCancel: () => this.openGrayLovModal(false),
      onSearch: this.fetchGrayLov,
      dataSource: grayLovList,
      loading: fetchGrayLovLoading,
    };
    const grayColumns = [
      ...ruleColumns,
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 80,
        align: 'center',
        dataIndex: 'editor',
        render: (text, record) => {
          return (
            <Popconfirm
              title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录')}
              onConfirm={() => {
                this.handleDeleteGray(record);
              }}
            >
              <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
            </Popconfirm>
          );
        },
      },
    ];
    return (
      <Content>
        <Spin spinning={nodeGroupId === 'create' ? false : requestLoading.init}>
          <Form>
            <Row type="flex" justify="center">
              <Col span={16}>
                <FormItem
                  label={
                    <span>
                      <Icon type="appstore-o" className={styles['node-group-icon']} />
                      节点组名称
                    </span>
                  }
                  {...formLayout}
                >
                  {getFieldDecorator('nodeGroupName', {
                    initialValue: nodeGroupName,
                    rules: [
                      {
                        type: 'string',
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: '节点组名称',
                        }),
                      },
                      {
                        max: 80,
                        message: intl.get('hzero.common.validation.max', {
                          max: 80,
                        }),
                      },
                    ],
                  })(<Input />)}
                </FormItem>
              </Col>
            </Row>
            <Row type="flex" justify="center">
              <Col span={16}>
                <FormItem
                  label={
                    <span>
                      <Icon type="tool" className={styles['node-group-icon']} />
                      通用
                    </span>
                  }
                  {...formLayout}
                >
                  {getFieldDecorator('commonFlag', {
                    initialValue: commonFlag,
                  })(<Checkbox />)}
                </FormItem>
              </Col>
            </Row>
            <Row type="flex" justify="center">
              <Col span={16}>
                <FormItem
                  label={
                    <span>
                      <Icon type="key" className={styles['node-group-icon']} />
                      {intl.get('hsgp.nodeGroup.model.nodeGroup.grayFlag').d('灰度')}
                    </span>
                  }
                  {...formLayout}
                >
                  {getFieldDecorator('grayFlag', {
                    initialValue: grayFlag,
                  })(
                    <Checkbox
                      disabled={nodeGroupId !== 'create'}
                      onChange={this.handleGrayChange}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row type="flex" justify="center">
              <Col span={16}>
                <FormItem
                  label={
                    <span>
                      <Icon type="unlock" className={styles['node-group-icon']} />
                      {intl.get('hsgp.nodeGroup.view.message.title.nodeRule').d('节点组规则')}
                    </span>
                  }
                  {...formLayout}
                >
                  <SourceLov
                    isButton
                    style={{ marginBottom: 12 }}
                    onClick={this.openLovModal}
                    lovModalProps={lovModalProps}
                  >
                    新建规则
                  </SourceLov>
                  <Table
                    bordered
                    resizable={false}
                    rowKey="nodeRuleId"
                    dataSource={commonNodeRuleList}
                    columns={columns}
                    scroll={{ x: tableScrollWidth(columns) }}
                    pagination={false}
                  />
                </FormItem>
              </Col>
            </Row>
            {!!form.getFieldValue('grayFlag') && (
              <Row type="flex" justify="center">
                <Col span={16}>
                  <FormItem
                    label={
                      <span>
                        <Icon type="unlock" className={styles['node-group-icon']} />
                        灰度规则
                      </span>
                    }
                    {...formLayout}
                  >
                    <SourceLov
                      isButton
                      style={{ marginBottom: 12 }}
                      onClick={() => this.openGrayLovModal(true)}
                      lovModalProps={grayLovModalProps}
                    >
                      新建规则
                    </SourceLov>
                    <Table
                      bordered
                      rowKey="nodeRuleId"
                      dataSource={grayNodeRuleList}
                      columns={grayColumns}
                      pagination={false}
                    />
                  </FormItem>
                </Col>
              </Row>
            )}
            <Row type="flex" justify="center">
              <Col>
                <Button
                  type="primary"
                  style={{ margin: '12px 8px 0' }}
                  onClick={this.handleNextStep}
                >
                  {intl.get('hzero.common.button.next').d('下一步')}
                </Button>
                {getCurrentStep() !== 0 && (
                  <Button>{intl.get('hzero.common.button.previous').d('上一步')}</Button>
                )}
              </Col>
            </Row>
          </Form>
        </Spin>
      </Content>
    );
  }
}
