/**
 * ServiceCollect - 服务汇总
 * @date: 2018-11-19
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
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

@formatterCollections({ code: ['hsgp.serviceCollect'] })
@connect(({ loading, serviceCollect }) => ({
  serviceCollect,
  fetchLoading: loading.effects['serviceCollect/fetchServiceCollectList'],
  fetchDetailLoading: loading.effects['serviceCollect/fetchServiceCollectDetail'],
  createLoading: loading.effects['serviceCollect/createServiceCollect'],
  updateLoading: loading.effects['serviceCollect/updateServiceCollect'],
}))
@cacheComponent({ cacheKey: '/hsgp/service-manage/list' })
export default class ServiceCollect extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      fieldsValue: {},
    };
  }

  componentDidMount() {
    this.fetchServiceCollectList();
  }

  fetchServiceCollectList(params = {}) {
    const {
      dispatch,
      serviceCollect: { pagination = {} },
    } = this.props;
    const { fieldsValue } = this.state;
    dispatch({
      type: 'serviceCollect/fetchServiceCollectList',
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
    this.fetchServiceCollectList({ ...fieldsValue, page: {} });
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
    const {
      dispatch,
      serviceCollect: { serviceValueSetList = [] },
    } = this.props;
    if (record.serviceId) {
      dispatch({
        type: 'serviceCollect/fetchServiceCollectDetail',
        payload: { serviceId: record.serviceId },
      });
    } else {
      dispatch({
        type: 'serviceCollect/updateState',
        payload: { serviceCollectDetail: {} },
      });
    }
    if (Array.isArray(serviceValueSetList) && serviceValueSetList.length === 0) {
      dispatch({
        type: 'serviceCollect/fetchValueSet',
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
      type: 'serviceCollect/deleteServiceCollect',
      payload: record,
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchServiceCollectList();
      }
    });
  }

  /**
   * handlePagination - 分页设置
   * @param {object} pagination - 分页对象
   */
  @Bind()
  handlePagination(pagination) {
    this.fetchServiceCollectList({ page: pagination });
  }

  /**
   * 保存服务汇总
   */
  @Bind()
  handleSaveServiceCollect(fieldsValue) {
    const {
      dispatch,
      serviceCollect: { serviceCollectDetail = {} },
    } = this.props;
    const {
      serviceCode,
      serviceName,
      sourceKey,
      serviceLogo,
      appSourceCode,
      appSourceId,
      appSourceName,
      ...other
    } = fieldsValue;
    const params = serviceCollectDetail.serviceId
      ? {
          ...serviceCollectDetail,
          serviceCode,
          serviceName,
          sourceKey,
          serviceLogo,
          appSourceCode,
          appSourceId,
          appSourceName,
          config: other,
        }
      : {
          serviceCode,
          serviceName,
          sourceKey,
          serviceLogo,
          appSourceCode,
          appSourceId,
          appSourceName,
          config: other,
          enabledFlag: 1,
        };
    dispatch({
      type: `serviceCollect/${
        serviceCollectDetail.serviceId !== undefined
          ? 'updateServiceCollect'
          : 'createServiceCollect'
      }`,
      payload: params,
    }).then(res => {
      if (res) {
        this.hideModal();
        notification.success();
        this.fetchServiceCollectList();
      }
    });
  }

  render() {
    const {
      fetchLoading = false,
      updateLoading = false,
      createLoading = false,
      fetchDetailLoading = false,
      serviceCollect: {
        serviceCollectList = [],
        pagination = {},
        serviceCollectDetail = {},
        serviceValueSetList = [],
      },
    } = this.props;
    const { modalVisible } = this.state;
    const columns = [
      {
        title: intl.get('hsgp.serviceCollect.model.serviceCollect.serviceLogo').d('服务图片'),
        width: 100,
        dataIndex: 'serviceLogo',
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
        title: intl.get('hsgp.common.model.common.appSourceName').d('应用来源'),
        dataIndex: 'appSourceName',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 180,
        render: (val, record) => {
          return (
            <span className="action-link">
              <Link
                to={`/hsgp/service-collect/version/${record.serviceId}/${record.serviceCode}/${
                  record.sourceKey
                }`}
              >
                {intl.get('hsgp.serviceCollect.view.message.title.version.title').d('版本管理')}
              </Link>
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
        <Header title={intl.get('hsgp.serviceCollect.view.message.title').d('服务汇总')}>
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
            dataSource={serviceCollectList}
            columns={columns}
            scroll={{ x: tableScrollWidth(columns) }}
            pagination={pagination}
            onChange={this.handlePagination}
          />
          <UpdateDrawer
            title={
              serviceCollectDetail.serviceId
                ? intl.get('hsgp.serviceCollect.view.message.title.editor.edit').d('编辑服务')
                : intl.get('hsgp.serviceCollect.view.message.title.editor.create').d('新建服务')
            }
            initLoading={fetchDetailLoading}
            loading={serviceCollectDetail.serviceId !== undefined ? updateLoading : createLoading}
            modalVisible={modalVisible}
            serviceValueSetList={serviceValueSetList}
            initData={serviceCollectDetail}
            onCancel={this.hideModal}
            onOk={this.handleSaveServiceCollect}
          />
        </Content>
      </React.Fragment>
    );
  }
}
