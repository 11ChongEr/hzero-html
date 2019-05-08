/**
 * deployPlatform - 部署平台
 * @date: 2018-11-19
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Button, Table, Popconfirm } from 'hzero-ui';
import { Bind, Debounce } from 'lodash-decorators';

import { Content, Header } from 'components/Page';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { enableRender } from 'utils/renderer';
import notification from 'utils/notification';
import { tableScrollWidth } from 'utils/utils';

import FilterForm from './FilterForm';
import Drawer from './Drawer';

@formatterCollections({ code: ['hsgp.deployPlatform'] })
@connect(({ loading, deployPlatform }) => ({
  deployPlatform,
  fetchLoading: loading.effects['deployPlatform/fetchDeployPlatformList'],
  fetchDetailLoading: loading.effects['deployPlatform/fetchDeployPlatformDetail'],
  createLoading: loading.effects['deployPlatform/createDeployPlatform'],
  updateLoading: loading.effects['deployPlatform/updateDeployPlatform'],
}))
export default class DeployPlatform extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      fieldsValue: {},
    };
  }

  componentDidMount() {
    this.fetchDeployPlatformList();
  }

  /**
   * 获取列表数据
   * @param {object} params - 请求参数
   */
  fetchDeployPlatformList(params = {}) {
    const {
      dispatch,
      deployPlatform: { pagination = {} },
    } = this.props;
    const { fieldsValue } = this.state;
    dispatch({
      type: 'deployPlatform/fetchDeployPlatformList',
      payload: { ...fieldsValue, page: pagination, ...params },
    });
  }

  /**
   * handlePagination - 分页设置
   * @param {object} pagination - 分页对象
   */
  @Bind()
  handlePagination(pagination) {
    this.fetchDeployPlatformList({ page: pagination });
  }

  /**
   * 控制modal显示与隐藏
   * @param {boolean}} flag 是否显示modal
   */
  handleModalVisible(flag) {
    this.setState({ modalVisible: flag });
  }

  /**
   * 显示编辑模态框
   * @param {object} record - 编辑的行数据
   */
  @Bind()
  showModal(record = {}) {
    const {
      dispatch,
      deployPlatform: { linkPlatformList = [] },
    } = this.props;
    if (record.deployPlatformId) {
      dispatch({
        type: 'deployPlatform/fetchDeployPlatformDetail',
        payload: { deployPlatformId: record.deployPlatformId },
      });
    }
    if (Array.isArray(linkPlatformList) && linkPlatformList.length === 0) {
      dispatch({
        type: 'deployPlatform/fetchValueSet',
      });
    }
    dispatch({
      type: 'deployPlatform/updateState',
      payload: { deployPlatformDetail: {} },
    });
    this.handleModalVisible(true, record);
  }

  /**
   * 关闭模态框
   */
  @Bind()
  hideModal() {
    this.handleModalVisible(false);
  }

  /**
   * 查询应用来源
   * @param {object} form - 查询表单
   */
  @Bind()
  handleSearch(form) {
    const fieldsValue = form.getFieldsValue();
    this.setState({ fieldsValue });
    this.fetchDeployPlatformList({ ...fieldsValue, page: {} });
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
   * 删除应用来源
   * @param {object} record - 行数据
   */
  @Bind()
  handleDeleteDeployPlatform(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'deployPlatform/deleteDeployPlatform',
      payload: record,
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchDeployPlatformList();
      }
    });
  }

  /**
   * 设置启用禁用
   * @param {object} record - 行数据
   */
  @Bind()
  @Debounce(500)
  handleSetEnabled(record, flag) {
    const { dispatch } = this.props;
    dispatch({
      type: `deployPlatform/${flag ? 'enabledDeployPlatform' : 'disabledDeployPlatform'}`,
      payload: {
        ...record,
        enabledFlag: flag,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchDeployPlatformList();
      }
    });
  }

  @Bind()
  handleSaveDeployPlatform(fieldsValue) {
    const {
      dispatch,
      deployPlatform: { deployPlatformDetail = {} },
    } = this.props;
    const { platformCode, platformName, sourceKey, description, ...other } = fieldsValue;
    const params = deployPlatformDetail.deployPlatformId
      ? {
          ...deployPlatformDetail,
          platformCode,
          platformName,
          sourceKey,
          description,
          config: other,
        }
      : {
          platformCode,
          platformName,
          sourceKey,
          description,
          config: other,
          enabledFlag: 1,
        };
    dispatch({
      type: `deployPlatform/${
        deployPlatformDetail.deployPlatformId !== undefined
          ? 'updateDeployPlatform'
          : 'createDeployPlatform'
      }`,
      payload: params,
    }).then(res => {
      if (res) {
        this.hideModal();
        notification.success();
        this.fetchDeployPlatformList();
      }
    });
  }

  render() {
    const {
      fetchLoading = false,
      updateLoading = false,
      createLoading = false,
      fetchDetailLoading = false,
      deployPlatform: {
        deployPlatformList = [],
        pagination = {},
        deployPlatformDetail = {},
        linkPlatformList = [],
        grantTypeList = [],
      },
    } = this.props;
    const { modalVisible } = this.state;
    const columns = [
      {
        title: intl.get('hsgp.deployPlatform.model.deployPlatform.platformCode').d('平台编码'),
        width: 300,
        dataIndex: 'platformCode',
      },
      {
        title: intl.get('hsgp.deployPlatform.model.deployPlatform.platformName').d('平台名称'),
        dataIndex: 'platformName',
      },
      {
        title: intl.get('hsgp.common.model.common.description').d('描述'),
        dataIndex: 'description',
      },
      {
        title: intl.get('hsgp.deployPlatform.model.deployPlatform.sourceName').d('连接平台'),
        dataIndex: 'sourceName',
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        width: 80,
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 150,
        render: (text, record) => {
          return (
            <span className="action-link">
              <a onClick={() => this.showModal(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              {record.enabledFlag === 1 ? (
                <a onClick={() => this.handleSetEnabled(record, 0)}>
                  {intl.get('hzero.common.button.disable').d('禁用')}
                </a>
              ) : (
                <a onClick={() => this.handleSetEnabled(record, 1)}>
                  {intl.get('hzero.common.button.enable').d('启用')}
                </a>
              )}
              <Popconfirm
                title={intl
                  .get('hsgp.nodeRule.view.message.confirm.remove')
                  .d('是否删除此条记录？')}
                onConfirm={() => this.handleDeleteDeployPlatform(record)}
              >
                <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
              </Popconfirm>
            </span>
          );
        },
      },
    ];
    return (
      <React.Fragment>
        <Header title={intl.get('hsgp.deployPlatform.view.message.title').d('部署平台')}>
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
            rowKey="deployPlatformId"
            loading={fetchLoading}
            dataSource={deployPlatformList}
            columns={columns}
            scroll={{ x: tableScrollWidth(columns) }}
            onChange={this.handlePagination}
            pagination={pagination}
          />
          <Drawer
            title={
              deployPlatformDetail.deployPlatformId !== undefined
                ? intl.get('hsgp.deployPlatform.view.message.title.editor.edit').d('编辑部署平台')
                : intl.get('hsgp.deployPlatform.view.message.title.editor.create').d('新建部署平台')
            }
            initLoading={fetchDetailLoading}
            loading={
              deployPlatformDetail.deployPlatformId !== undefined ? updateLoading : createLoading
            }
            modalVisible={modalVisible}
            grantTypeList={grantTypeList}
            linkPlatformList={linkPlatformList}
            initData={deployPlatformDetail}
            onCancel={this.hideModal}
            onOk={this.handleSaveDeployPlatform}
          />
        </Content>
      </React.Fragment>
    );
  }
}
