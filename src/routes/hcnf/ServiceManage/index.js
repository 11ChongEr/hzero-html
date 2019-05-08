/**
 * ServiceManage - 服务管理
 * @date: 2018-1-23
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Button, Table, Popconfirm } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { Content, Header } from 'components/Page';
import cacheComponent from 'components/CacheComponent';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { tableScrollWidth } from 'utils/utils';

import FilterForm from './FilterForm';
import UpdateDrawer from './Drawer';

@formatterCollections({ code: ['hcnf.serviceManage'] })
@connect(({ loading, hcnfServiceManage }) => ({
  hcnfServiceManage,
  fetchLoading: loading.effects['hcnfServiceManage/fetchServiceManageList'],
  fetchDetailLoading: loading.effects['hcnfServiceManage/fetchServiceManageDetail'],
  createLoading: loading.effects['hcnfServiceManage/createService'],
  updateLoading: loading.effects['hcnfServiceManage/updateService'],
}))
@cacheComponent({ cacheKey: '/hsgp/service-manage/list' })
export default class ServiceManage extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      fieldsValue: {},
    };
  }

  componentDidMount() {
    this.fetchServiceManageList();
  }

  fetchServiceManageList(params = {}) {
    const {
      dispatch,
      hcnfServiceManage: { pagination = {} },
    } = this.props;
    const { fieldsValue } = this.state;
    dispatch({
      type: 'hcnfServiceManage/fetchServiceManageList',
      payload: { ...fieldsValue, page: pagination, ...params },
    });
  }

  /**
   * 查询表单
   * @param {object} form - 查询表单
   */
  @Bind()
  handleSearch(form) {
    const fieldsValue = form.getFieldsValue();
    this.setState({ fieldsValue });
    this.fetchServiceManageList({ ...fieldsValue, page: {} });
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
    const { dispatch } = this.props;
    if (record.serviceId) {
      dispatch({
        type: 'hcnfServiceManage/fetchServiceManageDetail',
        payload: { serviceId: record.serviceId },
      });
    } else {
      dispatch({
        type: 'hcnfServiceManage/updateState',
        payload: { serviceDetail: {} },
      });
    }
    this.handleModalVisible(true);
  }

  /**
   * 关闭模态框
   */
  @Bind()
  hideModal() {
    this.handleModalVisible(false);
  }

  @Bind()
  handleDeleteService(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'hcnfServiceManage/deleteService',
      payload: record,
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchServiceManageList();
      }
    });
  }

  /**
   * handlePagination - 分页设置
   * @param {object} pagination - 分页对象
   */
  @Bind()
  handlePagination(pagination) {
    this.fetchServiceManageList({ page: pagination });
  }

  /**
   * 保存服务汇总
   */
  @Bind()
  handleSaveServiceCollect(fieldsValue) {
    const {
      dispatch,
      hcnfServiceManage: { serviceDetail = {} },
    } = this.props;
    const { serviceCode, serviceName, sourceKey, serviceLogo } = fieldsValue;
    const params =
      serviceDetail.serviceId !== undefined
        ? {
            ...serviceDetail,
            serviceCode,
            serviceName,
            sourceKey,
            serviceLogo,
          }
        : {
            serviceCode,
            serviceName,
            sourceKey,
            serviceLogo,
            enabledFlag: 1,
          };
    dispatch({
      type: `hcnfServiceManage/${
        serviceDetail.serviceId !== undefined ? 'updateService' : 'createService'
      }`,
      payload: params,
    }).then(res => {
      if (res) {
        this.hideModal();
        notification.success();
        this.fetchServiceManageList();
      }
    });
  }

  render() {
    const {
      fetchLoading = false,
      updateLoading = false,
      createLoading = false,
      fetchDetailLoading = false,
      hcnfServiceManage: {
        serviceList = [],
        pagination = {},
        serviceDetail = {},
        serviceValueSetList = [],
      },
    } = this.props;
    const { modalVisible } = this.state;
    const columns = [
      {
        title: intl.get('hsgp.serviceManage.model.serviceCollect.serviceLogo').d('服务图片'),
        dataIndex: 'serviceLogo',
        width: 160,
        render: (text, record) => {
          if (text) {
            return (
              <img
                alt={record.appName}
                src={text}
                width="24"
                height="24"
                style={{ borderRadius: '50%' }}
              />
            );
          } else {
            return '';
          }
        },
      },
      {
        title: intl.get('hsgp.common.model.common.serviceCode').d('服务编码'),
        width: 300,
        dataIndex: 'serviceCode',
      },
      {
        title: intl.get('hsgp.common.model.common.serviceName').d('服务名称'),
        dataIndex: 'serviceName',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 110,
        render: (val, record) => {
          return (
            <span className="action-link">
              <a onClick={() => this.showModal(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              <Popconfirm
                title={intl
                  .get('hsgp.nodeRule.view.message.confirm.remove')
                  .d('是否删除此条记录？')}
                onConfirm={() => this.handleDeleteService(record)}
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
        <Header title={intl.get('hcnf.serviceManage.view.message.title').d('服务管理')}>
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
            rowKey="serviceId"
            loading={fetchLoading}
            dataSource={serviceList}
            columns={columns}
            scroll={{ x: tableScrollWidth(columns) }}
            pagination={pagination}
            onChange={this.handlePagination}
          />
          <UpdateDrawer
            title={
              serviceDetail.serviceId !== undefined
                ? intl.get('hsgp.serviceManage.view.message.title.editor.edit').d('编辑服务')
                : intl.get('hsgp.serviceManage.view.message.title.editor.create').d('新建服务')
            }
            initLoading={fetchDetailLoading}
            loading={serviceDetail.serviceId !== undefined ? updateLoading : createLoading}
            modalVisible={modalVisible}
            serviceValueSetList={serviceValueSetList}
            initData={serviceDetail}
            onCancel={this.hideModal}
            onOk={this.handleSaveServiceCollect}
          />
        </Content>
      </React.Fragment>
    );
  }
}
