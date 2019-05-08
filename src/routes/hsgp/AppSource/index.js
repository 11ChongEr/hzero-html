/**
 * appSource - 应用来源
 * @date: 2018-11-19
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Table, Popconfirm, Button } from 'hzero-ui';

import { Header, Content } from 'components/Page';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { enableRender } from 'utils/renderer';
import { tableScrollWidth } from 'utils/utils';

import FilterForm from './FilterForm';
import Drawer from './Drawer';

@formatterCollections({ code: ['hsgp.appSource'] })
@connect(({ loading, appSource }) => ({
  appSource,
  fetchAppLoading: loading.effects['appSource/fetchAppSourceList'],
  fetchDetailLoading: loading.effects['appSource/fetchAppSourceDetail'],
  createAppLoading: loading.effects['appSource/createAppSource'],
  updateAppLoading: loading.effects['appSource/updateAppSource'],
}))
export default class AppSource extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      fieldsValue: {},
    };
  }

  componentDidMount() {
    this.fetchAppSourceList();
  }

  /**
   * 获取列表数据
   * @param {object} params - 请求参数
   */
  fetchAppSourceList(params = {}) {
    const {
      dispatch,
      appSource: { pagination = {} },
    } = this.props;
    const { fieldsValue } = this.state;
    dispatch({
      type: 'appSource/fetchAppSourceList',
      payload: { ...fieldsValue, page: pagination, ...params },
    });
  }

  /**
   * handlePagination - 分页设置
   * @param {object} pagination - 分页对象
   */
  @Bind()
  handlePagination(pagination) {
    this.fetchAppSourceList({ page: pagination });
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
      appSource: { sourceList = [] },
    } = this.props;
    if (record.appSourceId !== undefined) {
      dispatch({
        type: 'appSource/fetchAppSourceDetail',
        payload: { appSourceId: record.appSourceId },
      });
    }
    if (Array.isArray(sourceList) && sourceList.length === 0) {
      dispatch({
        type: 'appSource/init',
      });
    }
    dispatch({
      type: 'appSource/updateState',
      payload: { appSourceDetail: {} },
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
    this.fetchAppSourceList({ ...fieldsValue, page: {} });
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
  handleDeleteAppSource(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'appSource/deleteAppSource',
      payload: record,
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchAppSourceList();
      }
    });
  }

  /**
   * 启用禁用
   * @param {object} record - 行数据
   */
  @Bind()
  handleSetEnabled(record, flag) {
    const { dispatch } = this.props;
    dispatch({
      type: `appSource/${flag ? 'enabledAppSource' : 'disabledAppSource'}`,
      payload: { ...record, enabledFlag: flag },
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchAppSourceList();
      }
    });
  }

  /**
   * 保存应用来源
   * @param {object} fieldsValue - 更新的数据
   */
  @Bind()
  handleSaveAppSource(fieldsValue) {
    const {
      dispatch,
      appSource: { appSourceDetail = {} },
    } = this.props;
    const { appSourceCode, appSourceName, sourceKey, description, ...other } = fieldsValue;
    const params = appSourceDetail.appSourceId
      ? {
          ...appSourceDetail,
          appSourceCode,
          appSourceName,
          sourceKey,
          description,
          config: other,
        }
      : { appSourceCode, appSourceName, sourceKey, description, config: other, enabledFlag: 1 };
    dispatch({
      type: `appSource/${
        appSourceDetail.appSourceId !== undefined ? 'updateAppSource' : 'createAppSource'
      }`,
      payload: params,
    }).then(res => {
      if (res) {
        notification.success();
        this.hideModal();
        this.fetchAppSourceList();
      }
    });
  }

  render() {
    const {
      fetchAppLoading = false,
      createAppLoading = false,
      updateAppLoading = false,
      fetchDetailLoading = false,
      appSource: {
        appSourceList = [],
        pagination = {},
        sourceList = [],
        grantTypeList = [],
        appSourceDetail = {},
      },
    } = this.props;
    const { modalVisible } = this.state;
    const columns = [
      {
        title: intl.get('hsgp.common.model.common.appSourceCode').d('来源编码'),
        width: 300,
        dataIndex: 'appSourceCode',
      },
      {
        title: intl.get('hsgp.common.model.common.appSourceName').d('来源名称'),
        dataIndex: 'appSourceName',
      },
      {
        title: intl.get('hsgp.common.model.common.description').d('描述'),
        dataIndex: 'description',
      },
      {
        title: intl.get('hsgp.appSource.model.appSource.sourceName').d('应用源'),
        dataIndex: 'sourceName',
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 80,
        dataIndex: 'enabledFlag',
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
                onConfirm={() => this.handleDeleteAppSource(record)}
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
        <Header title={intl.get('hsgp.appSource.view.message.title').d('应用来源')}>
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
            rowKey="appSourceId"
            loading={fetchAppLoading}
            dataSource={appSourceList}
            columns={columns}
            scroll={{ x: tableScrollWidth(columns) }}
            onChange={this.handlePagination}
            pagination={pagination}
          />
          <Drawer
            title={
              appSourceDetail.appSourceId !== undefined
                ? intl.get('hsgp.appSource.view.message.title.editor.edit').d('编辑应用来源')
                : intl.get('hsgp.appSource.view.message.title.editor.create').d('新建应用来源')
            }
            initLoading={fetchDetailLoading}
            loading={
              appSourceDetail.appSourceId !== undefined ? updateAppLoading : createAppLoading
            }
            modalVisible={modalVisible}
            initData={appSourceDetail}
            grantTypeList={grantTypeList}
            sourceList={sourceList}
            onCancel={this.hideModal}
            onOk={this.handleSaveAppSource}
          />
        </Content>
      </React.Fragment>
    );
  }
}
