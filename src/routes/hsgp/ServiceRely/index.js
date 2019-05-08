/**
 * serviceRely - 服务依赖
 * @date: 2018-11-27
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Table, Popconfirm, Button, Cascader } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { Content, Header } from 'components/Page';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { tableScrollWidth } from 'utils/utils';

import Drawer from './Drawer';

@formatterCollections({ code: ['hsgp.serviceRely'] })
@connect(({ loading, serviceRely }) => ({
  serviceRely,
  fetchLoading: loading.effects['serviceRely/fetchServiceRelyList'],
  createLoading: loading.effects['serviceRely/createServiceRely'],
}))
export default class ServiceRely extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      relyModalVisible: false,
    };
  }

  componentDidMount() {
    this.queryWithVersion().then(res => {
      if (res) {
        this.fetchServiceRelyList();
      }
    });
  }

  queryWithVersion(params = {}) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'serviceRely/queryWithVersion',
      payload: params,
    });
  }

  fetchServiceRelyList(params = {}) {
    const {
      dispatch,
      serviceRely: { pagination = {}, defaultServiceVersion: defaultValue = [] },
    } = this.props;
    dispatch({
      type: 'serviceRely/fetchServiceRelyList',
      payload: {
        page: pagination,
        serviceId: defaultValue[0],
        serviceVersionId: defaultValue[1],
        ...params,
      },
    });
  }

  /**
   * 控制modal显示与隐藏
   * @param {boolean}} flag 是否显示modal
   */
  handleModalVisible(flag) {
    this.setState({ relyModalVisible: flag });
  }

  /**
   * 显示编辑模态框
   */
  @Bind()
  showModal() {
    this.handleModalVisible(true);
  }

  /**
   * 关闭模态框
   */
  @Bind()
  hideModal() {
    this.handleModalVisible(false);
  }

  /**
   * 删除版本
   * @param {object} record - 编辑的行数据
   */
  @Bind()
  handleDeleteVersion(record = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'serviceRely/deleteServiceRely',
      payload: record,
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchServiceRelyList();
      }
    });
  }

  @Bind()
  handleChangeVersion(value) {
    const { dispatch } = this.props;
    // 设置当前所用的服务和产品
    dispatch({
      type: 'serviceRely/updateState',
      payload: { defaultServiceVersion: value },
    });
    this.fetchServiceRelyList({ serviceId: value[0], serviceVersionId: value[1] });
  }

  @Bind()
  handleUpdateVersion(fieldsValue) {
    const {
      dispatch,
      serviceRely: { defaultServiceVersion: defaultValue = [] },
    } = this.props;
    dispatch({
      type: 'serviceRely/createServiceRely',
      payload: { serviceId: defaultValue[0], serviceVersionId: defaultValue[1], ...fieldsValue },
    }).then(res => {
      if (res) {
        notification.success();
        this.hideModal();
        this.fetchServiceRelyList();
      }
    });
  }

  /**
   * handlePagination - 分页设置
   * @param {object} pagination - 分页对象
   */
  @Bind()
  handlePagination(pagination) {
    this.fetchServiceRelyList({ page: pagination });
  }

  render() {
    const {
      fetchLoading = false,
      createLoading = false,
      fetchDetailLoading = false,
      serviceRely: {
        serviceRelyList = [],
        serviceLovList = {},
        serviceWithVersionList = [],
        defaultServiceVersion = [],
      },
      pagination = {},
    } = this.props;
    const { relyModalVisible } = this.state;
    const drawerProps = {
      title: intl.get('hsgp.serviceRely.view.message.title.editor.create').d('新建依赖'),
      modalVisible: relyModalVisible,
      serviceLovList,
      loading: createLoading,
      onCancel: this.hideModal,
      onOk: this.handleUpdateVersion,
    };
    const columns = [
      {
        title: intl.get('hsgp.common.model.common.serviceCode').d('服务编码'),
        width: 150,
        dataIndex: 'serviceCode',
      },
      {
        title: intl.get('hsgp.common.model.common.serviceName').d('服务名称'),
        width: 150,
        dataIndex: 'serviceName',
      },
      {
        title: intl.get('hsgp.serviceRely.model.serviceRely.versionNumber').d('依赖版本'),
        dataIndex: 'versionNumber',
      },
      {
        title: intl.get('hsgp.serviceRely.model.serviceRely.relySource').d('来源'),
        width: 150,
        dataIndex: 'relySourceMeaning',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 85,
        render: (text, record) => {
          return (
            <span className="action-link">
              <Popconfirm
                title={intl
                  .get('hsgp.nodeRule.view.message.confirm.remove')
                  .d('是否删除此条记录？')}
                onConfirm={() => this.handleDeleteVersion(record)}
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
        <Header title={intl.get('hsgp.serviceRely.view.message.title').d('依赖管理')}>
          <Button type="primary" icon="plus" onClick={this.showModal} style={{ marginLeft: 10 }}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <span>
            <span>
              {`${intl.get('hsgp.common.view.title.service').d('服务')}/${intl
                .get('hsgp.common.view.title.version')
                .d('版本')}：`}
            </span>
            <Cascader
              style={{ width: 300 }}
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
          <Table
            bordered
            rowKey="serviceRelyId"
            initLoading={fetchDetailLoading}
            loading={fetchLoading}
            dataSource={serviceRelyList}
            columns={columns}
            scroll={{ x: tableScrollWidth(columns) }}
            onChange={this.handlePagination}
            pagination={pagination}
          />
          <Drawer {...drawerProps} />
        </Content>
      </React.Fragment>
    );
  }
}
