import React from 'react';
import { connect } from 'dva';
import { Table, Popconfirm, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { Content, Header } from 'components/Page';

import { dateTimeRender } from 'utils/renderer';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { tableScrollWidth } from 'utils/utils';

import Drawer from './Drawer';

@connect(({ loading, versionManage }) => ({
  versionManage,
  fetchLoading: loading.effects['versionManage/fetchVersionManageList'],
  fetchDetailLoading: loading.effects['versionManage/fetchVersionManageDetail'],
  createLoading: loading.effects['versionManage/createVersionManage'],
  updateLoading: loading.effects['versionManage/updateVersionManage'],
}))
export default class VersionManage extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      versionModalVisible: false,
    };
  }

  componentDidMount() {
    this.fetchVersionManageList();
  }

  fetchVersionManageList(params = {}) {
    const {
      dispatch,
      versionManage: { pagination = {} },
      match,
    } = this.props;
    const {
      params: { serviceId },
    } = match;
    return dispatch({
      type: 'versionManage/fetchVersionManageList',
      payload: { page: pagination, serviceId, ...params },
    });
  }

  /**
   * 控制modal显示与隐藏
   * @param {boolean}} flag 是否显示modal
   */
  handleModalVisible(flag) {
    this.setState({ versionModalVisible: flag });
  }

  /**
   * 显示编辑模态框
   * @param {object} record - 编辑的行数据
   */
  @Bind()
  showModal(record = {}) {
    const { dispatch, match } = this.props;
    const {
      params: { serviceId, sourceKey },
    } = match;
    if (sourceKey === 'choerodon') {
      dispatch({
        type: 'versionManage/queryAppVersionList',
        payload: { serviceId },
      });
    }
    if (record.serviceVersionId) {
      dispatch({
        type: 'versionManage/fetchVersionManageDetail',
        payload: { serviceVersionId: record.serviceVersionId, serviceId },
      });
    } else {
      dispatch({
        type: 'versionManage/updateState',
        payload: { versionManageDetail: {} },
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

  /**
   * 删除版本
   * @param {object} record - 编辑的行数据
   */
  @Bind()
  handleDeleteVersion(record = {}) {
    const { dispatch, match } = this.props;
    const {
      params: { serviceId },
    } = match;
    dispatch({
      type: 'versionManage/deleteVersionManage',
      payload: { ...record, serviceId },
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchVersionManageList();
      }
    });
  }

  @Bind()
  handleUpdateVersion(fieldsValue) {
    const {
      dispatch,
      match,
      versionManage: { versionManageDetail = {} },
    } = this.props;
    const {
      params: { serviceId },
    } = match;
    const { versionNumber, metaVersion, releaseDate, updateLog, ...other } = fieldsValue;
    const params = versionManageDetail.serviceVersionId
      ? {
          ...versionManageDetail,
          versionNumber,
          metaVersion,
          releaseDate,
          updateLog,
          config: other,
          serviceId,
        }
      : { versionNumber, metaVersion, releaseDate, updateLog, config: other, serviceId };
    dispatch({
      type: `versionManage/${
        versionManageDetail.serviceVersionId !== undefined
          ? 'updateVersionManage'
          : 'createVersionManage'
      }`,
      payload: params,
    }).then(res => {
      if (res) {
        notification.success();
        this.hideModal();
        this.fetchVersionManageList();
      }
    });
  }

  render() {
    const {
      fetchLoading = false,
      createLoading = false,
      updateLoading = false,
      fetchDetailLoading = false,
      versionManage: {
        versionManageList = [],
        versionManageDetail = {},
        releaseDateValidator = '',
        pagination = {},
        appVersionList = [],
      },
      match,
      match: {
        params: { serviceName },
      },
    } = this.props;
    const { versionModalVisible } = this.state;
    const drawerProps = {
      match,
      releaseDateValidator,
      title:
        versionManageDetail.serviceVersionId !== undefined
          ? intl.get('hsgp.serviceCollect.view.message.title.version.edit').d('编辑版本')
          : intl.get('hsgp.serviceCollect.view.message.title.version.create').d('新建版本'),
      modalVisible: versionModalVisible,
      initData: versionManageDetail,
      initLoading: fetchDetailLoading,
      appVersionList,
      loading: versionManageDetail.serviceVersionId !== undefined ? updateLoading : createLoading,
      onCancel: this.hideModal,
      onOk: this.handleUpdateVersion,
    };
    const columns = [
      {
        title: intl.get('hsgp.common.model.common.versionNumber').d('版本号'),
        width: 150,
        dataIndex: 'versionNumber',
      },
      {
        title: intl.get('hsgp.serviceCollect.model.serviceCollect.mateVersion').d('标记版本'),
        width: 150,
        dataIndex: 'metaVersion',
      },
      {
        title: intl.get('hsgp.serviceCollect.model.serviceCollect.updateLog').d('更新日志'),
        dataIndex: 'updateLog',
      },
      {
        title: intl.get('hsgp.common.model.common.releaseDate').d('发布时间'),
        width: 150,
        dataIndex: 'releaseDate',
        render: dateTimeRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 110,
        render: (text, record) => {
          return (
            <span className="action-link">
              <a onClick={() => this.showModal(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
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
        <Header
          title={`${serviceName}-${intl
            .get('hsgp.serviceCollect.view.message.title.version.title')
            .d('版本管理')}`}
          backPath="/hsgp/service-collect/list"
        >
          <Button type="primary" icon="plus" onClick={this.showModal}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <Table
            bordered
            rowKey="serviceVersionId"
            initLoading={fetchDetailLoading}
            loading={fetchLoading}
            dataSource={versionManageList}
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
