/**
 * apiManage - api管理
 * @date: 2018-11-27
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Table, Button, Cascader, Modal, Tag } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { Content, Header } from 'components/Page';

import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { tableScrollWidth } from 'utils/utils';

import Drawer from './Drawer';
import FilterForm from './FilterForm';

@formatterCollections({ code: ['hsgp.apiManage'] })
@connect(({ loading, apiManage }) => ({
  apiManage,
  fetchLoading: loading.effects['apiManage/fetchApiManageList'],
  fetchDetailLoading: loading.effects['apiManage/fetchApiManageDetail'],
  updateLoading: loading.effects['apiManage/updateApiManage'],
  refreshLoading: loading.effects['apiManage/refreshApi'],
}))
export default class ApiManage extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
    };
  }

  form;

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'apiManage/queryWithVersion',
    }).then(res => {
      if (res) {
        this.fetchApiList();
        // 查询某个服务下的版本
        this.queryVersionWithService();
      }
    });
  }

  /**
   * 获取查询表单组件this对象
   * @param {object} ref - 查询表单组件this
   */
  @Bind()
  handleBindRef(ref) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 获取服务/版本值集
   * @param {object} params - 查询参数
   */
  queryVersionWithService(params = {}) {
    const {
      dispatch,
      apiManage: { defaultServiceVersion: defaultValue = [] },
    } = this.props;
    dispatch({
      type: 'apiManage/queryVersionWithService',
      payload: { serviceId: defaultValue[0], ...params },
    });
  }

  /**
   * 获取api列表数据
   * @param {object} params - 查询参数
   */
  @Bind()
  fetchApiList(params = {}) {
    const {
      dispatch,
      apiManage: { pagination = {}, defaultServiceVersion: defaultValue = [] },
    } = this.props;
    const filterValue = this.form === undefined ? {} : this.form.getFieldsValue();
    dispatch({
      type: 'apiManage/fetchApiManageList',
      payload: {
        page: pagination,
        serviceId: defaultValue[0],
        serviceVersionId: defaultValue[1],
        ...filterValue,
        ...params,
      },
    });
  }

  /**
   * 切换服务及版本
   * @param {array} value - 选择的数据
   */
  @Bind()
  handleChangeVersion(value) {
    const { dispatch } = this.props;
    // 切换服务及版本后，更新当前所使用的服务及版本
    dispatch({
      type: 'apiManage/updateState',
      payload: { defaultServiceVersion: value },
    });
    // 清空查询条件
    this.form.resetFields();
    this.fetchApiList({ serviceId: value[0], serviceVersionId: value[1] });
    this.queryVersionWithService({ serviceId: value[0] });
  }

  /**
   * 查询表单
   */
  @Bind()
  handleSearch() {
    this.fetchApiList({ page: {} });
  }

  /**
   * 重置查询表单
   */
  @Bind()
  handleResetSearch() {
    this.form.resetFields();
  }

  /**
   * 显示详情模态框
   * @param {object} record - hand数据
   */
  @Bind()
  handleShowModal(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'apiManage/fetchApiManageDetail',
      payload: record,
    });
    this.setState({ modalVisible: true });
  }

  /**
   * 关闭抽屉弹窗
   */
  @Bind()
  handleHideModal() {
    this.setState({ modalVisible: false });
  }

  /**
   * handlePagination - 分页设置
   * @param {object} pagination - 分页对象
   */
  @Bind()
  handlePagination(pagination) {
    this.fetchApiList({ page: pagination });
  }

  /**
   * 刷新API
   */
  @Bind()
  handleRefreshApi() {
    const {
      dispatch,
      apiManage: { defaultServiceVersion: defaultValue = [] },
    } = this.props;
    // 保存 class 的 this 指向
    const that = this;
    Modal.confirm({
      title: intl.get('hsgp.common.view.message.confirm.refresh').d('确定要刷新?'),
      content: intl
        .get('hsgp.apiManage.view.message.refresh.description')
        .d('刷新将删除并重新拉取该版本的API'),
      onOk() {
        dispatch({
          type: 'apiManage/refreshApi',
          payload: {
            serviceId: defaultValue[0],
            serviceVersionId: defaultValue[1],
          },
        }).then(res => {
          if (res) {
            notification.success();
            that.fetchApiList();
          }
        });
      },
    });
  }

  render() {
    const {
      fetchLoading = false,
      fetchDetailLoading = false,
      updateAppLoading = false,
      refreshLoading = false,
      apiManage: {
        apiManageList = [],
        pagination = {},
        apiManageDetail = {},
        serviceWithVersionList = [],
        defaultServiceVersion = [],
        versionList = [],
      },
    } = this.props;
    const { modalVisible } = this.state;
    const columns = [
      {
        title: intl.get('hsgp.apiManage.model.apiManage.api').d('API'),
        dataIndex: 'path',
        render: (val, record) => {
          return <a onClick={() => this.handleShowModal(record)}>{val}</a>;
        },
      },
      {
        title: intl.get('hsgp.apiManage.model.apiManage.method').d('方法'),
        width: 80,
        dataIndex: 'method',
      },
      {
        title: intl.get('hsgp.apiManage.model.apiManage.tag').d('标签'),
        width: 200,
        dataIndex: 'tag',
      },
      {
        title: intl.get('hsgp.common.model.common.description').d('描述'),
        dataIndex: 'description',
      },
      {
        title: intl.get('hsgp.apiManage.model.apiManage.status').d('变更状态'),
        dataIndex: 'status',
        render: (val, record) => {
          const { statusList = [] } = record;
          return statusList.map(item => {
            if (item.level < 6) {
              return (
                <Tag key={item.code} color="green">
                  {item.meaning}
                </Tag>
              );
            } else if (item.level < 11) {
              return (
                <Tag key={item.code} color="gold">
                  {item.meaning}
                </Tag>
              );
            } else if (item.level < 16) {
              return (
                <Tag key={item.code} color="orange">
                  {item.meaning}
                </Tag>
              );
            } else {
              return (
                <Tag key={item.code} color="red">
                  {item.meaning}
                </Tag>
              );
            }
          });
        },
      },
    ];
    return (
      <React.Fragment>
        <Header title={intl.get('hsgp.apiManage.view.title').d('API 管理')}>
          <Button
            style={{ marginLeft: 10 }}
            type="primary"
            icon="sync"
            loading={refreshLoading}
            onClick={this.handleRefreshApi}
          >
            {intl.get('hsgp.apiManage.view.button.refresh').d('刷新API')}
          </Button>
          <span>
            {`${intl.get('hsgp.common.view.title.service').d('服务')}/${intl
              .get('hsgp.common.view.title.version')
              .d('版本')}：`}
            <Cascader
              style={{ width: 300 }}
              disabled={refreshLoading}
              placeholder=""
              expandTrigger="hover"
              allowClear={false}
              value={defaultServiceVersion}
              options={serviceWithVersionList}
              fieldNames={{ label: 'meaning', value: 'value', children: 'children' }}
              onChange={this.handleChangeVersion}
            />
          </span>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm
              onSearch={this.handleSearch}
              onReset={this.handleResetSearch}
              onRef={this.handleBindRef}
              versionList={versionList}
            />
          </div>
          <Table
            bordered
            rowKey="apiId"
            loading={fetchLoading || refreshLoading}
            dataSource={apiManageList}
            columns={columns}
            scroll={{ x: tableScrollWidth(columns) }}
            onChange={this.handlePagination}
            pagination={pagination}
          />
          <Drawer
            title={intl.get('hsgp.apiManage.view.message.editor.edit').d('API 详情')}
            initLoading={fetchDetailLoading}
            loading={updateAppLoading}
            modalVisible={modalVisible}
            initData={apiManageDetail}
            onCancel={this.handleHideModal}
            onOk={this.handleSaveAppSource}
          />
        </Content>
      </React.Fragment>
    );
  }
}
